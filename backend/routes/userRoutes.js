const express = require('express');
const router = express.Router();
const { getStudents, getLibrarians, deleteStudent, deleteLibrarian } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.get('/students', protect, admin, getStudents);
router.get('/librarians', protect, admin, getLibrarians);
router.delete('/students/:id', protect, admin, deleteStudent);
router.delete('/librarians/:id', protect, admin, deleteLibrarian);

module.exports = router;
