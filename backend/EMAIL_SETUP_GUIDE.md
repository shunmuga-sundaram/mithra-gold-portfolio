# Email Setup Guide

## Overview

When an admin creates a new member account, the system automatically sends a welcome email containing:
- Member's email (username)
- Temporary password
- Login link
- Security reminder to change password

## Quick Setup

### Option 1: Gmail (Recommended for Production)

1. **Enable 2-Step Verification**
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other (Custom name)"
   - Enter: "Mithra Backend"
   - Click "Generate"
   - Copy the 16-character password

3. **Update .env File**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # Your app password
   EMAIL_FROM_NAME=Mithra Portfolio Tracker
   EMAIL_FROM_ADDRESS=your-email@gmail.com
   ```

4. **Restart Backend**
   ```bash
   npm run dev
   ```

### Option 2: Mailtrap (Recommended for Testing)

Perfect for development - catches all emails without sending to real addresses.

1. **Create Free Account**
   - Go to: https://mailtrap.io
   - Sign up for free account

2. **Get SMTP Credentials**
   - Go to: Inboxes → My Inbox
   - Copy SMTP credentials

3. **Update .env File**
   ```bash
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_SECURE=false
   SMTP_USER=your-mailtrap-username
   SMTP_PASSWORD=your-mailtrap-password
   EMAIL_FROM_NAME=Mithra Portfolio Tracker
   EMAIL_FROM_ADDRESS=noreply@mithra.com
   ```

4. **Restart Backend**
   ```bash
   npm run dev
   ```

5. **Check Emails**
   - All sent emails appear in Mailtrap inbox
   - No emails sent to real addresses
   - Perfect for testing!

### Option 3: Outlook/Office 365

1. **Update .env File**
   ```bash
   SMTP_HOST=smtp.office365.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@outlook.com
   SMTP_PASSWORD=your-outlook-password
   EMAIL_FROM_NAME=Mithra Portfolio Tracker
   EMAIL_FROM_ADDRESS=your-email@outlook.com
   ```

2. **Restart Backend**

## Configuration Options

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SMTP_HOST` | Yes | smtp.gmail.com | SMTP server address |
| `SMTP_PORT` | Yes | 587 | SMTP port (587 for TLS, 465 for SSL) |
| `SMTP_SECURE` | No | false | Use SSL (true for port 465) |
| `SMTP_USER` | Yes | - | SMTP username (usually email) |
| `SMTP_PASSWORD` | Yes | - | SMTP password or app password |
| `EMAIL_FROM_NAME` | No | Mithra Portfolio Tracker | Sender name |
| `EMAIL_FROM_ADDRESS` | No | SMTP_USER | Sender email address |
| `APP_URL` | No | http://localhost:5173 | Frontend URL for login link |
| `COMPANY_NAME` | No | Mithra Portfolio Tracker | Company name in emails |
| `SUPPORT_EMAIL` | No | support@mithra.com | Support contact email |

### Email Providers

| Provider | SMTP Host | Port | Secure | Notes |
|----------|-----------|------|--------|-------|
| Gmail | smtp.gmail.com | 587 | false | Requires app password |
| Outlook | smtp.office365.com | 587 | false | Use account password |
| Yahoo | smtp.mail.yahoo.com | 587 | false | Requires app password |
| Mailtrap | smtp.mailtrap.io | 2525 | false | Testing only |
| SendGrid | smtp.sendgrid.net | 587 | false | API key as password |

## Testing Email Configuration

### 1. Check Server Logs

When backend starts, you should see:
```
✅ Email service initialized successfully
```

If not configured:
```
⚠️  Email service not configured properly:
   - SMTP_USER is not configured
   - SMTP_PASSWORD is not configured
   Emails will not be sent. Configure SMTP settings in .env
```

### 2. Create a Test Member

```bash
# Using cURL
curl -X POST http://localhost:3000/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@1234",
    "phone": "+1234567890"
  }'
```

Or use the frontend:
1. Login as admin
2. Go to Members page
3. Click "Add Member"
4. Fill in details
5. Submit

### 3. Check Email Sent

**Server logs should show:**
```
✅ Welcome email sent to test@example.com
   Message ID: <...@...>
```

**If using Mailtrap:**
- Check Mailtrap inbox
- Email should appear instantly

**If using Gmail:**
- Check recipient's inbox
- Check spam folder if not found

### 4. Verify Email Content

Email should contain:
- ✅ Member's name in greeting
- ✅ Email address (username)
- ✅ Plain text password
- ✅ Login button with correct URL
- ✅ Security warning to change password
- ✅ Support contact email

## Email Template Preview

