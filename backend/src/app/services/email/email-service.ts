import nodemailer, { Transporter } from 'nodemailer';
import { EMAIL_CONFIG, validateEmailConfig } from '../../config/email-config';

/**
 * EMAIL SERVICE
 *
 * Handles sending emails for:
 * - New member account creation
 * - Password reset
 * - Trade notifications
 * - System alerts
 */

export class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * INITIALIZE EMAIL TRANSPORTER
   *
   * Creates nodemailer transporter with SMTP configuration
   */
  private initialize(): void {
    const { isValid, errors } = validateEmailConfig();

    if (!isValid) {
      console.warn('⚠️  Email service not configured properly:');
      errors.forEach((error) => console.warn(`   - ${error}`));
      console.warn('   Emails will not be sent. Configure SMTP settings in .env');
      this.isConfigured = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: EMAIL_CONFIG.smtp.host,
        port: EMAIL_CONFIG.smtp.port,
        secure: EMAIL_CONFIG.smtp.secure,
        auth: {
          user: EMAIL_CONFIG.smtp.auth.user,
          pass: EMAIL_CONFIG.smtp.auth.pass,
        },
      });

      this.isConfigured = true;
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      this.isConfigured = false;
    }
  }

  /**
   * SEND WELCOME EMAIL TO NEW MEMBER
   *
   * Sends email with login credentials to newly created member
   *
   * @param memberEmail - Member's email address
   * @param memberName - Member's name
   * @param password - Temporary password (plain text)
   * @returns Promise<boolean> - true if sent successfully
   */
  async sendWelcomeEmail(
    memberEmail: string,
    memberName: string,
    password: string
  ): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.warn('⚠️  Email service not configured. Skipping welcome email.');
      return false;
    }

    try {
      const emailHtml = this.generateWelcomeEmailTemplate(memberName, memberEmail, password);
      const emailText = this.generateWelcomeEmailText(memberName, memberEmail, password);

      const mailOptions = {
        from: `"${EMAIL_CONFIG.from.name}" <${EMAIL_CONFIG.from.email}>`,
        to: memberEmail,
        subject: 'Welcome to Mithra Portfolio Tracker - Your Account Details',
        html: emailHtml,
        text: emailText,
      };

      const info = await this.transporter.sendMail(mailOptions);

      console.log('✅ Welcome email sent successfully to:', memberEmail);
      console.log('   Message ID:', info.messageId);

      return true;
    } catch (error: any) {
      console.error('❌ Failed to send welcome email to:', memberEmail);
      console.error('   Error:', error.message);
      return false;
    }
  }

  /**
   * GENERATE WELCOME EMAIL HTML TEMPLATE
   *
   * Creates HTML email with member credentials
   */
  private generateWelcomeEmailTemplate(
    memberName: string,
    memberEmail: string,
    password: string
  ): string {
    const loginUrl = EMAIL_CONFIG.appUrl;
    const companyName = EMAIL_CONFIG.templates.companyName;
    const supportEmail = EMAIL_CONFIG.templates.supportEmail;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${companyName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 0; text-align: center;">
        <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                Welcome to ${companyName}! 🎉
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                Hi <strong>${memberName}</strong>,
              </p>

              <p style="margin: 0 0 20px; font-size: 16px; color: #333333; line-height: 1.6;">
                Your account has been created successfully! You can now access your portfolio and track your gold investments.
              </p>

              <!-- Credentials Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0; background-color: #f8f9fa; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px;">
                    <h2 style="margin: 0 0 15px; font-size: 18px; color: #333333;">Your Login Credentials</h2>

                    <div style="margin-bottom: 12px;">
                      <span style="display: inline-block; width: 100px; font-weight: bold; color: #555555;">Email:</span>
                      <span style="color: #333333; font-family: monospace; background-color: #e9ecef; padding: 4px 8px; border-radius: 4px;">${memberEmail}</span>
                    </div>

                    <div style="margin-bottom: 12px;">
                      <span style="display: inline-block; width: 100px; font-weight: bold; color: #555555;">Password:</span>
                      <span style="color: #333333; font-family: monospace; background-color: #e9ecef; padding: 4px 8px; border-radius: 4px;">${password}</span>
                    </div>

                    <div style="margin-top: 15px; padding: 12px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                      <p style="margin: 0; font-size: 14px; color: #856404;">
                        ⚠️ <strong>Security Note:</strong> Please change your password after your first login.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${loginUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                      Login to Your Account
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; font-size: 14px; color: #666666; line-height: 1.6;">
                If you have any questions or need assistance, please don't hesitate to contact us at
                <a href="mailto:${supportEmail}" style="color: #667eea; text-decoration: none;">${supportEmail}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">
                © ${new Date().getFullYear()} ${companyName}. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">
                This email was sent to ${memberEmail}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * GENERATE WELCOME EMAIL PLAIN TEXT VERSION
   *
   * Fallback for email clients that don't support HTML
   */
  private generateWelcomeEmailText(
    memberName: string,
    memberEmail: string,
    password: string
  ): string {
    const loginUrl = EMAIL_CONFIG.appUrl;
    const companyName = EMAIL_CONFIG.templates.companyName;
    const supportEmail = EMAIL_CONFIG.templates.supportEmail;

    return `
Welcome to ${companyName}!

Hi ${memberName},

Your account has been created successfully! You can now access your portfolio and track your gold investments.

YOUR LOGIN CREDENTIALS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email:    ${memberEmail}
Password: ${password}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ SECURITY NOTE: Please change your password after your first login.

LOGIN URL:
${loginUrl}

If you have any questions or need assistance, please contact us at ${supportEmail}

© ${new Date().getFullYear()} ${companyName}. All rights reserved.
    `.trim();
  }

  /**
   * SEND PASSWORD RESET EMAIL
   *
   * Sends email with password reset link to member
   *
   * @param memberEmail - Member's email address
   * @param memberName - Member's name
   * @param resetToken - Password reset token
   * @returns Promise<boolean> - true if sent successfully
   */
  async sendPasswordResetEmail(
    memberEmail: string,
    memberName: string,
    resetToken: string
  ): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.warn('⚠️  Email service not configured. Skipping password reset email.');
      return false;
    }

    try {
      const emailHtml = this.generatePasswordResetEmailTemplate(memberName, resetToken);
      const emailText = this.generatePasswordResetEmailText(memberName, resetToken);

      const mailOptions = {
        from: `"${EMAIL_CONFIG.from.name}" <${EMAIL_CONFIG.from.email}>`,
        to: memberEmail,
        subject: 'Reset Your Password - Mithra Portfolio Tracker',
        html: emailHtml,
        text: emailText,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully to:', memberEmail);
      return true;
    } catch (error: any) {
      console.error('❌ Failed to send password reset email:', error.message);
      return false;
    }
  }

  /**
   * GENERATE PASSWORD RESET EMAIL HTML TEMPLATE
   *
   * Creates HTML email with reset link
   */
  private generatePasswordResetEmailTemplate(memberName: string, resetToken: string): string {
    const resetUrl = `${EMAIL_CONFIG.appUrl}/reset-password?token=${resetToken}`;
    const companyName = EMAIL_CONFIG.templates.companyName;

    return `<!DOCTYPE html>
<html><body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px;">
<div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px; text-align: center;">
    <h1 style="color: white; margin: 0;">Reset Your Password 🔒</h1>
  </div>
  <div style="padding: 40px;">
    <p>Hi <strong>${memberName}</strong>,</p>
    <p>We received a request to reset your password for your ${companyName} account.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Reset Password
      </a>
    </div>
    <div style="padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; margin: 20px 0;">
      <p style="margin: 0;">⏱️ <strong>Important:</strong> This link will expire in 15 minutes.</p>
    </div>
    <p style="font-size: 14px; color: #666;">If you didn't request this, please ignore this email.</p>
  </div>
</div></body></html>`;
  }

  /**
   * GENERATE PASSWORD RESET EMAIL PLAIN TEXT VERSION
   *
   * Fallback for email clients that don't support HTML
   */
  private generatePasswordResetEmailText(memberName: string, resetToken: string): string {
    const resetUrl = `${EMAIL_CONFIG.appUrl}/reset-password?token=${resetToken}`;
    return `Reset Your Password\n\nHi ${memberName},\n\nClick this link to reset your password:\n${resetUrl}\n\n⏱️ This link expires in 15 minutes.`;
  }

  /**
   * VERIFY EMAIL CONNECTION
   *
   * Tests if SMTP connection works
   *
   * @returns Promise<boolean> - true if connection successful
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ Email server connection verified');
      return true;
    } catch (error: any) {
      console.error('❌ Email server connection failed:', error.message);
      return false;
    }
  }
}

// Export singleton instance
export default new EmailService();
