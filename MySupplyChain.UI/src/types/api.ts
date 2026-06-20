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

/** Mirrors: MySupplyChain.Application.Orders.Queries.GetOrders.OrderDto */
export interface OrderDto {
  id: number;
  orderNumber: string;
  date: string;
  customer: string;
  items: number;
  status: string;
  total: string;
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
  email: string;
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

export interface ImportSummaryDto {
  recordsImported: number;
  newProductsCreated: number;
}

/** Mirrors: MySupplyChain.Application.Suppliers.Queries.GetSupplierKpi.SupplierKpiDto */
export interface SupplierKpiDto {
  supplierId: string;
  supplierName: string;
  promisedLeadTimeDays: number;
  /** Average actual lead time in days. Null if no orders received yet. */
  avgActualLeadTimeDays: number | null;
  /** Percentage of orders delivered on time. Null if no orders received yet. */
  onTimePercentage: number | null;
  totalOrdersReceived: number;
}

