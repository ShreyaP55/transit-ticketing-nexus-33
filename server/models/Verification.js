
import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true,
    ref: 'User'
  },
  documentType: { 
    type: String, 
    required: true,
    enum: ['aadhaar', 'pan', 'student_id', 'driving_license', 'voter_id']
  },
  documentUrl: { 
    type: String, 
    required: true 
  },
  extractedData: {
    dateOfBirth: String,
    gender: String,
    name: String,
    documentNumber: String
  },
  adminReviewerId: String,
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  reviewNotes: String,
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  reviewedAt: Date
}, { timestamps: true });

const Verification = mongoose.models.Verification || mongoose.model('Verification', verificationSchema);

export default Verification;
