'use server'

import { logger } from '@/util/logger'
import { getApiUrl, API_ENDPOINTS } from '@/util/api'

/**
 * Fetches the last dialog timestamp between two users
 * @param from The sender ID
 * @param to The receiver ID
 * @returns The last timestamp or null if error
 */
export async function getLastDialogTimestamp(from: string, to: string): Promise<number | null> {
  try {
    // Skip if either sender or receiver is empty
    if (!from || !to) {
      return null;
    }
    
    const apiUrl = getApiUrl(API_ENDPOINTS.GET_DIALOG_LAST_DATE);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from, to }),
      cache: 'no-store'
    });
    
    if (!response.ok) {
      logger.error(`Failed to get last dialog timestamp`, { 
        status: response.status, 
        statusText: response.statusText
      });
      return null;
    }
    
    const responseData = await response.json();
    
    if (!responseData.ok) {
      logger.error(`API returned non-success status for last dialog timestamp`, responseData);
      return null;
    }
    
    return responseData.data;
  } catch (error) {
    logger.error(`Exception when getting last dialog timestamp`, error);
    return null;
  }
}
