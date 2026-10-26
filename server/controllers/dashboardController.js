import Book from '../models/Book.js';
import Member from '../models/Member.js';
import Transaction from '../models/Transaction.js';

// @desc    Get dashboard metrics & summary
// @route   GET /api/dashboard/stats
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalBooks,
      totalMembers,
      issuedBooksCount,
      returnedBooksCount,
      allBooks,
      recentTransactions,
    ] = await Promise.all([
      Book.countDocuments(),
      Member.countDocuments(),
      Transaction.countDocuments({ status: 'Issued' }),
      Transaction.countDocuments({ status: 'Returned' }),
      Book.find({}, 'quantity availableQuantity category'),
      Transaction.find()
        .populate('bookId', 'title author isbn')
        .populate('memberId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const totalCopies = allBooks.reduce((sum, b) => sum + (b.quantity || 0), 0);
    const availableCopies = allBooks.reduce((sum, b) => sum + (b.availableQuantity || 0), 0);

    // Group count by category
    const categoryMap = {};
    allBooks.forEach((b) => {
      const cat = b.category || 'General';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    const categoryBreakdown = Object.keys(categoryMap).map((cat) => ({
      category: cat,
      count: categoryMap[cat],
    }));

    res.status(200).json({
      success: true,
      data: {
        totalBooks,
        totalMembers,
        issuedBooks: issuedBooksCount,
        returnedBooks: returnedBooksCount,
        totalCopies,
        availableCopies,
        categoryBreakdown,
        recentTransactions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
