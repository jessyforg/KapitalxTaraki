// Send password reset email using Brevo HTTP API (avoids blocked SMTP ports)
const sendPasswordResetEmail = async (email, resetToken, userName = 'User') => {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      throw new Error('Brevo API key (BREVO_API_KEY) is not configured');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Prefer an explicit Brevo sender env, fallback to SMTP_USER if set
    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || 'no-reply@example.com';

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
          <div style="background: #ffffff; padding: 24px; border-radius: 10px; border: 1px solid #e0e0e0;">
            <h2 style="color: #FF7A1A; margin-top: 0;">Password Reset Request</h2>
            <p>Hello ${userName},</p>
            <p>We received a request to reset your password for your TARAKI account. Use the link below to reset your password:</p>
            <p style="word-break: break-all; color: #0066cc; background: #fff; padding: 12px; border-radius: 6px; border: 1px solid #e0e0e0;">
              <a href="${resetLink}" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: underline;">${resetLink}</a>
            </p>
            <p style="color: #666; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">© ${new Date().getFullYear()} TARAKI. All rights reserved.</p>
          </div>
        </body>
        </html>
      `;

    const textContent = `
Password Reset Request - TARAKI

Hello ${userName},

We received a request to reset your password for your TARAKI account.

Open this link to reset your password:
${resetLink}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email or contact support if you have concerns.

© ${new Date().getFullYear()} TARAKI. All rights reserved.
    `;

    // Use Brevo HTTP API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'TARAKI',
          email: senderEmail,
        },
        to: [
          {
            email,
            name: userName,
          },
        ],
        subject: 'Password Reset Request - TARAKI',
        htmlContent,
        textContent,
      }),
    });

    if (!response.ok) {
      let errorBody = {};
      try {
        errorBody = await response.json();
      } catch (e) {
        // ignore JSON parse errors
      }
      console.error('Brevo API error:', response.status, errorBody);
      throw new Error(errorBody.message || 'Failed to send password reset email');
    }

    console.log('Password reset email sent via Brevo');
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendPasswordResetEmail,
};

