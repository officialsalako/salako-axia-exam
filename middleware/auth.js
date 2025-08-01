// middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Check if user is logged in
async function authenticate(req, res, next) {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Access denied.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token. Access denied.'
    });
  }
}

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required.' 
    });
  }
};

// Check if user owns the resource or is admin
const isOwnerOrAdmin = (req, res, next) => {
  if (req.user && (req.user._id.toString() === req.params.id || req.user.isAdmin)) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied. You can only access your own resources.' 
    });
  }
};

module.exports = {
  authenticate,
  isAdmin,
  isOwnerOrAdmin
};