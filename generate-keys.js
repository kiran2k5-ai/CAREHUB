// Quick setup utility to generate required keys
const crypto = require('crypto');

function generateRandomKey(length) {
  return crypto.randomBytes(length).toString('hex');
}

console.log('🔑 Generated Security Keys for .env.local:\n');
console.log(`NEXTAUTH_SECRET=${generateRandomKey(16)}`);
console.log(`ENCRYPTION_KEY=${generateRandomKey(16)}`);
console.log('\n📋 Copy these keys to your .env.local file');
console.log('\n⚠️  Keep these keys secure and never share them!');