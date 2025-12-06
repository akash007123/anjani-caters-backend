const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['New', 'Pending', 'Resolved'], 
      default: 'New' 
    },
    priority: { 
      type: String, 
      enum: ['Low', 'Medium', 'High'], 
      default: 'Medium' 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", ContactSchema);
