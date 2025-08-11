const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

/**
 * Generate a random 6-digit OTP
 * @returns {string} OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to email using Nodemailer
 * @param {string} email - Recipient email address
 * @param {string} otp - OTP code
 */
const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Quick Court" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Quick Court OTP Code",
      html: generateOTPEmail(otp),
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

const generateOTPEmail = (otp) => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Your Quick Court OTP</title>
      <style type="text/css">
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333333;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #eeeeee;
        }
        .logo {
          max-width: 180px;
        }
        .content {
          padding: 30px 20px;
        }
        .otp-container {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 30px 0;
        }
        .otp-code {
          font-size: 32px;
          letter-spacing: 5px;
          color: #2c3e50;
          font-weight: bold;
          margin: 15px 0;
          padding: 10px 20px;
          background: #ffffff;
          border-radius: 5px;
          display: inline-block;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #999999;
          border-top: 1px solid #eeeeee;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #3498db;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          margin-top: 20px;
        }
        .note {
          font-size: 14px;
          color: #7f8c8d;
          margin-top: 30px;
        }
        @media only screen and (max-width: 600px) {
          .container {
            width: 100%;
          }
          .otp-code {
            font-size: 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Quick Court</h1>
        </div>
        
        <div class="content">
          <h2 style="text-align: center;">Your One-Time Password</h2>
          <p>Hello,</p>
          <p>We received a request to access your Quick Court account. Please use the following OTP to verify your identity:</p>
          
          <div class="otp-container">
            <p>Your verification code is:</p>
            <div class="otp-code">${otp}</div>
            <p>This code will expire in <strong>5 minutes</strong>.</p>
          </div>
          
          <p>If you didn't request this code, you can safely ignore this email.</p>
          
          <p class="note"><strong>Note:</strong> For your security, never share this code with anyone, including Quick Court support.</p>
        </div>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Quick Court. All rights reserved.</p>
          <p>123 Legal Street, Suite 100, San Francisco, CA 94107</p>
        </div>
      </div>
    </body>
  </html>
  `;
};

/**
 * Generate a secure random token (for reset password etc.)
 * @param {number} length - Length of token in bytes
 * @returns {string} Hex string token
 */
const generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

/**
 * Generate JWT Token
 * @param {string} userId - MongoDB user _id
 * @param {string} [expiresIn="7d"] - Token expiry
 * @returns {string} JWT token
 */
const generateJWT = (userId, expiresIn = process.env.JWT_EXPIRE) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Hash password using bcrypt
 * @param {string} password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Compare plain text password with hashed password
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  generateRandomToken,
  generateJWT,
  hashPassword,
  comparePassword,
};
