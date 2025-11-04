import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter based on configuration
const createTransporter = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const emailService = process.env.EMAIL_SERVICE || 'gmail';

  if (nodeEnv === 'production' || (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD)) {
    // Production or configured SMTP
    if (emailService === 'gmail') {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    } else {
      // Generic SMTP
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
  } else {
    // Development: use test account
    return nodemailer.createTestAccount().then(testAccount => {
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    });
  }
};

let transporter: nodemailer.Transporter | null = null;

const getTransporter = async () => {
  if (!transporter) {
    transporter = await createTransporter();
  }
  return transporter;
};

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
): Promise<void> => {
  try {
    const transporter = await getTransporter();
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    const fromName = process.env.EMAIL_FROM_NAME || 'MentorConnect';
    const fromEmail = process.env.EMAIL_USER || 'noreply@mentorconnect.com';

    const mailOptions = {
      from: `${fromName} <${fromEmail}>`,
      to: email,
      subject: 'Password Reset Request - MentorConnect',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #333; margin: 0;">Password Reset</h1>
          </div>
          
          <div style="padding: 30px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Hello,
            </p>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              We received a request to reset your password. Click the button below to set a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; line-height: 1.6;">
              Or copy and paste this link in your browser:
            </p>
            <p style="color: #0066cc; font-size: 13px; word-break: break-all;">
              ${resetLink}
            </p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <p style="color: #999; font-size: 13px; line-height: 1.6;">
              <strong>Important:</strong> This link will expire in 1 hour for security reasons.
            </p>
            
            <p style="color: #999; font-size: 13px; line-height: 1.6;">
              If you didn't request a password reset, you can safely ignore this email. Your account is secure.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; line-height: 1.6; text-align: center;">
              © 2025 MentorConnect. All rights reserved.<br>
              <a href="https://mentorconnect.com" style="color: #0066cc; text-decoration: none;">Visit our website</a>
            </p>
          </div>
        </div>
      `,
      text: `
        Password Reset Request
        
        Hello,
        
        We received a request to reset your password. Visit this link to set a new password:
        ${resetLink}
        
        This link will expire in 1 hour for security reasons.
        
        If you didn't request this, you can safely ignore this email. Your account is secure.
        
        © 2025 MentorConnect
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    // In development, log the preview URL
    if (process.env.NODE_ENV !== 'production') {
      console.log('Password reset email sent!');
      if (info.messageId) {
        console.log('Message ID:', info.messageId);
      }
      // Provide preview URL for test accounts
      try {
        const testUrl = (nodemailer as any).getTestMessageUrl?.(info);
        if (testUrl) {
          console.log('Preview URL:', testUrl);
        }
      } catch (e) {
        // Ignore if not a test account
      }
    }
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};
