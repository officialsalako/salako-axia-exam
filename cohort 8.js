// Import all the packages we need
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Import our routes
const userRoutes = require('./routes/userRoutes');

// Load environment variables from .env file
dotenv.config();

// Create Express application
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully!');
  })
  .catch((error) => {
    console.log('❌ MongoDB connection error:', error.message);
  });

// Routes
app.use('/api/users', userRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Express User API! 🚀',
    endpoints: {
      'POST /api/users/register': 'Create a new user account',
      'POST /api/users/login': 'Login to existing account',
      'GET /api/users': 'Get all users (requires authentication)',
      'PUT /api/users/:id': 'Update a user (requires authentication)',
      'DELETE /api/users/:id': 'Delete a user (requires authentication)'
    }
  });
});

// Handle 404 errors
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Visit http://localhost:${PORT} to see the API`);
});