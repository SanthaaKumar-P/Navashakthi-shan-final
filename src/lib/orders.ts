export const ORDERS_STORAGE_KEY = "navshakthi_orders_v1";
export const ORDERS_UPDATED_EVENT = "navshakthi:orders-updated";

export const ORDER_STATUSES = [
  "Placed",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number] | "Cancelled";
export type PaymentStatus = "Demo Paid" | "Pending" | "Refunded";

export interface OrderItem {
  productId: string;
  artisanId: string;
  artisanName: string;
  title: string;
  image: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  aiPublished?: boolean;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  shippingAddress: ShippingAddress;
  artisanIds: string[];
}

function isBrowser() {
  return typeof window !== "undefined";
}

function readOrders(): Order[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Order[]) : [];
  } catch (error) {
    console.error("Failed to read orders:", error);
    return [];
  }
}

function writeOrders(orders: Order[]) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event(ORDERS_UPDATED_EVENT));
  } catch (error) {
    console.error("Failed to save orders:", error);
  }
}

export function getOrders(): Order[] {
  return readOrders().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getCustomerOrders(customerId?: string): Order[] {
  const all = getOrders();
  if (!customerId) return all;
  return all.filter((o) => o.customerId === customerId);
}

export function getArtisanOrders(artisanId: string): Order[] {
  return getOrders().filter((o) => o.items.some((i) => i.artisanId === artisanId));
}

export function createOrder(
  input: Omit<Order, "id" | "createdAt" | "updatedAt" | "status" | "paymentStatus" | "artisanIds"> &
    Partial<Pick<Order, "status" | "paymentStatus">>,
): Order {
  const now = new Date().toISOString();
  const order: Order = {
    ...input,
    id: `NS-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`,
    status: input.status ?? "Placed",
    paymentStatus: input.paymentStatus ?? "Demo Paid",
    createdAt: now,
    updatedAt: now,
    artisanIds: Array.from(new Set(input.items.map((i) => i.artisanId))),
  };
  writeOrders([order, ...readOrders()]);
  return order;
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | null {
  const orders = readOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx < 0) return null;
  orders[idx] = { ...orders[idx], status, updatedAt: new Date().toISOString() };
  writeOrders(orders);
  return orders[idx];
}

export function getOrder(id: string): Order | null {
  return readOrders().find((o) => o.id === id) ?? null;
}

export function artisanEarnings(artisanId: string) {
  const orders = getArtisanOrders(artisanId);
  let settled = 0;
  let pending = 0;
  let itemsSold = 0;
  for (const o of orders) {
    const value = o.items
      .filter((i) => i.artisanId === artisanId)
      .reduce((s, i) => s + i.totalPrice, 0);
    itemsSold += o.items
      .filter((i) => i.artisanId === artisanId)
      .reduce((s, i) => s + i.quantity, 0);
    if (o.status === "Delivered") settled += value;
    else if (o.status !== "Cancelled") pending += value;
  }
  return { settled, pending, total: settled + pending, orders: orders.length, itemsSold };
}

export const ADDRESS_STORAGE_KEY = "navshakthi_address_v1";

export function getSavedAddress(): ShippingAddress | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(ADDRESS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ShippingAddress) : null;
  } catch {
    return null;
  }
}

export function saveAddress(address: ShippingAddress) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(address));
  } catch (error) {
    console.error("Failed to save address:", error);
  }
}
