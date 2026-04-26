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

const deleteStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') return res.status(404).json({ message: 'Student not found' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteLibrarian = async (req, res) => {
  try {
    const librarian = await Librarian.findById(req.params.id);
    if (!librarian) return res.status(404).json({ message: 'Librarian not found' });
    await Librarian.findByIdAndDelete(req.params.id);
    res.json({ message: 'Librarian deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStudents, getLibrarians, deleteStudent, deleteLibrarian };
