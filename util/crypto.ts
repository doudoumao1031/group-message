/**
 * Implementation of the AES encryption logic
 * Uses CryptoJS library for AES encryption
 * Compatible with both client and server components
 */

// Import CryptoJS for AES encryption
import CryptoJS from 'crypto-js';

// Salt key (same as in Golang)
const saltKey = CryptoJS.enc.Utf8.parse("0ZLiNKQebR14xtBY");

/**
 * PKCS7 padding function
 * Note: CryptoJS handles padding automatically, but this is included for reference
 * @param {string} data - Data to pad
 * @param {number} blockSize - Block size
 * @returns {string} - Padded data
 */
const pad = (data: string, blockSize: number): string => {
  const padding = blockSize - (data.length % blockSize);
  const padChar = String.fromCharCode(padding);
  return data + padChar.repeat(padding);
};

/**
 * AES encrypt function - equivalent to the Golang EncryptMsg function
 * @param {string} plaintext - Text to encrypt
 * @returns {string} - Hex-encoded encrypted string
 */
export const encryptMsg = (plaintext: string): string => {
  try {
    // Generate random IV
    const iv = CryptoJS.lib.WordArray.random(16);
    
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
    console.error('Encryption error:', error);
    throw error;
  }
};

/**
 * Decrypt function (not in the original Golang code, but added for completeness)
 * @param {string} ciphertext - Hex-encoded encrypted string
 * @returns {string} - Decrypted plaintext
 */
export const decryptMsg = (ciphertext: string): string => {
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
    console.error('Decryption error:', error);
    throw error;
  }
};