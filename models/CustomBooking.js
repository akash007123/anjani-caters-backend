const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true,
    maxlength: [200, 'Menu item name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, 'Quantity must be at least 1']
  },
  unit: {
    type: String,
    default: 'plate',
    enum: ['plate', 'kg', 'piece', 'liter', 'serve', 'unit']
  }
});

const customBookingSchema = new mongoose.Schema({
  // Client Information
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    maxlength: [100, 'Client name cannot exceed 100 characters']
  },
  clientEmail: {
    type: String,
    required: [true, 'Client email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  clientMobile: {
    type: String,
    required: [true, 'Client mobile is required'],
    trim: true,
    maxlength: [20, 'Mobile number cannot exceed 20 characters']
  },
  
  // Event Details
  eventDate: {
    type: Date,
    required: [true, 'Event date is required']
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true,
    maxlength: [200, 'Venue name cannot exceed 200 characters']
  },
  venueAddress: {
    type: String,
    required: [true, 'Venue address is required'],
    trim: true,
    maxlength: [500, 'Venue address cannot exceed 500 characters']
  },
  
  // Payment Details
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  advanceAmount: {
    type: Number,
    default: 0,
    min: [0, 'Advance amount cannot be negative']
  },
  
  // Menu Items
  menu: [menuItemSchema],
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  }
}, {
  timestamps: true
});

// Index for faster queries
customBookingSchema.index({ status: 1, createdAt: -1 });
customBookingSchema.index({ eventDate: 1 });
customBookingSchema.index({ clientEmail: 1 });
customBookingSchema.index({ clientMobile: 1 });

// Virtual for remaining amount
customBookingSchema.virtual('remainingAmount').get(function() {
  return this.totalAmount - this.advanceAmount;
});

// Ensure virtuals are included in JSON output
customBookingSchema.set('toJSON', { virtuals: true });
customBookingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CustomBooking', customBookingSchema);
