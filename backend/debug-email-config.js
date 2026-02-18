// Load dotenv first
require('dotenv').config({ path: './.env' });

console.log('\n=== Debug Email Config ===\n');

// Check raw environment variables
console.log('Raw Environment Variables:');
console.log('SMTP_USER:', process.env.SMTP_USER ? '✅ SET' : '❌ NOT SET', '=', process.env.SMTP_USER);
console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '✅ SET' : '❌ NOT SET', '= ***' + (process.env.SMTP_PASSWORD || '').slice(-4));
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log();

// Import and check email config
const { EMAIL_CONFIG, validateEmailConfig } = require('./build/app/config/email-config');

console.log('EMAIL_CONFIG.smtp.auth:');
console.log('  user:', EMAIL_CONFIG.smtp.auth.user ? '✅ SET' : '❌ NOT SET', '=', EMAIL_CONFIG.smtp.auth.user);
console.log('  pass:', EMAIL_CONFIG.smtp.auth.pass ? '✅ SET' : '❌ NOT SET', '= ***' + (EMAIL_CONFIG.smtp.auth.pass || '').slice(-4));
console.log();

// Run validation
const validation = validateEmailConfig();
console.log('Validation Result:');
console.log('  isValid:', validation.isValid);
console.log('  errors:', validation.errors);
console.log();
