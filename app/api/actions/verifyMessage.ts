'use server'

import { logger } from '@/util/logger'

interface UpdateResponse {
  ok: boolean
  result: Update[]
}

interface Update {
  update_id: number
  message?: {
    message_id: number
    chat: {
      id: number
      type: number
      title: string
    }
    from: {
      id: number
      first_name: string
      last_name: string
      username: string
    }
    text: string
    date: number
  }
  inline_query: any
  lang: string
}

/**
 * Verifies if a message was successfully delivered by checking the getUpdates API
 * @param messageId The message_id returned from the sendTextMessage API
 * @returns A promise that resolves to true if the message was found, false otherwise
 */
export async function verifyMessage(messageId: number): Promise<boolean> {
  const requestId = `verify_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  
  try {
    logger.info(`[${requestId}] Starting message verification for messageId: ${messageId}`);
    
    const apiUrl = 'https://api.rct2008.com:8443/10450935:3jZ73ZfO8Zgj85AAS9VzU5WP/getUpdates'
    
    // Log request start time for performance tracking
    const startTime = Date.now();
    
    // Send API request
    logger.info(`[${requestId}] Sending verification request to ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      // Next.js 15 fetch options
      cache: 'no-store',
      next: { 
        tags: ['message-verify'] 
      }
    })
    
    // Calculate request duration
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to get response text');
      logger.error(`[${requestId}] Verification API request failed`, { 
        status: response.status, 
        statusText: response.statusText,
        duration,
        errorText
      });
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }
    
    const data: UpdateResponse = await response.json();
    
    if (!data.ok) {
      logger.error(`[${requestId}] API returned non-OK status`, data);
      return false;
    }
    
    // Check if the message_id exists in any of the updates
    const foundMessage = data.result.some(update => 
      update.message && update.message.message_id === messageId
    );
    
    logger.info(`[${requestId}] Message verification result`, { 
      messageId,
      found: foundMessage,
      duration,
      updateCount: data.result.length
    });
    
    return foundMessage;
  } catch (error) {
    logger.error(`[${requestId}] Failed to verify message`, error);
    return false;
  }
}
