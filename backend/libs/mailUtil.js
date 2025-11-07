import axios from "axios";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "no-reply@yourdomain.com";
const FROM_NAME = process.env.FROM_NAME || "YourApp";

/**
 * Generic Email Sender using Brevo API
 */
export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const body = {
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html
    };

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      body,
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": BREVO_API_KEY,
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error("Brevo API Error:", err.response?.data || err.message);
    throw err;
  }
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
