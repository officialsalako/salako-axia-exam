// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  hobbies: [{
    type: String,
    trim: true
  }],
  phone: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date
  },
  profilePicture: {
    type: String,
    default: 'default-avatar.jpg'
  }
}, {
  timestamps: true
});

// Virtual for posts - one to many relationship
userSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'author'
});

// Virtual for KYC - one to one relationship
userSchema.virtual('kyc', {
  ref: 'KYC',
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

// Make sure virtual fields are included when converting to JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);