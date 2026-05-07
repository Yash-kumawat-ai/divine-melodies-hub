export function parseSupabaseError(error: unknown): string {
  if (!error) return 'An unknown error occurred';
  
  const err = error as { message?: string; code?: string; details?: string };
  const message = err.message || err.details || String(error);
  const code = err.code || '';
  const normalized = message.toLowerCase();
  
  if (normalized.includes('23505') || normalized.includes('duplicate')) {
    if (normalized.includes('email')) {
      return 'This email is already registered. Please log in instead.';
    }
    if (normalized.includes('title')) {
      return 'This bhajan already exists in our database.';
    }
    return 'This record already exists. Please try something different.';
  }
  
  if (normalized.includes('42501') || normalized.includes('permission denied') || normalized.includes('row-level security')) {
    return 'You do not have permission to perform this action.';
  }
  
  if (normalized.includes('23503') || normalized.includes('foreign key')) {
    return 'Invalid data provided. Please check your selections.';
  }
  
  if (normalized.includes('invalid login credentials') || normalized.includes('invalid credentials')) {
    return 'No account found for this email, or the password is incorrect.';
  }
  
  if (normalized.includes('email not confirmed')) {
    return 'Please verify your email first, then sign in.';
  }
  
  if (normalized.includes('user already registered')) {
    return 'This email is already registered. Please log in instead.';
  }
  
  if (normalized.includes('rate limit') || normalized.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  
  if (normalized.includes('network') || normalized.includes('fetch')) {
    return 'Network error. Please check your internet connection.';
  }
  
  if (code === 'PGRST301') {
    return 'Missing required data. Please fill in all fields.';
  }
  
  return message || 'An error occurred. Please try again.';
}

export function parseApiError(error: unknown, fallback = 'An error occurred. Please try again.'): string {
  if (!error) return fallback;
  
  const err = error as { message?: string; status?: number };
  const message = err.message || String(error);
  const status = err.status;
  
  if (status === 401) {
    return 'Session expired. Please log in again.';
  }
  
  if (status === 403) {
    return 'You do not have permission to perform this action.';
  }
  
  if (status === 404) {
    return 'The requested resource was not found.';
  }
  
  if (status === 500) {
    return 'Server error. Please try again later.';
  }
  
  if (status && status >= 500) {
    return 'Server error. Please try again later.';
  }
  
  if (status && status >= 400) {
    return 'Request failed. Please check your input.';
  }
  
  const normalized = message.toLowerCase();
  if (normalized.includes('network') || normalized.includes('fetch') || normalized.includes('failed to fetch')) {
    return 'Network error. Please check your internet connection.';
  }
  
  return message || fallback;
}

export function logError(context: string, error: unknown): void {
  console.error(`[${context}]`, error);
}