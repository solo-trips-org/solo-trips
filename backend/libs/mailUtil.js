import nodemailer from "nodemailer";

/**
 * Create transporter for Brevo (Sendinblue) SMTP
 */
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
  port: 587,                // TLS port
  secure: false,            // use STARTTLS
  auth: {
    user: process.env.BREVO_SMTP_USER, // Brevo SMTP login (your account email)
    pass: process.env.BREVO_SMTP_PASS, // Brevo SMTP API key / password
  },
});

/**
 * Generic Email Sender
 */
export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL || "no-reply@yourdomain.com",
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
  const subject = "Your OTP Code";
  const html = `
    <p>Your OTP code is:</p>
    <h2>${otp}</h2>
    <p>It is valid for ${validityMinutes} minutes.</p>
    <p>Do not share this code with anyone.</p>
  `;

  return sendEmail({ to, subject, html });
};
