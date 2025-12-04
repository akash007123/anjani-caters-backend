const mongoose = require("mongoose");

const QuoteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    eventType: { type: String, required: true },
    eventDate: { type: String, required: true },
    guestCount: { type: String, required: true },
    venue: { type: String },
    budget: { type: String },
    requirements: { type: String },
    status: { 
      type: String, 
      enum: ['pending', 'reviewed', 'quoted', 'confirmed', 'completed', 'cancelled'], 
      default: 'pending' 
    },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'urgent'], 
      default: 'medium' 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quote", QuoteSchema);