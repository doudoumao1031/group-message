import { encryptMsg, decryptMsg } from './crypto';

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

// Run the test
function runTest() {
  console.log('Running crypto algorithm test...');
  console.log('Formatted test message:');
  console.log(testMessage);
  console.log('\n');

  // Encrypt our test message
  const encrypted = encryptMsg(testMessage);
  console.log('Our encryption result:');
  console.log(encrypted);
  console.log('\n');

  console.log('Expected encryption result:');
  console.log(expectedEncrypted);
  console.log('\n');

  // Compare the results
  console.log('Comparing encryption results:');
  if (encrypted === expectedEncrypted) {
    console.log(' EXACT MATCH - Encryption outputs are identical');
  } else {
    console.log(' NOT EXACT MATCH - Encryption outputs differ');
    console.log('This could be due to:');
    console.log('1. Random IV generation (expected)');
    console.log('2. Different salt key or encryption parameters');
    console.log('3. Different message formatting');
    
    // Check lengths
    console.log(`\nOur encrypted length: ${encrypted.length}`);
    console.log(`Expected encrypted length: ${expectedEncrypted.length}`);
    
    // Try to decrypt both to compare
    try {
      console.log('\nDecrypting our encrypted result:');
      const ourDecrypted = decryptMsg(encrypted);
      console.log(ourDecrypted);
      
      console.log('\nAttempting to decrypt the expected output:');
      try {
        const theirDecrypted = decryptMsg(expectedEncrypted);
        console.log(theirDecrypted);
        
        console.log('\nComparing decrypted results:');
        if (ourDecrypted === theirDecrypted) {
          console.log(' DECRYPTION MATCH - Both decrypt to the same message');
        } else {
          console.log(' DECRYPTION MISMATCH - Different decryption results');
          console.log('This suggests a different encryption algorithm or key');
        }
      } catch (error: unknown) {
        // Type guard to check if error is an Error object
        if (error instanceof Error) {
          console.error('\n CANNOT DECRYPT EXPECTED OUTPUT:', error.message);
        } else {
          console.error('\n CANNOT DECRYPT EXPECTED OUTPUT:', String(error));
        }
        console.log('This suggests our implementation is not compatible with the one that produced the expected output');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('\n DECRYPTION ERROR:', error.message);
      } else {
        console.error('\n DECRYPTION ERROR:', String(error));
      }
    }
  }
}

// Execute the test
runTest();
