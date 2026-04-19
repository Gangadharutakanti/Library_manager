const express = require('express');
const router = express.Router();
const { getStudents, getLibrarians } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.get('/students', protect, admin, getStudents);
router.get('/librarians', protect, admin, getLibrarians);

module.exports = router;
