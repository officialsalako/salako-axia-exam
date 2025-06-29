// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  createUser,
  loginUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getCurrentUser
} = require('../controllers/userController');

const { authenticate, isAdmin, isOwnerOrAdmin } = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/register', createUser);
router.post('/login', loginUser);

// Protected routes (authentication required)
router.get('/profile', authenticate, getCurrentUser);
router.get('/all', authenticate, isAdmin, getAllUsers);
router.put('/:id', authenticate, isOwnerOrAdmin, updateUser);
router.delete('/:id', authenticate, isOwnerOrAdmin, deleteUser);

module.exports = router;