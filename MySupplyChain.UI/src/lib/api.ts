import { getToken } from "./auth";
import type {
  ProductDto,
  ProductForecastDto,
  ReorderRequestDto,
  OrderDto,
  CreateProductRequest,
  RestockProductRequest,
  RestockResponse,
  CreateOrderRequest,
  OrderResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ImportSummaryDto,
} from "../types/api";

// In production (Vercel), VITE_API_BASE_URL or VITE_API_URL is set to the Render backend URL
const getBaseUrl = (): string => {
  let envUrl = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL;
  if (!envUrl) return "/api";
  
  // Clean up any Swagger suffixes copied directly from browsers
  envUrl = envUrl.replace(/\/swagger(\/index\.html)?\/?$/i, "");
  
  return envUrl.endsWith("/api") ? envUrl : `${envUrl.replace(/\/$/, "")}/api`;
};
const BASE = getBaseUrl();



// ─── Generic fetch wrapper with JWT injection ──────────────────────────────

function createApiError(status: number, message: string): Error {
  const err = new Error(message);
  err.name = "ApiError";
  (err as Error & { status: number }).status = status;
  return err;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw createApiError(res.status, body || res.statusText);
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export const auth = {
  login: (data: LoginRequest) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (data: RegisterRequest) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  resetLedger: () =>
    request<void>("/auth/reset-ledger", {
      method: "DELETE",
    }),

  deleteAccount: () =>
    request<void>("/auth/account", {
      method: "DELETE",
    }),

  updateUsername: (newUsername: string, currentPassword: string) =>
    request<AuthResponse>("/auth/username", {
      method: "PUT",
      body: JSON.stringify({ newUsername, currentPassword }),
    }),
};

// ─── Products ──────────────────────────────────────────────────────────────

export const products = {
  /** GET /api/products → ProductDto[] */
  getAll: () => request<ProductDto[]>("/products"),

  /** POST /api/products → int (new product ID) */
  create: (data: CreateProductRequest) =>
    request<number>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** PATCH /api/products/{id} */
  update: (id: number, data: Partial<CreateProductRequest> & { id: number }) =>
    request<void>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  /** DELETE /api/products/{id} */
  delete: (id: number) =>
    request<void>(`/products/${id}`, {
      method: "DELETE",
    }),

  /** GET /api/products/{id}/forecast?daysToForecast=N → ProductForecastDto */
  getForecast: (id: number, days = 30) =>
    request<ProductForecastDto>(
      `/products/${id}/forecast?daysToForecast=${days}`,
    ),

  /** POST /api/products/{id}/restock → RestockResponse */
  restock: (id: number, data: RestockProductRequest) =>
    request<RestockResponse>(`/products/${id}/restock`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Orders ────────────────────────────────────────────────────────────────

export const orders = {
  /** GET /api/orders → OrderDto[] */
  getAll: () => request<OrderDto[]>("/orders"),

  /** POST /api/orders → OrderResponse */
  create: (data: CreateOrderRequest) =>
    request<OrderResponse>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** PATCH /api/orders/{id} */
  updateStatus: (id: number, data: { id: number, status: number }) =>
    request<void>(`/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  /** DELETE /api/orders/{id} */
  delete: (id: number) =>
    request<void>(`/orders/${id}`, {
      method: "DELETE",
    }),
};

// ─── Reorder Requests ──────────────────────────────────────────────────────

export const reorderRequests = {
  /** GET /api/reorderrequests → ReorderRequestDto[] */
  getAll: () => request<ReorderRequestDto[]>("/reorderrequests"),
};

// ─── Sales Histories ──────────────────────────────────────────────────────

export const salesHistories = {
  /** POST /api/saleshistories/import (Multipart form) */
  import: (formData: FormData) =>
    request<ImportSummaryDto>("/saleshistories/import", {
      method: "POST",
      body: formData,
    }),
};
