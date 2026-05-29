const TOKEN_KEY = "supplychain_jwt";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;

  // Check if token is expired by decoding the payload
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
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
    if (payload.exp * 1000 <= Date.now()) return null;

    return {
      id: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ?? "",
      username: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ?? "",
      email: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ?? "",
      role: payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? "User",
    };
  } catch {
    return null;
  }
}
