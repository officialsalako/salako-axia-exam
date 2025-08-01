// models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  content: {
    type: String,
    required: true,
    minlength: 10
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['Technology', 'Sports', 'Entertainment', 'News', 'Education', 'Other'],
    default: 'Other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better search performance
postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ author: 1 });
postSchema.index({ createdAt: -1 });

export default mongoose.model('Post', postSchema);