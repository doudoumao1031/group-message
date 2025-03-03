'use server'

import { Message } from '@/types/message'
import { logger } from '@/util/logger'
import { getApiUrl, API_ENDPOINTS } from '@/util/api'

interface SendMessageResult {
  success: boolean
  sentMessageId?: number
  errorCode?: string
  errorMessage?: string
}

export async function sendMessage(message: Message): Promise<SendMessageResult> {
  const requestId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  
  try {
    logger.info(`[${requestId}] Starting message send process`, { 
      sender: message.sender,
      receiver: message.receiver,
      messageId: message.id,
      status: message.status
    });
    
    const apiUrl = getApiUrl(API_ENDPOINTS.IMPORT_MESSAGE);
    
    // Get current date in Unix timestamp format
    const currentDate = Math.floor(Date.now() / 1000)
    
    // Prepare the request payload
    const requestData = {
      from: message.sender,
      to: message.receiver,
      data_unix: message.unixTimestamp,
      cur_date: currentDate,
      file_user_id: 0,
      file_msg_id: 0,
      msg: message.content
    }
    
    logger.info(`[${requestId}] Prepared message payload`, { 
      unixTimestamp: message.unixTimestamp,
      currentDate,
      requestData,
      contentLength: message.content.length
    });
    
    // Log request start time for performance tracking
    const startTime = Date.now();
    
    // Send API request
    logger.info(`[${requestId}] Sending API request to ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData),
      // Next.js 15 fetch options
      cache: 'no-store',
      next: { 
        tags: ['message-send'] 
      }
    })
    
    // Calculate request duration
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to get response text');
      logger.error(`[${requestId}] API request failed`, { 
        status: response.status, 
        statusText: response.statusText,
        duration,
        errorText
      });
      return {
        success: false,
        errorCode: 'HTTP_ERROR',
        errorMessage: `API error: ${response.status} - ${response.statusText}`
      };
    }
    
    // Parse the response
    const responseData = await response.json();
    
    // Check if the API call was successful
    // The API returns { ok: true, data: 'success' } when successful
    if (!responseData.ok) {
      logger.error(`[${requestId}] API returned non-success status`, responseData);
      
      // Handle specific error cases
      if (responseData.errMessage) {
        // Time error handling
        if (responseData.errMessage.includes('时间错误')) {
          logger.error(`[${requestId}] Time error detected`, { 
            errorMessage: responseData.errMessage,
            messageTimestamp: message.unixTimestamp,
            currentTimestamp: currentDate
          });
          
          return {
            success: false,
            errorCode: 'TIME_ERROR',
            errorMessage: responseData.errMessage
          };
        }
        
        // Return the specific error message from the API
        return {
          success: false,
          errorCode: 'API_ERROR',
          errorMessage: responseData.errMessage
        };
      }
      
      // Generic error case
      return {
        success: false,
        errorCode: 'UNKNOWN_ERROR',
        errorMessage: 'API returned non-success status'
      };
    }
    
    // Generate a message ID for tracking purposes
    // Since the API doesn't return a specific message ID
    const sentMessageId = Date.now();
    
    logger.info(`[${requestId}] Message sent successfully`, { 
      status: response.status,
      duration,
      messageId: message.id,
      sentMessageId,
      responseData
    });
    
    // No verification needed with the new API
    return {
      success: true,
      sentMessageId
    };
  } catch (error) {
    logger.error(`[${requestId}] Failed to send message`, error);
    return {
      success: false,
      errorCode: 'EXCEPTION',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
