const BorrowRecord = require('../models/BorrowRecord.js');
const Book = require('../models/Book');
const User = require('../models/User');
const Librarian = require('../models/Librarian');

const borrowBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findById(bookId);

    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (!book.availabilityStatus) return res.status(400).json({ message: 'Book is not available' });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days borrow period

    const record = await BorrowRecord.create({
      user: req.user._id,
      book: bookId,
      dueDate,
    });

    book.availabilityStatus = false;
    await book.save();

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const returnBook = async (req, res) => {
  try {
    const { rating } = req.body;
    const record = await BorrowRecord.findById(req.params.id);

    if (!record) return res.status(404).json({ message: 'Record not found' });

    if (record.status === 'returned') return res.status(400).json({ message: 'Book already returned' });

    const isStudent = req.user?.role === 'student';

    if (isStudent) {
      if (!record.user || record.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only return your own borrowed books' });
      }

      if (rating === undefined || rating === null) {
        return res.status(400).json({ message: 'Rating is required when student returns a book' });
      }

      const numericRating = Number(rating);
      if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
      }

      record.rating = numericRating;
    }

    record.status = 'returned';
    record.returnDate = new Date();
    await record.save();

    const book = await Book.findById(record.book);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (isStudent) {
      const score = Number(record.rating || 0);
      book.totalRatingScore = (book.totalRatingScore || 0) + score;
      book.ratingsCount = (book.ratingsCount || 0) + 1;
      book.averageRating = Number((book.totalRatingScore / book.ratingsCount).toFixed(2));
    }

    book.availabilityStatus = true;
    await book.save();

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserBorrows = async (req, res) => {
  try {
    const records = await BorrowRecord.find({ user: req.user._id }).populate('book');
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllBorrows = async (req, res) => {
  try {
    const records = await BorrowRecord.find().populate('book').lean();

    const recordsWithUsers = await Promise.all(
      records.map(async (record) => {
        const userId = record.user;
        let borrower = await User.findById(userId).select('name email role').lean();

        if (!borrower) {
          borrower = await Librarian.findById(userId).select('name email').lean();
          if (borrower) {
            borrower.role = 'librarian';
          }
        }

        return {
          ...record,
          user: borrower || null,
        };
      })
    );

    res.json(recordsWithUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { borrowBook, returnBook, getUserBorrows, getAllBorrows };
