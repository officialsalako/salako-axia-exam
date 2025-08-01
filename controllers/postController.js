// controllers/postController.js
import { create, find, countDocuments, findById, findByIdAndUpdate, findByIdAndDelete } from '../models/post.js';
import User from '../models/User.js';

// Create a new post
const createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const author = req.user._id;

    const post = await create({
      title,
      content,
      author,
      category,
      tags: tags || []
    });

    // Populate author details
    await post.populate('author', 'name email profilePicture');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating post',
      error: error.message
    });
  }
};

// Get all posts
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await find({ isPublished: true })
      .populate('author', 'name email profilePicture')
      .populate('comments.user', 'name profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await countDocuments({ isPublished: true });

    res.status(200).json({
      success: true,
      message: 'Posts retrieved successfully',
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching posts',
      error: error.message
    });
  }
};

// Get single post by ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await findById(id)
      .populate('author', 'name email profilePicture')
      .populate('comments.user', 'name profilePicture')
      .populate('likes', 'name');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count
    post.viewCount += 1;
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post retrieved successfully',
      data: post
    });
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching post',
      error: error.message
    });
  }
};

// Get posts by user
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await find({ author: userId })
      .populate('author', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'User posts retrieved successfully',
      count: posts.length,
      data: posts
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user posts',
      error: error.message
    });
  }
};

// Update post
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const post = await findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns the post or is admin
    if (post.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own posts'
      });
    }

    const updatedPost = await findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('author', 'name email profilePicture');

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating post',
      error: error.message
    });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns the post or is admin
    if (post.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }

    await findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting post',
      error: error.message
    });
  }
};

// Like/Unlike post
const toggleLikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex > -1) {
      // Unlike post
      post.likes.splice(likeIndex, 1);
    } else {
      // Like post
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: likeIndex > -1 ? 'Post unliked' : 'Post liked',
      data: {
        likes: post.likes.length,
        isLiked: likeIndex === -1
      }
    });
  } catch (error) {
    console.error('Toggle like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling like',
      error: error.message
    });
  }
};

// Add comment to post
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const post = await findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.comments.push({
      user: userId,
      text
    });

    await post.save();
    await post.populate('comments.user', 'name profilePicture');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: post.comments[post.comments.length - 1]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment',
      error: error.message
    });
  }
};

export default {
  createPost,
  getAllPosts,
  getPostById,
  getUserPosts,
  updatePost,
  deletePost,
  toggleLikePost,
  addComment
};