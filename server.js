const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config(); // To load environment variables

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json()); // To parse JSON request bodies

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST route to handle booking requests
app.post('/book-event', async (req, res) => {
  const { name, email, eventType, date, guests, message } = req.body;

  try {
    // Send confirmation email to user
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Booking Confirmation',
      text: `Hello ${name},\n\nYour booking for the ${eventType} event on ${date} is confirmed. You have booked for ${guests} guests.\n\nMessage: ${message}\n\nThank you!`,
    });

    // Send email to admin with the booking details
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Event Booking',
      text: `New booking received:\n\nName: ${name}\nEmail: ${email}\nEvent Type: ${eventType}\nDate: ${date}\nGuests: ${guests}\nMessage: ${message}`,
    });

    // Respond with success
    res.status(200).json({ message: 'Booking request submitted successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send booking request. Please try again later.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
