/**
 * EMAIL CONFIGURATION
 *
 * Configuration for sending emails via SMTP
 *
 * Supports:
 * - Gmail
 * - Outlook
 * - Custom SMTP servers
 * - Mailtrap (for testing)
 */

// Use getter to read env vars at runtime, not at module load time
export const EMAIL_CONFIG = {
  /**
   * SMTP Server Settings
   *
   * For Gmail:
   * - Host: smtp.gmail.com
   * - Port: 587 (TLS) or 465 (SSL)
   * - User: your-email@gmail.com
   * - Pass: App password (not regular password)
   *
   * To get Gmail App Password:
   * 1. Go to Google Account settings
   * 2. Security → 2-Step Verification → App passwords
   * 3. Generate new app password for "Mail"
   * 4. Use that password in .env
   *
   * For Outlook:
   * - Host: smtp.office365.com
   * - Port: 587
   * - User: your-email@outlook.com
   * - Pass: Your outlook password
   *
   * For Mailtrap (Testing):
   * - Host: smtp.mailtrap.io
   * - Port: 2525
   * - User: your-mailtrap-username
   * - Pass: your-mailtrap-password
   */
  get smtp() {
    return {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || '',
      },
    };
  },

  /**
   * Sender Information
   *
   * This is the "From" address that appears in emails
   */
  get from() {
    return {
      name: process.env.EMAIL_FROM_NAME || 'Mithra Portfolio Tracker',
      email: process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || 'noreply@mithra.com',
    };
  },

  /**
   * Application URL
   *
   * Used in email templates for links
   */
  get appUrl() {
    return process.env.APP_URL || 'http://localhost:5173';
  },

  /**
   * Email Templates Settings
   */
  get templates() {
    return {
      // Logo URL (optional)
      logoUrl: process.env.EMAIL_LOGO_URL || '',

      // Company name
      companyName: process.env.COMPANY_NAME || 'Mithra Portfolio Tracker',

      // Support email
      supportEmail: process.env.SUPPORT_EMAIL || 'support@mithra.com',
    };
  },
};

/**
 * Validate Email Configuration
 *
 * Checks if required email settings are configured
 */
export function validateEmailConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!EMAIL_CONFIG.smtp.auth.user) {
    errors.push('SMTP_USER is not configured');
  }

  if (!EMAIL_CONFIG.smtp.auth.pass) {
    errors.push('SMTP_PASSWORD is not configured');
  }

  if (!EMAIL_CONFIG.smtp.host) {
    errors.push('SMTP_HOST is not configured');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export default EMAIL_CONFIG;
