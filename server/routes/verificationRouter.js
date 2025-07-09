
import express from 'express';
import User from '../models/User.js';
import Verification from '../models/Verification.js';
import { connect } from '../utils/mongoConnect.js';

const router = express.Router();

// Upload verification document
router.post('/upload', async (req, res) => {
  try {
    await connect();
    
    const { userId, documentType, documentUrl, extractedData } = req.body;
    
    if (!userId || !documentType || !documentUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Creating verification document:', { userId, documentType, extractedData });
    
    const verification = new Verification({
      userId,
      documentType,
      documentUrl,
      extractedData: extractedData || {},
      status: 'pending',
      submittedAt: new Date()
    });
    
    await verification.save();
    console.log('Verification document saved:', verification._id);
    
    // Update user's verification status and related fields
    const updateData = {
      verificationStatus: 'pending',
      $push: { verificationDocuments: documentUrl },
      governmentIdType: documentType
    };

    // Add extracted data to user profile if available
    if (extractedData) {
      if (extractedData.dateOfBirth) {
        updateData.dateOfBirth = new Date(extractedData.dateOfBirth);
      }
      if (extractedData.gender) {
        updateData.gender = extractedData.gender.toLowerCase();
      }
      if (extractedData.documentNumber) {
        updateData.governmentIdNumber = extractedData.documentNumber;
      }
    }
    
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: userId },
      updateData,
      { new: true, upsert: true }
    );
    
    console.log('User updated after verification upload:', updatedUser.clerkId);
    
    res.json({ 
      success: true, 
      verificationId: verification._id,
      message: 'Document uploaded successfully and is pending review'
    });
  } catch (error) {
    console.error('Verification upload error:', error);
    res.status(500).json({ error: 'Failed to upload verification document' });
  }
});

// Get verification status
router.get('/status/:userId', async (req, res) => {
  try {
    await connect();
    
    const { userId } = req.params;
    console.log('Fetching verification status for user:', userId);
    
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const verifications = await Verification.find({ userId }).sort({ submittedAt: -1 });
    
    const response = {
      verificationStatus: user.verificationStatus || 'pending',
      concessionType: user.concessionType || 'general',
      verifications,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      governmentIdType: user.governmentIdType,
      verificationDate: user.verificationDate,
      documentExpiryDate: user.documentExpiryDate,
      verificationNotes: user.verificationNotes
    };
    
    console.log('Verification status response:', response);
    res.json(response);
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({ error: 'Failed to get verification status' });
  }
});

// Update user concession data
router.post('/update-concession', async (req, res) => {
  try {
    await connect();
    
    const { userId, concessionData } = req.body;
    
    if (!userId || !concessionData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Updating concession for user:', userId, 'with data:', concessionData);
    
    const updateData = {
      concessionType: concessionData.concessionType || 'general',
      verificationStatus: concessionData.concessionType === 'general' ? 'verified' : 'pending'
    };
    
    // Add extracted data if available
    if (concessionData.documentData && concessionData.documentData.extractedData) {
      const { dateOfBirth, gender, documentNumber } = concessionData.documentData.extractedData;
      if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
      if (gender) updateData.gender = gender.toLowerCase();
      if (documentNumber) updateData.governmentIdNumber = documentNumber;
      if (concessionData.documentData.documentType) {
        updateData.governmentIdType = concessionData.documentData.documentType;
      }
    }

    // Set verification date if verified
    if (updateData.verificationStatus === 'verified') {
      updateData.verificationDate = new Date();
    }
    
    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      updateData,
      { new: true, upsert: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User concession updated successfully:', user.clerkId);
    res.json({ success: true, user });
  } catch (error) {
    console.error('Update concession error:', error);
    res.status(500).json({ error: 'Failed to update concession data' });
  }
});

// Admin: Get pending verifications
router.get('/admin/pending', async (req, res) => {
  try {
    await connect();
    
    const pendingVerifications = await Verification.find({ status: 'pending' })
      .sort({ submittedAt: 1 })
      .populate('userId', 'firstName lastName email');
    
    res.json(pendingVerifications);
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    res.status(500).json({ error: 'Failed to fetch pending verifications' });
  }
});

// Admin: Approve/Reject verification
router.post('/admin/review/:verificationId', async (req, res) => {
  try {
    await connect();
    
    const { verificationId } = req.params;
    const { status, reviewNotes, adminReviewerId } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const verification = await Verification.findByIdAndUpdate(
      verificationId,
      {
        status,
        reviewNotes,
        adminReviewerId,
        reviewedAt: new Date()
      },
      { new: true }
    );
    
    if (!verification) {
      return res.status(404).json({ error: 'Verification not found' });
    }
    
    // Update user verification status
    const userUpdateData = {
      verificationStatus: status === 'approved' ? 'verified' : 'rejected',
      verificationNotes: reviewNotes
    };
    
    if (status === 'approved') {
      userUpdateData.verificationDate = new Date();
    }
    
    await User.findOneAndUpdate(
      { clerkId: verification.userId },
      userUpdateData
    );
    
    res.json({ success: true, verification });
  } catch (error) {
    console.error('Error reviewing verification:', error);
    res.status(500).json({ error: 'Failed to review verification' });
  }
});

export default router;
