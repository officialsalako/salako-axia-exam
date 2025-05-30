const express = require('express');
const router = express.Router();
const {
  createUser,
  loginUser,
  getAllUsers,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// PUBLIC ROUTES (anyone can access)
router.post('/register', createUser);  // Create a new user account
router.post('/login', loginUser);      // Login to existing account

// PROTECTED ROUTES (need to be logged in)
router.get('/', authenticate, getAllUsers);           // Get all users (logged in users only)
router.put('/:id', authenticate, updateUser);         // Update a user (logged in users only)
router.delete('/:id', authenticate, deleteUser);      // Delete a user (logged in users only)

// ADMIN ONLY ROUTES (need to be admin)
// router.get('/admin/all', authenticate, requireAdmin, getAllUsers); // Example admin-only route

module.exports = router;