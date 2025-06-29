// controllers/kycController.js
const KYC = require('../models/kyc');
const User = require('../models/User');

// Submit KYC information
const submitKYC = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      firstName,
      lastName,
      middleName,
      nationality,
      idType,
      idNumber,
      idExpiryDate,
      address,
      occupation,
      income
    } = req.body;

    // Check if user already has KYC
    const existingKYC = await KYC.findOne({ user: userId });
    if (existingKYC) {
      return res.status(400).json({
        success: false,
        message: 'KYC already submitted for this user'
      });
    }

    // Check if ID number already exists
    const existingIdNumber = await KYC.findOne({ idNumber });
    if (existingIdNumber) {
      return res.status(400).json({
        success: false,
        message: 'This ID number is already registered'
      });
    }

    const kyc = await KYC.create({
      user: userId,
      firstName,
      lastName,
      middleName,
      nationality,
      idType,
      idNumber,
      idExpiryDate,
      address,
      occupation,
      income
    });

    await kyc.populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'KYC submitted successfully. Your documents are under review.',
      data: kyc
    });
  } catch (error) {
    console.error('Submit KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting KYC',
      error: error.message
    });
  }
};

// Get user's KYC information
const getUserKYC = async (req, res) => {
  try {
    const userId = req.user._id;

    const kyc = await KYC.findOne({ user: userId })
      .populate('user', 'name email phone')
      .populate('verifiedBy', 'name email');

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: 'No KYC information found for this user'
      });
    }

    res.status(200).json({
      success: true,
      message: 'KYC information retrieved successfully',
      data: kyc
    });
  } catch (error) {
    console.error('Get user KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching KYC information',
      error: error.message
    });
  }
};

// Get all KYC submissions (Admin only)
const getAllKYC = async (req, res) => {
  try {
    const status = req.query.status;
    const filter = status ? { verificationStatus: status } : {};

    const kycList = await KYC.find(filter)
      .populate('user', 'name email phone')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'KYC submissions retrieved successfully',
      count: kycList.length,
      data: kycList
    });
  } catch (error) {
    console.error('Get all KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching KYC submissions',
      error: error.message
    });
  }
};

// Update KYC information
const updateKYC = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    // Don't allow updating verification status through this route
    delete updates.verificationStatus;
    delete updates.verifiedBy;
    delete updates.verifiedAt;

    const kyc = await KYC.findOne({ user: userId });

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: 'No KYC information found for this user'
      });
    }

    // Only allow updates if KYC is not verified
    if (kyc.verificationStatus === 'Verified') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update verified KYC information'
      });
    }

    const updatedKYC = await KYC.findByIdAndUpdate(
      kyc._id,
      { ...updates, verificationStatus: 'Pending' },
      { new: true, runValidators: true }
    ).populate('user', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'KYC information updated successfully',
      data: updatedKYC
    });
  } catch (error) {
    console.error('Update KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating KYC information',
      error: error.message
    });
  }
};

// Verify KYC (Admin only)
const verifyKYC = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const adminId = req.user._id;

    if (!['Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status. Must be "Verified" or "Rejected"'
      });
    }

    if (status === 'Rejected' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting KYC'
      });
    }

    const updateData = {
      verificationStatus: status,
      verifiedBy: adminId,
      verifiedAt: new Date()
    };

    if (status === 'Rejected') {
      updateData.rejectionReason = rejectionReason;
    }

    const kyc = await KYC.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('user', 'name email phone')
      .populate('verifiedBy', 'name email');

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: 'KYC record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `KYC ${status.toLowerCase()} successfully`,
      data: kyc
    });
  } catch (error) {
    console.error('Verify KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying KYC',
      error: error.message
    });
  }
};

// Delete KYC (Admin only)
const deleteKYC = async (req, res) => {
  try {
    const { id } = req.params;

    const kyc = await KYC.findByIdAndDelete(id);

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: 'KYC record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'KYC record deleted successfully'
    });
  } catch (error) {
    console.error('Delete KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting KYC record',
      error: error.message
    });
  }
};

module.exports = {
  submitKYC,
  getUserKYC,
  getAllKYC,
  updateKYC,
  verifyKYC,
  deleteKYC
};