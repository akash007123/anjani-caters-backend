const nodemailer = require("nodemailer");

const sendMail = async (formData) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Send notification email to business owner
  await transporter.sendMail({
    from: `"Anjani Caters Contact Form" <${process.env.EMAIL_USER}>`,
    to: process.env.RECEIVER_EMAIL,
    subject: "New Contact Request - Anjani Caters",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Request</h1>
          <p style="color: white; margin: 10px 0 0 0;">Anjani Caters</p>
        </div>
        
        <div style="padding: 20px; background-color: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Contact Details</h2>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <p style="margin: 5px 0;"><strong style="color: #666;">Name:</strong> ${formData.name}</p>
            <p style="margin: 5px 0;"><strong style="color: #666;">Email:</strong> <a href="mailto:${formData.email}">${formData.email}</a></p>
            <p style="margin: 5px 0;"><strong style="color: #666;">Phone:</strong> ${formData.phone || "Not Provided"}</p>
            <p style="margin: 5px 0;"><strong style="color: #666;">Submitted:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; border-left: 4px solid #667eea;">
              <p style="margin: 0; line-height: 1.6;">${formData.message.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="mailto:${formData.email}" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reply to Customer</a>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">Anjani Caters - Premium Catering Services</p>
          <p style="margin: 5px 0 0 0;">This is an automated notification from your contact form.</p>
        </div>
      </div>
    `,
  });

  // Send confirmation email to the user
  await transporter.sendMail({
    from: `"Anjani Caters" <${process.env.EMAIL_USER}>`,
    to: formData.email,
    subject: "Thank you for contacting Anjani Caters - We'll be in touch soon!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Thank You!</h1>
          <p style="color: white; margin: 15px 0 0 0; font-size: 18px;">Your message has been received</p>
        </div>
        
        <div style="padding: 30px; background-color: #f8f9fa;">
          <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Hello ${formData.name},</h2>
            
            <p style="color: #666; line-height: 1.6; margin: 20px 0;">
              Thank you for reaching out to Anjani Caters! We have received your message and our team will review it carefully.
            </p>
            
            <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
              <h3 style="color: #17a2b8; margin-top: 0;">What happens next?</h3>
              <ul style="color: #666; margin: 10px 0; padding-left: 20px;">
                <li>Our team will review your inquiry within 2-4 hours</li>
                <li>We'll get back to you with a personalized response</li>
                <li>If urgent, feel free to call us at +91 12345 67890</li>
              </ul>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Your message summary:</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Subject:</strong> Contact Form Inquiry</p>
              <p style="margin: 5px 0; color: #666;"><strong>Submitted:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
              ${formData.phone ? `<p style="margin: 5px 0; color: #666;"><strong>Phone:</strong> ${formData.phone}</p>` : ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                <p style="margin: 0; color: #666; font-size: 14px;">Follow us for updates:</p>
                <div style="margin-top: 10px;">
                  <a href="https://facebook.com/anjanicaters" style="display: inline-block; margin: 0 10px; color: #667eea; text-decoration: none;">📘 Facebook</a>
                  <a href="https://instagram.com/anjanicaters" style="display: inline-block; margin: 0 10px; color: #667eea; text-decoration: none;">📷 Instagram</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <h3 style="margin: 0 0 10px 0; color: white;">Anjani Caters</h3>
          <p style="margin: 5px 0; font-size: 14px;">Premium Catering Services for Extraordinary Events</p>
          <p style="margin: 5px 0; font-size: 12px; color: #ccc;">
            📧 info@elitecatering.com | 📞 +91 12345 67890 | 📍 Mumbai, India
          </p>
          <p style="margin: 15px 0 0 0; font-size: 11px; color: #999;">
            This is an automated confirmation. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  });
};

module.exports = sendMail;
