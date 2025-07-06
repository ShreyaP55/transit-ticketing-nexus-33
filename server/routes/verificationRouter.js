
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
    
    const verification = new Verification({
      userId,
      documentType,
      documentUrl,
      extractedData,
      status: 'pending'
    });
    
    await verification.save();
    
    // Update user's verification status
    await User.findOneAndUpdate(
      { clerkId: userId },
      { 
        verificationStatus: 'pending',
        $push: { verificationDocuments: documentUrl }
      }
    );
    
    res.json({ success: true, verificationId: verification._id });
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
    
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const verifications = await Verification.find({ userId }).sort({ submittedAt: -1 });
    
    res.json({
      verificationStatus: user.verificationStatus,
      concessionType: user.concessionType,
      verifications
    });
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
    
    const updateData = {
      concessionType: concessionData.concessionType || 'general',
      verificationStatus: concessionData.concessionType === 'general' ? 'verified' : 'pending'
    };
    
    // Add extracted data if available
    if (concessionData.documentData && concessionData.documentData.extractedData) {
      const { dateOfBirth, gender } = concessionData.documentData.extractedData;
      if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
      if (gender) updateData.gender = gender.toLowerCase();
    }
    
    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      updateData,
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Update concession error:', error);
    res.status(500).json({ error: 'Failed to update concession data' });
  }
});

export default router;
