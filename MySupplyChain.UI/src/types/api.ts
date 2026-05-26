// ─── TypeScript mirrors of every backend DTO ───────────────────────────────

/** Mirrors: MySupplyChain.Application.Products.Queries.GetAllProducts.ProductDto */
export interface ProductDto {
  id: number;
  name: string;
  sku: string;
  currentStock: number;
  reorderPoint: number;
  price: number;
  healthStatus: string; // "Healthy" | "Low Stock"
}

/** Mirrors: MySupplyChain.Application.Products.Queries.GetProductForecast.ProductForecastDto */
export interface ProductForecastDto {
  productId: number;
  productName: string;
  currentStock: number;
  shouldReorder: boolean;
  recommendation: string;
  forecastedUnits: number[];
  lowerBound: number[];
  upperBound: number[];
  totalPredictedDemand: number;
  rmse: number;
  mae: number;
  horizon: number;
}

/** Mirrors: MySupplyChain.Application.ReorderRequests.Queries.GetReorderRequests.ReorderRequestDto */
export interface ReorderRequestDto {
  id: number;
  productId: number;
  productName: string;
  quantityToOrder: number;
  predictedDemand: number;
  requestedAt: string; // ISO date
  status: string;
  justification: string | null;
}

// ─── Command / Request shapes ──────────────────────────────────────────────

/** Mirrors: CreateProductCommand */
export interface CreateProductRequest {
  name: string;
  sku: string;
  price: number;
  currentStock: number;
  reorderPoint: number;
}

/** Mirrors: RestockProductCommand */
export interface RestockProductRequest {
  productId: number;
  quantity: number;
}

/** Mirrors: CreateOrderCommand */
export interface CreateOrderRequest {
  productId: number;
  quantity: number;
}

/** Mirrors: LoginQuery */
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

/** Mirrors: RegisterCommand */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// ─── Generic API response wrappers ─────────────────────────────────────────

export interface RestockResponse {
  currentStock: number;
  message: string;
}

export interface OrderResponse {
  remainingStock: number;
  message: string;
}

export interface AuthResponse {
  token: string;
  message: string;
}
