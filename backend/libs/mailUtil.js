import nodemailer from 'nodemailer';

/**
 * Create transporter using Gmail
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // your Gmail address
    pass: process.env.GMAIL_PASS, // your Gmail App Password (not normal password)
  },
});

/**
 * Generic Email Sender
 */
export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    html,
    attachments,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send OTP Email
 */
export const sendOtpEmail = async (to, otp, validityMinutes = 3) => {
  const subject = 'Your OTP Code';
  const html = `
    <p>Your OTP code is:</p>
    <h2>${otp}</h2>
    <p>It is valid for ${validityMinutes} minutes.</p>
    <p>Do not share this code with anyone.</p>
  `;

  return sendEmail({ to, subject, html });
};
