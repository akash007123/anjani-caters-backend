const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    match: [/^[0-9]{10,15}$/, 'Please provide a valid mobile number']
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  education: {
    type: String,
    trim: true,
    default: ''
  },
  profilePic: {
    type: String,
    default: ''
  },
  aadharCard: {
    type: String,
    default: ''
  },
  panCard: {
    type: String,
    default: ''
  },
  bankPassbook: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: [
      'Management',
      'Catering (Kitchen)',
      'Food Service',
      'Event Setup & Decor',
      'Logistics',
      'Sales & Client Handling',
      'Marketing & Branding',
      'Finance & Admin',
      'Security & Safety',
      'Support Staff'
    ]
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
employeeSchema.index({ email: 1 });
employeeSchema.index({ mobile: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ role: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
