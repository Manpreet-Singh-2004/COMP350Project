import inventoryData from "./inventoryData.json";

export type ProductStatus = "ok" | "low" | "out";

export interface Product {
  id: string;
  name: string;
  category: string;
  vendor: string;
  price: number;
  stock: number;
  safetyStock: number;
  reorderPoint: number;
  leadTimeDays: number;
  status: ProductStatus;
  lastSold: string;
  weeklyVelocity: number;
}

export interface Category {
  id: string;
  name: string;
  skuCount: number;
  value: number;
}

export interface ActivityItem {
  id: string;
  type: "restock" | "alert" | "sale";
  sku: string;
  name: string;
  quantity?: number;
  message?: string;
  timestamp: string;
}

export interface StoreSummary {
  totalSKUs: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  pendingOrders: number;
}

export function getInventoryData() {
  return inventoryData;
}

export function getProducts(): Product[] {
  return inventoryData.products as Product[];
}

export function getCategories(): Category[] {
  return inventoryData.categories;
}

export function getSummary(): StoreSummary {
  return inventoryData.summary;
}

export function getRecentActivity(): ActivityItem[] {
  return inventoryData.recentActivity as ActivityItem[];
}

export function getStoreInfo() {
  return inventoryData.store;
}