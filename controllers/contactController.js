const Contact = require("../models/Contact");
const { sendMail } = require("../utils/mailer");

exports.healthCheck = (req, res) => {
  res.status(200).json({ status: "online" });
};

exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Name, Email, and Message are required." });
    }

    const saved = await Contact.create({ name, email, phone, message });

    // Send email asynchronously (don't wait for it)
    sendMail({ name, email, phone, message }).catch(emailError => {
      console.error("Email sending failed:", emailError);
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully!",
      data: saved
    });

  } catch (error) {
    console.error("Error submitting contact:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin API endpoints
exports.getAllContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';

    // Build query
    let query = {};
    
    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Contact.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: "Contacts fetched successfully",
      data: {
        contacts,
        total,
        page,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contact = await Contact.findById(id);
    
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.status(200).json({
      success: true,
      message: "Contact fetched successfully",
      data: contact
    });
  } catch (error) {
    console.error("Error fetching contact:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, message, status, priority } = req.body;
    
    // Check if contact exists
    const existingContact = await Contact.findById(id);
    if (!existingContact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    // Update contact
    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(message && { message }),
        ...(status && { status }),
        ...(priority && { priority }),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: updatedContact
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['New', 'Pending', 'Resolved'].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be New, Pending, or Resolved" });
    }
    
    // Check if contact exists
    const existingContact = await Contact.findById(id);
    if (!existingContact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    // Update only the status
    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Contact status updated successfully",
      data: updatedContact
    });
  } catch (error) {
    console.error("Error updating contact status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedContact = await Contact.findByIdAndDelete(id);
    
    if (!deletedContact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.status(200).json({
      success: true,
      message: "Contact deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getContactStats = async (req, res) => {
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          new: {
            $sum: { $cond: [{ $eq: ['$status', 'New'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || { total: 0, new: 0, pending: 0, resolved: 0 };

    res.status(200).json({
      success: true,
      message: "Stats fetched successfully",
      data: result
    });
  } catch (error) {
    console.error("Error fetching contact stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
