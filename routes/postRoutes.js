// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getPostById,
  getUserPosts,
  updatePost,
  deletePost,
  toggleLikePost,
  addComment
} = require('../controllers/postController');

const { authenticate, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.get('/user/:userId', getUserPosts);

// Protected routes (authentication required)
router.post('/', authenticate, createPost);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);
router.post('/:id/like', authenticate, toggleLikePost);
router.post('/:id/comment', authenticate, addComment);

module.exports = router;