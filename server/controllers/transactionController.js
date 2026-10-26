import Transaction from '../models/Transaction.js';
import Book from '../models/Book.js';
import Member from '../models/Member.js';

// @desc    Get all transactions
// @route   GET /api/transactions
export const getTransactions = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== 'All') {
      query.status = status;
    }

    const transactions = await Transaction.find(query)
      .populate('bookId', 'title author isbn category')
      .populate('memberId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Issue a book to a member
// @route   POST /api/transactions/issue
export const issueBook = async (req, res) => {
  try {
    const { bookId, memberId } = req.body;

    if (!bookId || !memberId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both book ID and member ID',
      });
    }

    // 1. Verify Member exists
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // 2. Verify Book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // 3. Check availability
    if (book.availableQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: `Book "${book.title}" is currently out of stock (0 copies available).`,
      });
    }

    // 4. Check if member already has an active issue of this same book
    const existingActiveIssue = await Transaction.findOne({
      bookId: book._id,
      memberId: member._id,
      status: 'Issued',
    });
    if (existingActiveIssue) {
      return res.status(400).json({
        success: false,
        message: `Member "${member.name}" already has an active copy of "${book.title}" issued.`,
      });
    }

    // 5. Decrement book availableQuantity
    book.availableQuantity -= 1;
    await book.save();

    // 6. Create transaction record
    const transaction = await Transaction.create({
      bookId: book._id,
      memberId: member._id,
      issueDate: new Date(),
      status: 'Issued',
    });

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('bookId', 'title author isbn category')
      .populate('memberId', 'name email phone');

    res.status(201).json({
      success: true,
      data: populatedTransaction,
      message: `Book "${book.title}" successfully issued to ${member.name}!`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Return an issued book
// @route   PUT /api/transactions/:id/return
export const returnBook = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction record not found',
      });
    }

    if (transaction.status === 'Returned') {
      return res.status(400).json({
        success: false,
        message: 'This book has already been marked as returned',
      });
    }

    // Update transaction
    transaction.status = 'Returned';
    transaction.returnDate = new Date();
    await transaction.save();

    // Increment book's available quantity
    const book = await Book.findById(transaction.bookId);
    if (book) {
      book.availableQuantity = Math.min(book.quantity, book.availableQuantity + 1);
      await book.save();
    }

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('bookId', 'title author isbn category')
      .populate('memberId', 'name email phone');

    res.status(200).json({
      success: true,
      data: populatedTransaction,
      message: `Book successfully recorded as returned!`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
