const express = require('express');
const router = express.Router();
const { borrowBook, returnBook, getUserBorrows, getAllBorrows } = require('../controllers/borrowController');
const { protect, librarianOrAdmin } = require('../middleware/auth');

router.route('/').post(protect, borrowBook).get(protect, librarianOrAdmin, getAllBorrows);
router.route('/myrecords').get(protect, getUserBorrows);
router.route('/:id/return').put(protect, returnBook);

module.exports = router;
