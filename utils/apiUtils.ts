import pThrottle from 'p-throttle';
import pRetry from 'p-retry';

/**
 * Configure throttling based on typical Gemini Flash limits.
 * 15 requests per minute = 1 request every 4 seconds.
 * Adjust these via environment variables if available.
 */
const RPM = Number(process.env.GEMINI_RPM || 15);
const throttle = pThrottle({
	limit: RPM,
	interval: 60000
});

/**
 * A throttled and retried fetch wrapper for Gemini API calls.
 */
export const throttledGeminiFetch = throttle(async (url: string, options: RequestInit) => {
  return pRetry(async () => {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      console.warn(`Gemini API rate limited (429) for ${url}. Retrying...`);
      throw new Error('Rate limit exceeded');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error ${response.status}: ${JSON.stringify(errorData)}`);
    }
    
    return response;
  }, {
    retries: 3,
    onFailedAttempt: error => {
      console.log(`Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`);
    }
  });
});
