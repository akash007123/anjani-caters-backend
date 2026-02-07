const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  source: {
    type: String,
    default: 'exit-intent-popup'
  },
  discountCode: {
    type: String,
    default: 'WELCOME10'
  },
  discountUsed: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subscriber', subscriberSchema);
