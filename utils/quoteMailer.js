const nodemailer = require("nodemailer");

const sendQuoteMail = async (formData) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Format event date for display
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
      });
    } catch (error) {
      return dateStr;
    }
  };

  const formatBudget = (budget) => {
    if (!budget) return "Not specified";
    const budgetMap = {
      '50k-100k': '₹50,000 - ₹1,00,000',
      '100k-250k': '₹1,00,000 - ₹2,50,000',
      '250k-500k': '₹2,50,000 - ₹5,00,000',
      '500k+': '₹5,00,000+'
    };
    return budgetMap[budget] || budget;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'urgent': '#dc3545',
      'high': '#fd7e14',
      'medium': '#17a2b8',
      'low': '#6c757d'
    };
    return colors[priority] || '#17a2b8';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      'urgent': '🚨 URGENT',
      'high': '🔥 HIGH',
      'medium': '📋 MEDIUM',
      'low': '📝 LOW'
    };
    return badges[priority] || '📋 MEDIUM';
  };

  // Send notification email to business owner
  await transporter.sendMail({
    from: `"Anjani Caters Quote Form" <${process.env.EMAIL_USER}>`,
    to: process.env.RECEIVER_EMAIL,
    subject: `New Quote Request - ${formData.eventType} Event (${getPriorityBadge(formData.priority)})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 26px;">New Quote Request</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Anjani Caters - Premium Catering Services</p>
        </div>
        
        <div style="padding: 25px; background-color: #f8f9fa;">
          <!-- Priority Banner -->
          <div style="background: ${getPriorityColor(formData.priority)}; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 18px;">${getPriorityBadge(formData.priority)} PRIORITY</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Event Date: ${formatDate(formData.eventDate)}</p>
          </div>

          <!-- Customer Information -->
          <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">👤 Customer Information</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <p style="margin: 8px 0;"><strong style="color: #666;">Name:</strong> ${formData.name}</p>
                <p style="margin: 8px 0;"><strong style="color: #666;">Email:</strong> <a href="mailto:${formData.email}" style="color: #667eea;">${formData.email}</a></p>
              </div>
              <div>
                <p style="margin: 8px 0;"><strong style="color: #666;">Phone:</strong> ${formData.phone || "Not Provided"}</p>
                <p style="margin: 8px 0;"><strong style="color: #666;">Submitted:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
              </div>
            </div>
          </div>

          <!-- Event Details -->
          <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">🎉 Event Details</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div>
                <p style="margin: 8px 0;"><strong style="color: #666;">Event Type:</strong> ${formData.eventType}</p>
                <p style="margin: 8px 0;"><strong style="color: #666;">Event Date:</strong> ${formatDate(formData.eventDate)}</p>
                <p style="margin: 8px 0;"><strong style="color: #666;">Guest Count:</strong> ${formData.guestCount}</p>
              </div>
              <div>
                <p style="margin: 8px 0;"><strong style="color: #666;">Budget Range:</strong> ${formatBudget(formData.budget)}</p>
                <p style="margin: 8px 0;"><strong style="color: #666;">Venue:</strong> ${formData.venue || "Not specified"}</p>
              </div>
            </div>
          </div>

          <!-- Special Requirements -->
          ${formData.requirements ? `
          <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h3 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">💭 Special Requirements</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea;">
              <p style="margin: 0; line-height: 1.6; color: #555;">${formData.requirements.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
          ` : ''}

          <!-- Action Buttons -->
          <div style="text-align: center; margin: 25px 0;">
            <div style="display: inline-block; margin: 0 10px;">
              <a href="mailto:${formData.email}?subject=Re: Your Quote Request - ${formData.eventType} Event" style="background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Reply to Customer</a>
            </div>
            <div style="display: inline-block; margin: 0 10px;">
              <a href="tel:${formData.phone || ''}" style="background: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Call Customer</a>
            </div>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">Anjani Caters - Premium Catering Services</p>
          <p style="margin: 5px 0 0 0;">This is an automated notification from your quote form.</p>
        </div>
      </div>
    `,
  });

  // Send confirmation email to the user
  await transporter.sendMail({
    from: `"Anjani Caters" <${process.env.EMAIL_USER}>`,
    to: formData.email,
    subject: "Thank you for your quote request - We'll create something amazing! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 35px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 30px;">Thank You, ${formData.name}! 🙏</h1>
          <p style="color: white; margin: 15px 0 0 0; font-size: 18px;">Your quote request has been received</p>
        </div>
        
        <div style="padding: 35px; background-color: #f8f9fa;">
          <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">We're Excited About Your ${formData.eventType} Event! 🎊</h2>
            
            <p style="color: #666; line-height: 1.8; margin: 20px 0; font-size: 16px;">
              Thank you for choosing Anjani Caters for your special event! We've received your quote request and our expert team is already reviewing the details to create a customized proposal that exceeds your expectations.
            </p>
            
            <!-- Event Summary -->
            <div style="background: linear-gradient(135deg, #e8f4f8 0%, #f8f9fa 100%); padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #17a2b8;">
              <h3 style="color: #17a2b8; margin-top: 0;">📋 Your Event Summary:</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                <div>
                  <p style="margin: 8px 0; color: #555;"><strong>Event Type:</strong> ${formData.eventType}</p>
                  <p style="margin: 8px 0; color: #555;"><strong>Event Date:</strong> ${formatDate(formData.eventDate)}</p>
                  <p style="margin: 8px 0; color: #555;"><strong>Guest Count:</strong> ${formData.guestCount} people</p>
                </div>
                <div>
                  <p style="margin: 8px 0; color: #555;"><strong>Budget Range:</strong> ${formatBudget(formData.budget)}</p>
                  <p style="margin: 8px 0; color: #555;"><strong>Venue:</strong> ${formData.venue || "TBD"}</p>
                </div>
              </div>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">⚡ What happens next?</h3>
              <ul style="color: #856404; margin: 10px 0; padding-left: 25px; line-height: 1.8;">
                <li><strong>Within 2 hours:</strong> Our team will review your requirements</li>
                <li><strong>Within 24 hours:</strong> You'll receive a detailed proposal with menu options</li>
                <li><strong>Consultation:</strong> We'll schedule a free tasting session</li>
                <li><strong>Finalization:</strong> We'll finalize every detail together</li>
              </ul>
            </div>

            <div style="background: #d4edda; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #28a745;">
              <h3 style="color: #155724; margin-top: 0;">✨ Why choose Anjani Caters?</h3>
              <ul style="color: #155724; margin: 10px 0; padding-left: 25px; line-height: 1.8;">
                <li>🏆 Award-winning culinary excellence</li>
                <li>🍽️ Customized menu for your event</li>
                <li>👨‍🍳 Professional chef team</li>
                <li>🎯 100% satisfaction guarantee</li>
                <li>💰 Transparent, competitive pricing</li>
              </ul>
            </div>
            
            ${formData.requirements ? `
            <div style="background: #e2e3e5; padding: 15px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #333; margin-top: 0;">💭 Your Special Requirements:</h4>
              <p style="margin: 0; color: #555; font-style: italic;">${formData.requirements.replace(/\n/g, '<br>')}</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 35px 0;">
              <h3 style="color: #333; margin-bottom: 20px;">Need to reach us immediately?</h3>
              <div style="display: inline-block; margin: 0 15px;">
                <a href="tel:+911234567890" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; display: inline-block; font-weight: bold; font-size: 16px;">📞 Call Us Now</a>
              </div>
              <div style="display: inline-block; margin: 0 15px;">
                <a href="mailto:info@anjanicaters.com" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; display: inline-block; font-weight: bold; font-size: 16px;">📧 Email Us</a>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #666; font-size: 14px;">Follow us for inspiration and updates:</p>
              <div style="margin-top: 15px;">
                <a href="https://facebook.com/anjanicaters" style="display: inline-block; margin: 0 15px; color: #667eea; text-decoration: none; font-weight: bold;">📘 Facebook</a>
                <a href="https://instagram.com/anjanicaters" style="display: inline-block; margin: 0 15px; color: #667eea; text-decoration: none; font-weight: bold;">📷 Instagram</a>
              </div>
            </div>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 25px; text-align: center;">
          <h3 style="margin: 0 0 15px 0; color: white;">Anjani Caters 🌟</h3>
          <p style="margin: 5px 0; font-size: 16px;">Creating Unforgettable Culinary Experiences</p>
          <p style="margin: 5px 0; font-size: 14px; color: #ccc;">
            📧 akashraikwar763@gmail.com | 📞 +91 96855 33878 | 📍 Chhatarpur, Madhya Pradesh, India
          </p>
          <p style="margin: 15px 0 0 0; font-size: 12px; color: #999;">
            This is an automated confirmation. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  });
};

module.exports = sendQuoteMail;