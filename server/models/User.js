
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    // New concession fields
    concessionType: {
      type: String,
      enum: ['general', 'student', 'child', 'women', 'elderly', 'disabled'],
      default: 'general'
    },
    dateOfBirth: { type: Date },
    gender: { 
      type: String,
      enum: ['male', 'female', 'other']
    },
    governmentIdType: {
      type: String,
      enum: ['aadhaar', 'pan', 'student_id', 'driving_license', 'voter_id']
    },
    governmentIdNumber: { 
      type: String, 
      sparse: true 
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'expired'],
      default: 'pending'
    },
    verificationDocuments: [String],
    verificationDate: Date,
    documentExpiryDate: Date,
    verificationNotes: String
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
