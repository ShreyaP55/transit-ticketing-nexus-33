
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['topup', 'fare_deduction', 'stripe_topup'], 
    required: true 
  },
  stripeSessionId: { type: String, default: null },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
