// Generic API helper that handles token storage and 401 responses.

const API_BASE = 'http://localhost:4000/api/v1';

let logoutCallback: (() => void) | null = null;

export const registerLogoutCallback = (fn: () => void) => {
  logoutCallback = fn;
};

export const setToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const getTokenPayload = (): any | null => {
  const token = getToken();
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
};

interface RequestOptions extends RequestInit {
  body?: any;
}

export class ApiError extends Error {
  status: number;
  body?: any;

  constructor(message: string, status: number, body?: any) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function handleResponse(response: Response) {
  if (response.status === 401) {
    // unauthorized, token invalid/expired
    if (logoutCallback) logoutCallback();
    throw new ApiError('Unauthorized', 401);
  }

  // throw on non-ok status except 204
  if (!response.ok && response.status !== 204) {
    const errorText = await response.text();
    let errMsg = errorText;
    let body: any;
    try {
      body = JSON.parse(errorText);
      errMsg = body.message || JSON.stringify(body);
    } catch {
      body = errorText;
    }
    throw new ApiError(errMsg || response.statusText, response.status, body);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  return handleResponse(res);
}
