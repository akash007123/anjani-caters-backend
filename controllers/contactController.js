const Contact = require("../models/Contact");
const sendMail = require("../utils/mailer");

exports.healthCheck = (req, res) => {
  res.status(200).json({ status: "online" });
};

exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, Email, and Message are required." });
    }

    const saved = await Contact.create({ name, email, phone, message });

    await sendMail({ name, email, phone, message });

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
