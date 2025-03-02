'use server'

import { logger } from '@/util/logger'
import { verifyMessage } from './verifyMessage'

/**
 * Manually verify a message by its sentMessageId
 * @param sentMessageId The message_id returned from the sendTextMessage API
 * @returns A promise that resolves to true if the message was found, false otherwise
 */
export async function verifyMessageById(sentMessageId: number): Promise<boolean> {
  const requestId = `manual_verify_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  
  try {
    logger.info(`[${requestId}] Starting manual message verification for messageId: ${sentMessageId}`);
    
    // Verify message delivery using getUpdates API
    const isVerified = await verifyMessage(sentMessageId);
    
    logger.info(`[${requestId}] Manual message verification result`, { 
      sentMessageId,
      isVerified
    });
    
    return isVerified;
  } catch (error) {
    logger.error(`[${requestId}] Failed to manually verify message`, error);
    return false;
  }
}
