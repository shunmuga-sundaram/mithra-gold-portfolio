// Test lazy initialization of email service
require('dotenv').config({ path: './.env' });

console.log('\n=== Testing Email Service Lazy Initialization ===\n');

const emailService = require('./build/app/services/email/email-service').default;

console.log('1. Email service imported (not initialized yet)');
console.log('2. Now calling verifyConnection() to trigger initialization...\n');

emailService.verifyConnection()
  .then((result) => {
    console.log('\n3. Initialization complete!');
    console.log('   Connection valid:', result);
  })
  .catch((error) => {
    console.error('\n3. Error:', error.message);
  });
