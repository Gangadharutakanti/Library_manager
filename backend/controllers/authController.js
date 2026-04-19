const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Librarian = require('../models/Librarian');
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require('../config/constants');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const Model = role === 'librarian' ? Librarian : User;
    
    const userExists = await Model.findOne({ email });

    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userObj = {
      name,
      email,
      password: hashedPassword,
    };
    if (role !== 'librarian') {
      userObj.role = role ;
    }

    const user = await Model.create(userObj);

    if (user) {
      const assignedRole = role === 'librarian' ? 'librarian' : user.role;
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: assignedRole,
        token: generateToken(user._id, assignedRole),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (role === 'admin') {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        return res.json({
          _id: 'admin',
          name: 'Administrator',
          email: ADMIN_EMAIL,
          role: 'admin',
          token: generateToken('admin', 'admin'),
        });
      } else {
        return res.status(401).json({ message: 'Invalid Admin credentials' });
      }
    }

    const Model = role === 'librarian' ? Librarian : User;
    const user = await Model.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const userRole = role === 'librarian' ? 'librarian' : user.role;
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: userRole,
        token: generateToken(user._id, userRole),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };
