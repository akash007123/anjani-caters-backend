const Quote = require("../models/Quote");
const sendQuoteMail = require("../utils/quoteMailer");

exports.healthCheck = (req, res) => {
  res.status(200).json({ status: "online" });
};

exports.submitQuote = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      eventType, 
      eventDate, 
      guestCount, 
      venue, 
      budget, 
      requirements 
    } = req.body;

    if (!name || !email || !eventType || !eventDate || !guestCount) {
      return res.status(400).json({
        success: false,
        message: "Name, Email, Event Type, Event Date, and Guest Count are required."
      });
    }

    // Determine priority based on event date (closer dates are higher priority)
    const eventDateObj = new Date(eventDate);
    const today = new Date();
    const daysDiff = Math.ceil((eventDateObj - today) / (1000 * 60 * 60 * 24));
    
    let priority = 'medium';
    if (daysDiff <= 7) {
      priority = 'urgent';
    } else if (daysDiff <= 30) {
      priority = 'high';
    } else if (daysDiff >= 90) {
      priority = 'low';
    }

    const quoteData = {
      name,
      email,
      phone,
      eventType,
      eventDate,
      guestCount,
      venue,
      budget,
      requirements,
      priority
    };

    const saved = await Quote.create(quoteData);

    // Send emails asynchronously (don't wait for it)
    sendQuoteMail({
      name,
      email,
      phone,
      eventType,
      eventDate,
      guestCount,
      venue,
      budget,
      requirements,
      id: saved._id,
      priority
    }).catch(emailError => {
      console.error("Quote email sending failed:", emailError);
    });

    res.status(201).json({
      success: true,
      message: "Quote request submitted successfully! We'll contact you within 24 hours.",
      data: {
        id: saved._id,
        name: saved.name,
        email: saved.email,
        phone: saved.phone,
        eventType: saved.eventType,
        eventDate: saved.eventDate,
        guestCount: saved.guestCount,
        venue: saved.venue,
        budget: saved.budget,
        requirements: saved.requirements,
        status: saved.status,
        priority: saved.priority,
        createdAt: saved.createdAt
      }
    });

  } catch (error) {
    console.error("Error submitting quote:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get quote by ID (for admin purposes)
exports.getQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const quote = await Quote.findById(id);
    
    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }

    res.status(200).json({
      success: true,
      data: quote
    });

  } catch (error) {
    console.error("Error fetching quote:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all quotes (for admin purposes)
exports.getAllQuotes = async (req, res) => {
  try {
    const { status, priority, eventType, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (eventType) filter.eventType = eventType;

    const quotes = await Quote.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Quote.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: quotes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching quotes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update quote status (for admin purposes)
exports.updateQuoteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['New', 'Pending', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const quote = await Quote.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    );

    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }

    res.status(200).json({
      success: true,
      message: "Quote status updated successfully",
      data: quote
    });

  } catch (error) {
    console.error("Error updating quote status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get quote statistics (for admin purposes)
exports.getQuoteStats = async (req, res) => {
  try {
    const totalQuotes = await Quote.countDocuments();
    const pendingQuotes = await Quote.countDocuments({ status: 'pending' });
    const confirmedQuotes = await Quote.countDocuments({ status: 'confirmed' });
    
    const eventTypeStats = await Quote.aggregate([
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Quote.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalQuotes,
        pendingQuotes,
        confirmedQuotes,
        eventTypeStats,
        priorityStats
      }
    });

  } catch (error) {
    console.error("Error fetching quote stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update quote (for admin purposes)
exports.updateQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated via this endpoint
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.__v;

    const quote = await Quote.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }

    res.status(200).json({
      success: true,
      message: "Quote updated successfully",
      data: quote
    });

  } catch (error) {
    console.error("Error updating quote:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete quote (for admin purposes)
exports.deleteQuote = async (req, res) => {
  try {
    const { id } = req.params;

    const quote = await Quote.findByIdAndDelete(id);

    if (!quote) {
      return res.status(404).json({ error: "Quote not found" });
    }

    res.status(200).json({
      success: true,
      message: "Quote deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting quote:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};