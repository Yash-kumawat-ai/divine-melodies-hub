interface FetchRetryOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

const DEFAULT_RETRIES = 3;
const DEFAULT_DELAY = 500;
const DEFAULT_TIMEOUT = 10000;

export async function fetchWithRetry(
  url: string,
  options: FetchRetryOptions = {}
): Promise<Response> {
  const {
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_DELAY,
    timeout = DEFAULT_TIMEOUT,
    ...fetchOptions
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok && attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }
  }

  clearTimeout(timeoutId);
  throw lastError || new Error('Request failed after retries');
}

export function createQueryOptions<T>(options: {
  queryKey: unknown[];
  queryFn: () => Promise<T>;
  staleTime?: number;
  retry?: number;
}) {
  return {
    queryKey: options.queryKey,
    queryFn: options.queryFn,
    staleTime: options.staleTime || 5 * 60 * 1000,
    retry: options.retry || 3,
  };
}