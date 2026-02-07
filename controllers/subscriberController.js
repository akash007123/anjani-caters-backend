const Subscriber = require('../models/Subscriber');

// Subscribe to newsletter
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if email already exists
    const existingSubscriber = await Subscriber.findOne({ email: email.toLowerCase() });

    if (existingSubscriber) {
      if (existingSubscriber.status === 'unsubscribed') {
        // Re-subscribe
        existingSubscriber.status = 'active';
        await existingSubscriber.save();
        return res.status(200).json({
          message: 'Successfully re-subscribed!',
          discountCode: existingSubscriber.discountCode,
          isNew: false
        });
      }
      
      return res.status(400).json({ 
        error: 'This email is already subscribed',
        discountCode: existingSubscriber.discountCode
      });
    }

    // Create new subscriber
    const subscriber = new Subscriber({
      email: email.toLowerCase(),
      source: req.body.source || 'exit-intent-popup'
    });

    await subscriber.save();

    res.status(201).json({
      message: 'Successfully subscribed! Your discount code: WELCOME10',
      discountCode: subscriber.discountCode,
      isNew: true
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'This email is already subscribed' });
    }
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

// Get all subscribers (admin only)
exports.getSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find()
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json(subscribers);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Unsubscribe
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    const subscriber = await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase() },
      { status: 'unsubscribed' },
      { new: true }
    );

    if (!subscriber) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }

    res.json({ message: 'Successfully unsubscribed' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
