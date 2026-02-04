const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Event Details
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: ['wedding', 'engagement', 'corporate', 'birthday', 'religious', 'anniversary', 'other']
  },
  guestCount: {
    type: Number,
    required: [true, 'Guest count is required'],
    min: [1, 'Guest count must be at least 1']
  },
  
  // Date & Time
  eventDate: {
    type: Date,
    required: [true, 'Event date is required']
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
    enum: ['morning', 'afternoon', 'evening', 'night']
  },
  budget: {
    type: String,
    enum: ['1-3', '3-5', '5-10', '10-20', '20+']
  },
  
  // Contact Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  preferredContact: {
    type: String,
    enum: ['whatsapp', 'phone', 'email'],
    default: 'whatsapp'
  },
  specialRequirements: {
    type: String,
    trim: true,
    maxlength: [2000, 'Special requirements cannot exceed 2000 characters']
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['new', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'new'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  followUpDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ eventDate: 1 });
bookingSchema.index({ email: 1 });
bookingSchema.index({ phone: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
