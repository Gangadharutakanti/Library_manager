const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');

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
    const record = await BorrowRecord.findById(req.params.id);
    
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (record.status === 'returned') return res.status(400).json({ message: 'Book already returned' });

    record.status = 'returned';
    record.returnDate = new Date();
    await record.save();

    const book = await Book.findById(record.book);
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
    const records = await BorrowRecord.find().populate('user', 'name email').populate('book');
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { borrowBook, returnBook, getUserBorrows, getAllBorrows };