```
┌─────────────────────────────────────────────┐
│                                             │
│     Welcome to Mithra Portfolio Tracker    │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  Hi Test User,                              │
│                                             │
│  Your account has been created successfully!│
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ Your Login Credentials                │ │
│  │                                       │ │
│  │ Email:    test@example.com            │ │
│  │ Password: Test@1234                   │ │
│  │                                       │ │
│  │ ⚠️ Security Note: Please change your  │ │
│  │    password after your first login.   │ │
│  └───────────────────────────────────────┘ │
│                                             │
│         [Login to Your Account]             │
│                                             │
├─────────────────────────────────────────────┤
│  © 2024 Mithra Portfolio Tracker            │
└─────────────────────────────────────────────┘
```

## Troubleshooting

### Issue: "Email service not configured"

**Solution:**
1. Check `.env` file has SMTP settings
2. Restart backend server
3. Check for typos in variable names

### Issue: "Authentication failed"

**Gmail:**
- Use app password, not regular password
- Enable 2-Step Verification first
- Generate new app password

**Outlook:**
- Use account password
- Check if less secure app access is enabled

### Issue: "Connection timeout"

**Solution:**
1. Check firewall/antivirus blocking port 587
2. Try port 465 with SMTP_SECURE=true
3. Check if SMTP server address is correct

### Issue: Emails go to spam

**Solution:**
1. Add sender to contacts
2. Mark first email as "Not Spam"
3. Consider using custom domain email
4. Use email authentication (SPF, DKIM)

### Issue: Email sent but member didn't receive

**Check:**
1. Recipient's spam/junk folder
2. Email address is correct
3. Server logs show "✅ Welcome email sent"
4. Try different email address

## Production Recommendations

### 1. Use Professional Email Service

For production, consider:
- **SendGrid** - Free tier: 100 emails/day
- **Mailgun** - Free tier: 5000 emails/month
- **AWS SES** - $0.10 per 1000 emails
- **Custom domain email** - More professional

### 2. Environment-Specific Configuration

```bash
# Development (.env.development)
SMTP_HOST=smtp.mailtrap.io  # Testing only

# Production (.env.production)
SMTP_HOST=smtp.sendgrid.net  # Real emails
```

### 3. Email Queue (Future Enhancement)

For high volume:
- Use Bull or BullMQ for queue
- Retry failed emails
- Track delivery status
- Rate limiting

### 4. Email Templates

Customize in:
- `/src/app/services/email/email-service.ts`
- `generateWelcomeEmailTemplate()` method
- Add company logo
- Update colors/branding

## Security Best Practices

1. **Never commit .env file**
   - Use `.env.example` as template
   - Add `.env` to `.gitignore`

2. **Use app passwords**
   - Don't use regular account passwords
   - Generate unique app passwords

3. **Rotate credentials**
   - Change SMTP passwords regularly
   - Revoke unused app passwords

4. **Monitor email logs**
   - Track failed deliveries
   - Watch for abuse/spam

5. **Validate email addresses**
   - Already done in DTO validation
   - Prevents sending to invalid addresses

## Email Flow

```
Admin creates member
    ↓
Backend validates data
    ↓
Member saved to database
    ↓
Password hashed in DB
    ↓
Welcome email sent (async)
    ├─ Success → Log confirmation
    └─ Failed → Log error (member still created)
    ↓
Response sent to frontend
    ↓
Member receives email
    ↓
Member logs in
    ↓
Member changes password
```

## FAQ

**Q: What if email sending fails?**
A: Member is still created successfully. Email failure doesn't block member creation. Admin can manually share credentials.

**Q: Can admin resend the welcome email?**
A: Not yet. Feature can be added. For now, admin can:
- Use "Reset Password" feature (future)
- Manually share credentials
- Delete and recreate member

**Q: How to customize email template?**
A: Edit `email-service.ts`:
- Update `generateWelcomeEmailTemplate()` for HTML
- Update `generateWelcomeEmailText()` for plain text
- Change colors, text, layout

**Q: Can I use multiple email addresses?**
A: Yes, use different SMTP users for different purposes:
- noreply@company.com for automated emails
- support@company.com for support requests

**Q: How to track email delivery?**
A: Check server logs for:
- "✅ Welcome email sent" - Success
- "⚠️ Failed to send" - Warning
- "❌ Error sending email" - Error with details

## Next Steps

1. ✅ Configure SMTP settings in `.env`
2. ✅ Restart backend server
3. ✅ Create test member
4. ✅ Verify email received
5. ✅ Check email content
6. ✅ Test login with credentials
7. ✅ Update email template (optional)
8. ✅ Set up production email service

## Support

If you need help:
1. Check server logs for specific errors
2. Review this guide
3. Test with Mailtrap first
4. Check email provider documentation
