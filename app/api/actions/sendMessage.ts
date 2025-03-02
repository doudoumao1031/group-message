'use server'

import { Message } from '@/types/message'

// Convert datetime to Unix timestamp
const getUnixTimestamp = (dateTimeStr: string) => {
  return Math.floor(new Date(dateTimeStr).getTime() / 1000)
}

// Logger function that works in all environments
const logger = {
  info: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: 'INFO',
      message,
      data,
    };
    console.log(`[${timestamp}] [INFO] ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: 'ERROR',
      message,
      error: error?.message || error,
    };
    console.error(`[${timestamp}] [ERROR] ${message}`, error || '');
  }
};

export async function sendMessage(message: Message): Promise<boolean> {
  const requestId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  
  try {
    logger.info(`[${requestId}] Starting message send process`, { 
      sender: message.sender,
      receiver: message.receiver,
      messageId: message.id,
      status: message.status
    });
    
    const apiUrl = 'https://api.rct2008.com:8443/10450935:3jZ73ZfO8Zgj85AAS9VzU5WP/sendTextMessage'
    
    // Prepare message data
    const unixTimestamp = getUnixTimestamp(message.time)
    const messageText = `#sendmessage\nfrom:${message.sender}\nto:${message.receiver}\ndateunix:${unixTimestamp}\nmsg:${message.content}`
    
    logger.info(`[${requestId}] Prepared message payload`, { 
      unixTimestamp,
      contentLength: message.content.length
    });
    
    const requestData = {
      chat_id: 777000,
      chat_type: 1,
      text: messageText
    }
    
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
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }
    
    // Log successful response
    logger.info(`[${requestId}] Message sent successfully`, { 
      status: response.status,
      duration,
      messageId: message.id
    });
    
    return true;
  } catch (error) {
    logger.error(`[${requestId}] Failed to send message`, error);
    return false;
  }
}
