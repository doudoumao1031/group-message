// Simple test to check if our encryption matches the expected output
// This uses plain JavaScript for simplicity

const CryptoJS = require('crypto-js');

// Salt key (same as in Golang)
const saltKey = CryptoJS.enc.Utf8.parse("0ZLiNKQebR14xtBY");

// Test data components
const curdate = '+8666640404040';
const from = '1740907278';
const to = '@zzzzzz001';
const dateunix = '1740907026';
const filemsgid = '0';
const msg = 'test-2025-03-02 17:18:38.616334452 +0800 CST m=+0.000370787';

// Construct the message in the specified pattern
const testMessage = `#sendmessage\ncurdate:${curdate}\nfrom:${from}\nto:${to}\ndateunix:${dateunix}\nfilemsgid:${filemsgid}\nmsg:${msg}`;

// Expected encrypted output
const expectedEncrypted = 'bb078990a43f4bebdf3a8fbebeef16df9b0231961f3dd0df982539d2c9b2d170475df8b38f124a14ee7a9fdaa13558a58357a94e5de2ab50a4b9017bb1041de623886feef0df67576607f167d9595aa556f9400e42c45da973c355680c539c2d69a795899ec3f14764496143eeeb90adda8f7f6d3150f94afa496a7da468da445115763bb44637912a69df766b32b268dfa2e95e388ba8f4c4bd8cd7ada06d9e8528c5a45984e08683938c40b25f1b7e1f67bdfe0145eef0fcefcf148195d4ff';

// Function to attempt decryption of the expected output
function tryDecrypt(ciphertext) {
  try {
    // Convert hex string to WordArray
    const ciphertextBytes = CryptoJS.enc.Hex.parse(ciphertext);
    
    // Extract IV (first 16 bytes)
    const iv = CryptoJS.lib.WordArray.create(
      ciphertextBytes.words.slice(0, 4),
      16
    );
    
    // Extract actual ciphertext (everything after IV)
    const encryptedContent = CryptoJS.lib.WordArray.create(
      ciphertextBytes.words.slice(4),
      ciphertextBytes.sigBytes - 16
    );
    
    // Create decryption configuration
    const cfg = {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    };
    
    // Create CipherParams object for decryption
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: encryptedContent
    });
    
    // Decrypt and return as UTF-8 string
    const decrypted = CryptoJS.AES.decrypt(cipherParams, saltKey, cfg);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error.message);
    return null;
  }
}

// Function to encrypt with a fixed IV for testing
function encryptWithFixedIV(plaintext, ivHex) {
  try {
    // Use a fixed IV for testing
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    
    // Create encryption configuration
    const cfg = {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    };
    
    // Encrypt the plaintext
    const encrypted = CryptoJS.AES.encrypt(plaintext, saltKey, cfg);
    
    // Combine IV and ciphertext and convert to hex string
    const ivCiphertext = iv.concat(encrypted.ciphertext);
    return ivCiphertext.toString(CryptoJS.enc.Hex);
  } catch (error) {
    console.error('Encryption error:', error.message);
    return null;
  }
}

// Run tests
console.log('Test Message:');
console.log(testMessage);
console.log('\n');

// Extract the IV from the expected output
const ivHex = expectedEncrypted.substring(0, 32);
console.log('Extracted IV from expected output:', ivHex);

// Try to encrypt with the same IV
console.log('\nTrying to encrypt with the extracted IV:');
const encryptedWithSameIV = encryptWithFixedIV(testMessage, ivHex);
console.log(encryptedWithSameIV);

// Compare with expected output
console.log('\nComparing with expected output:');
if (encryptedWithSameIV === expectedEncrypted) {
  console.log('✅ MATCH - Our encryption with fixed IV matches the expected output');
} else {
  console.log('❌ MISMATCH - Our encryption with fixed IV does not match the expected output');
  console.log('This suggests a different encryption algorithm, key, or padding method');
  
  // Compare character by character to find where they differ
  let firstDiffIndex = -1;
  for (let i = 0; i < Math.min(encryptedWithSameIV.length, expectedEncrypted.length); i++) {
    if (encryptedWithSameIV[i] !== expectedEncrypted[i]) {
      firstDiffIndex = i;
      break;
    }
  }
  
  if (firstDiffIndex !== -1) {
    console.log(`First difference at index ${firstDiffIndex}`);
    const start = Math.max(0, firstDiffIndex - 10);
    const end = Math.min(encryptedWithSameIV.length, firstDiffIndex + 10);
    console.log(`Our output around diff: ${encryptedWithSameIV.substring(start, end)}`);
    console.log(`Expected around diff: ${expectedEncrypted.substring(start, end)}`);
  }
}

// Try to decrypt the expected output
console.log('\nAttempting to decrypt the expected output:');
const decrypted = tryDecrypt(expectedEncrypted);
if (decrypted) {
  console.log('Decryption successful:');
  console.log(decrypted);
  
  // Compare with our test message
  console.log('\nComparing with our test message:');
  if (decrypted === testMessage) {
    console.log('✅ MATCH - Decrypted output matches our test message');
  } else {
    console.log('❌ MISMATCH - Decrypted output does not match our test message');
    console.log('Our message:');
    console.log(testMessage);
    console.log('Decrypted message:');
    console.log(decrypted);
  }
} else {
  console.log('❌ Failed to decrypt the expected output');
}
