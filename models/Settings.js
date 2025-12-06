const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    general: {
        websiteName: { type: String, default: 'Anjani Caters' },
        primaryColor: { type: String, default: '#e11d48' }, // Default rose-600
        timezone: { type: String, default: 'Asia/Kolkata' },
        dateFormat: { type: String, default: 'DD/MM/YYYY' },
        currency: { type: String, default: 'INR' }
    },
    contact: {
        defaultPriority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
        autoReply: { type: Boolean, default: true },
        autoReplyMessage: { type: String, default: 'Thank you for contacting us. We will get back to you shortly.' }
    },
    email: {
        smtpHost: { type: String, default: '' },
        smtpPort: { type: String, default: '587' },
        smtpUser: { type: String, default: '' },
        smtpPass: { type: String, default: '' },
        fromEmail: { type: String, default: '' }
    },
    quotes: {
        defaultStatus: { type: String, default: 'pending' },
        taxPercentage: { type: Number, default: 18 },
        serviceChargePercentage: { type: Number, default: 5 }
    },
    system: {
        maintenanceMode: { type: Boolean, default: false },
        allowRegistration: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
    const settings = await this.findOne();
    if (settings) return settings;
    return await this.create({});
};

module.exports = mongoose.model('Settings', settingsSchema);
