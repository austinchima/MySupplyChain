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

// ─── Base URL (proxied via Vite in dev, direct in prod) ────────────────────
const BASE = "/api";

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
