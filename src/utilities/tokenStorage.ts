// Enums
export enum StorageKey {
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
  USER_DATA = 'USER_DATA',
}

// Interface
export interface TokenStorage {
  saveTokens(accessToken: string, refreshToken: string): void;
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  clearTokens(): void;
  isTokenExpired(token: string): boolean;
}

// Token storage functions
export function saveTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(StorageKey.ACCESS_TOKEN, accessToken);
  localStorage.setItem(StorageKey.REFRESH_TOKEN, refreshToken);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(StorageKey.ACCESS_TOKEN);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(StorageKey.REFRESH_TOKEN);
}

export function clearTokens(): void {
  localStorage.removeItem(StorageKey.ACCESS_TOKEN);
  localStorage.removeItem(StorageKey.REFRESH_TOKEN);
  localStorage.removeItem(StorageKey.USER_DATA);
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true;
  }
}
