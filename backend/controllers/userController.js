const User = require('../models/User');
const Librarian = require('../models/Librarian');

// @desc    Get all students
// @route   GET /api/users/students
// @access  Private/Admin
const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all librarians
// @route   GET /api/users/librarians
// @access  Private/Admin
const getLibrarians = async (req, res) => {
  try {
    const librarians = await Librarian.find({}).select('-password');
    res.json(librarians);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStudents, getLibrarians };
