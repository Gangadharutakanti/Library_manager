const express = require('express');
const router = express.Router();
const {
  getBooks,
  getMostViewedBooks,
  getBookById,
  incrementBookView,
  createBook,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');
const { protect, librarianOrAdmin } = require('../middleware/auth');

router.route('/')
  .get(getBooks)
  .post(protect, librarianOrAdmin, createBook);

router.get('/most-viewed', getMostViewedBooks);
router.put('/:id/view', incrementBookView);

router.route('/:id')
  .get(getBookById)
  .put(protect, librarianOrAdmin, updateBook)
  .delete(protect, librarianOrAdmin, deleteBook);

module.exports = router;
