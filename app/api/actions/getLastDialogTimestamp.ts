'use server'

import { logger } from '@/util/logger'
import { getApiUrl, API_ENDPOINTS } from '@/util/api'

/**
 * Fetches the last dialog timestamp between two users
 * @param from The sender ID
 * @param to The receiver ID
 * @returns The last timestamp or error information
 */
export async function getLastDialogTimestamp(from: string, to: string): Promise<{ timestamp: number | null; error: string | null }> {
  logger.info(`[getLastDialogTimestamp] Starting with params:`, { from, to });
  
  try {
    // Skip if either sender or receiver is empty
    if (!from || !to) {
      logger.warn(`[getLastDialogTimestamp] Missing sender or receiver`, { from, to });
      return { timestamp: null, error: null };
    }
    
    const apiUrl = getApiUrl(API_ENDPOINTS.GET_DIALOG_LAST_DATE);
    logger.info(`[getLastDialogTimestamp] Fetching from API:`, { apiUrl });
    
    const startTime = Date.now();
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from, to }),
      cache: 'no-store'
    });
    const responseTime = Date.now() - startTime;
    
    logger.info(`[getLastDialogTimestamp] API response received`, { 
      status: response.status, 
      statusText: response.statusText,
      responseTimeMs: responseTime
    });
    
    if (!response.ok) {
      logger.error(`[getLastDialogTimestamp] Failed to get last dialog timestamp`, { 
        status: response.status, 
        statusText: response.statusText,
        from,
        to
      });
      return { timestamp: null, error: `API错误: ${response.status} ${response.statusText}` };
    }
    
    const responseData = await response.json();
    logger.info(`[getLastDialogTimestamp] Response data:`, responseData);
    
    if (!responseData.ok) {
      logger.error(`[getLastDialogTimestamp] API returned non-success status`, {
        errMessage: responseData.errMessage,
        from,
        to,
        responseData
      });
      return { timestamp: null, error: responseData.errMessage || '获取最后对话时间戳失败' };
    }
    
    logger.info(`[getLastDialogTimestamp] Successfully retrieved timestamp:`, { 
      timestamp: responseData.data,
      from,
      to,
      formattedTime: new Date(responseData.data).toISOString()
    });
    
    return { timestamp: responseData.data, error: null };
  } catch (error) {
    logger.error(`[getLastDialogTimestamp] Exception occurred`, { 
      error, 
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      from,
      to
    });
    return { timestamp: null, error: '获取最后对话时间戳时发生异常' };
  }
}
