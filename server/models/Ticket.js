
import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: "Route", required: true },
    busId: { type: mongoose.Schema.Types.ObjectId, ref: "Bus", required: true },
    startStation: { type: String, required: true },
    endStation: { type: String, required: true },
    price: { type: Number, required: true },
    paymentIntentId: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['active', 'expired', 'used', 'cancelled'], 
      default: 'active' 
    },
    usageCount: { type: Number, default: 0 },
    maxUsage: { type: Number, default: 1 },
    expiryDate: { 
      type: Date, 
      required: true,
      default: function() {
        // Set expiry to 12 hours from creation
        return new Date(Date.now() + 12 * 60 * 60 * 1000);
      }
    },
    lastUsed: { type: Date },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'paid', 'failed'], 
      default: 'pending' 
    }
  },
  { timestamps: true }
);

// Check if ticket is expired
TicketSchema.methods.isExpired = function() {
  return new Date() > this.expiryDate;
};

// Check if ticket is valid for use
TicketSchema.methods.isValid = function() {
  return this.status === 'active' && 
         !this.isExpired() && 
         this.usageCount < this.maxUsage &&
         this.paymentStatus === 'paid';
};

// Use the ticket
TicketSchema.methods.use = function() {
  if (!this.isValid()) {
    throw new Error('Ticket is not valid for use');
  }
  
  this.usageCount += 1;
  this.lastUsed = new Date();
  
  if (this.usageCount >= this.maxUsage) {
    this.status = 'used';
  }
  
  return this.save();
};

// Mark ticket as expired
TicketSchema.methods.markExpired = function() {
  this.status = 'expired';
  return this.save();
};

// Auto-expire tickets on query (middleware)
TicketSchema.pre(/^find/, function() {
  // Update expired tickets
  this.updateMany(
    { 
      expiryDate: { $lt: new Date() }, 
      status: 'active' 
    },
    { 
      $set: { status: 'expired' } 
    }
  );
});

// Index for efficient queries
TicketSchema.index({ userId: 1, status: 1 });
TicketSchema.index({ expiryDate: 1 });
TicketSchema.index({ paymentIntentId: 1 });

// Check if the model exists before creating a new one
const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
export default Ticket;
