const Settings = require('../models/Settings');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Private/Admin
const getSettings = async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    try {
        const settings = await Settings.findOne();

        // Update fields based on request body
        // This is a deep merge or specific field update
        if (req.body.general) settings.general = { ...settings.general, ...req.body.general };
        if (req.body.contact) settings.contact = { ...settings.contact, ...req.body.contact };
        if (req.body.email) settings.email = { ...settings.email, ...req.body.email };
        if (req.body.quotes) settings.quotes = { ...settings.quotes, ...req.body.quotes };
        if (req.body.system) settings.system = { ...settings.system, ...req.body.system };

        const updatedSettings = await settings.save();

        // Log activity
        await ActivityLog.create({
            user: req.user._id,
            action: 'UPDATE_SETTINGS',
            details: 'Updated system settings',
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.json({ success: true, data: updatedSettings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get activity logs
// @route   GET /api/settings/logs
// @access  Private/Admin
const getActivityLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find()
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({ success: true, data: logs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getSettings,
    updateSettings,
    getActivityLogs
};
