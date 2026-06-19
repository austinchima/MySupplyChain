let _accessToken: string | null = null;

export function getToken(): string | null {
  return _accessToken;
}

export function setToken(token: string | null): void {
  _accessToken = token;
}

export function clearToken(): void {
  _accessToken = null;
}

/** Buffer before actual expiry to proactively clear the token (5 minutes) */
const EXPIRY_BUFFER_MS = 5 * 60 * 1000;

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiresIn = payload.exp * 1000 - Date.now();

    if (expiresIn < EXPIRY_BUFFER_MS) {
      return false;
    }

    return true;
  } catch {
    clearToken();
    return false;
  }
}

export interface TokenUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export function getUserFromToken(): TokenUser | null {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    return {
      id: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ?? "",
      username: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ?? "",
      email: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ?? "",
      role: payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? "User",
    };
  } catch {
    clearToken();
    return null;
  }
}
