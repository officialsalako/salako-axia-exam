// models/KYC.js
import mongoose from ('mongoose');

const kycSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One to one relationship
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  middleName: {
    type: String,
    trim: true
  },
  nationality: {
    type: String,
    required: true
  },
  idType: {
    type: String,
    required: true,
    enum: ['National ID', 'Passport', 'Drivers License', 'Voters Card']
  },
  idNumber: {
    type: String,
    required: true,
    unique: true
  },
  idExpiryDate: {
    type: Date,
    required: true
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    }
  },
  occupation: {
    type: String,
    required: true
  },
  income: {
    type: String,
    enum: ['Below 50k', '50k-100k', '100k-500k', '500k-1M', 'Above 1M']
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  },
  documentsUploaded: {
    idFront: String,
    idBack: String,
    proofOfAddress: String,
    passport: String
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  }
}, {
  timestamps: true
});

// Index for better query performance
kycSchema.index({ user: 1 });
kycSchema.index({ verificationStatus: 1 });
kycSchema.index({ idNumber: 1 });

module.exports = mongoose.model('KYC', kycSchema);