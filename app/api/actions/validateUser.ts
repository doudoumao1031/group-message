'use server'

import { logger } from '@/util/logger'
import { getApiUrl, API_ENDPOINTS } from '@/util/api'

interface UserValidationResult {
  exists: boolean
  username?: string
  userId?: number
  error?: string
}

/**
 * Validates if a user exists by searching for their ID
 * @param userId The user ID to validate
 * @returns A promise that resolves to a UserValidationResult
 */
export async function validateUser(userId: string): Promise<UserValidationResult> {
  const requestId = `validate_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  
  try {
    logger.info(`[${requestId}] Starting user validation for userId: ${userId}`);
    
    const apiUrl = getApiUrl(API_ENDPOINTS.SEARCH_USER);
    
    // Log request start time for performance tracking
    const startTime = Date.now();
    
    // Send API request
    logger.info(`[${requestId}] Sending validation request to ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: userId }),
      // Next.js 15 fetch options
      cache: 'no-store',
      next: { 
        tags: ['user-validate'] 
      }
    })
    
    // Calculate request duration
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to get response text');
      logger.error(`[${requestId}] Validation API request failed`, { 
        status: response.status, 
        statusText: response.statusText,
        duration,
        errorText
      });
      return {
        exists: false,
        error: `API error: ${response.status} - ${response.statusText}`
      };
    }
    
    // Parse the response
    const responseData = await response.json();
    
    logger.info(`[${requestId}] User validation completed`, { 
      status: response.status,
      duration,
      responseData
    });
    
    // Check if user exists based on API response
    // The API returns { ok: true, data: {...} } when user exists
    if (responseData.ok && responseData.data) {
      const userData = responseData.data;
      return {
        exists: true,
        username: userData.first_name || userData.original_first_name || userId,
        userId: userData.user_id
      };
    } else {
      return {
        exists: false
      };
    }
  } catch (error) {
    logger.error(`[${requestId}] User validation failed`, error);
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
