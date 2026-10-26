import Book from '../models/Book.js';
import Transaction from '../models/Transaction.js';

// @desc    Get all books (with optional search and category filter)
// @route   GET /api/books
export const getBooks = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const books = await Book.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: books.length, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single book by ID
// @route   GET /api/books/:id
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new book
// @route   POST /api/books
export const addBook = async (req, res) => {
  try {
    const { title, author, category, isbn, quantity } = req.body;

    if (!title || !author || !category || !isbn) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, author, category, and ISBN',
      });
    }

    const existingBook = await Book.findOne({ isbn: isbn.trim() });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: 'A book with this ISBN already exists',
      });
    }

    const qty = quantity !== undefined ? Number(quantity) : 1;
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid positive number',
      });
    }

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      isbn: isbn.trim(),
      quantity: qty,
      availableQuantity: qty,
    });

    res.status(201).json({ success: true, data: book, message: 'Book added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update book details
// @route   PUT /api/books/:id
export const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const { title, author, category, isbn, quantity } = req.body;

    // Check if ISBN is being changed and is already used by another book
    if (isbn && isbn.trim() !== book.isbn) {
      const existing = await Book.findOne({ isbn: isbn.trim() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Another book with this ISBN already exists',
        });
      }
      book.isbn = isbn.trim();
    }

    if (title) book.title = title.trim();
    if (author) book.author = author.trim();
    if (category) book.category = category.trim();

    if (quantity !== undefined) {
      const newQty = Number(quantity);
      if (isNaN(newQty) || newQty < 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be a valid non-negative number',
        });
      }

      // Calculate actively issued count
      const issuedCount = book.quantity - book.availableQuantity;
      if (newQty < issuedCount) {
        return res.status(400).json({
          success: false,
          message: `Cannot set total quantity to ${newQty}. There are currently ${issuedCount} copy(ies) issued out.`,
        });
      }

      book.availableQuantity = newQty - issuedCount;
      book.quantity = newQty;
    }

    await book.save();
    res.status(200).json({ success: true, data: book, message: 'Book updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Check if any copies are currently issued
    const activeIssue = await Transaction.findOne({
      bookId: book._id,
      status: 'Issued',
    });

    if (activeIssue) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete book while copies are currently issued out. Please record returns first.',
      });
    }

    await Book.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
