import Book from '../models/Book.js';
import Member from '../models/Member.js';
import Transaction from '../models/Transaction.js';

export const seedInitialData = async () => {
  try {
    const bookCount = await Book.countDocuments();
    if (bookCount > 0) {
      return; // Data already exists
    }

    console.log('[Seeder] Database is empty. Seeding initial library data...');

    const sampleBooks = [
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        category: 'Computer Science',
        isbn: '978-0132350884',
        quantity: 5,
        availableQuantity: 4,
      },
      {
        title: 'The Pragmatic Programmer: Your Journey to Mastery',
        author: 'David Thomas, Andrew Hunt',
        category: 'Computer Science',
        isbn: '978-0135957059',
        quantity: 4,
        availableQuantity: 3,
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        category: 'Fiction',
        isbn: '978-0060935467',
        quantity: 3,
        availableQuantity: 3,
      },
      {
        title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
        author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
        category: 'Computer Science',
        isbn: '978-0201633610',
        quantity: 3,
        availableQuantity: 2,
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        category: 'History',
        isbn: '978-0062316097',
        quantity: 6,
        availableQuantity: 6,
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        category: 'Self-Help',
        isbn: '978-0735211292',
        quantity: 5,
        availableQuantity: 4,
      },
      {
        title: 'Introduction to Algorithms (CLRS)',
        author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
        category: 'Computer Science',
        isbn: '978-0262033848',
        quantity: 4,
        availableQuantity: 4,
      },
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        category: 'Fiction',
        isbn: '978-0743273565',
        quantity: 4,
        availableQuantity: 4,
      },
    ];

    const createdBooks = await Book.insertMany(sampleBooks);

    const sampleMembers = [
      {
        name: 'Ramya Sri',
        email: 'ramya.sri@example.com',
        phone: '+91 98765 43210',
        membershipDate: new Date('2024-01-15'),
      },
      {
        name: 'Alex Johnson',
        email: 'alex.johnson@example.com',
        phone: '+1 555-0199',
        membershipDate: new Date('2024-02-10'),
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        phone: '+91 91234 56789',
        membershipDate: new Date('2024-03-01'),
      },
      {
        name: 'Marcus Vance',
        email: 'marcus.v@example.com',
        phone: '+44 20 7946 0958',
        membershipDate: new Date('2024-04-12'),
      },
    ];

    const createdMembers = await Member.insertMany(sampleMembers);

    // Create 3 sample transactions (2 active, 1 returned)
    const sampleTransactions = [
      {
        bookId: createdBooks[0]._id, // Clean Code
        memberId: createdMembers[0]._id, // Ramya Sri
        issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        status: 'Issued',
      },
      {
        bookId: createdBooks[1]._id, // Pragmatic Programmer
        memberId: createdMembers[1]._id, // Alex Johnson
        issueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: 'Issued',
      },
      {
        bookId: createdBooks[3]._id, // Design Patterns
        memberId: createdMembers[2]._id, // Priya Sharma
        issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'Issued',
      },
      {
        bookId: createdBooks[5]._id, // Atomic Habits
        memberId: createdMembers[3]._id, // Marcus Vance
        issueDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        returnDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'Returned',
      },
    ];

    await Transaction.insertMany(sampleTransactions);

    console.log('[Seeder] Initial seed data created successfully.');
  } catch (error) {
    console.error('[Seeder Error] Failed to seed initial data:', error.message);
  }
};
