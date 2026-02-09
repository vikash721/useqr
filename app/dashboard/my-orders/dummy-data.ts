/**
 * Dummy order data for sticker orders. Replace with API when backend is ready.
 */

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  id: string;
  /** Product name (e.g. "QR Code Stickers - Matte") */
  name: string;
  /** Sticker size (e.g. "2\" × 2\"") */
  size: string;
  quantity: number;
  /** Unit price in cents */
  unitPriceCents: number;
};

export type ShippingAddress = {
  name: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type Order = {
  id: string;
  /** Order number for display (e.g. "ORD-2026-001") */
  orderNumber: string;
  placedAt: string; // ISO
  status: OrderStatus;
  items: OrderItem[];
  /** Subtotal in cents */
  subtotalCents: number;
  /** Shipping in cents */
  shippingCents: number;
  /** Tax in cents */
  taxCents: number;
  /** Total in cents */
  totalCents: number;
  shippingAddress: ShippingAddress;
  /** Tracking number when shipped */
  trackingNumber?: string | null;
  /** Carrier (e.g. "USPS", "FedEx") */
  carrier?: string | null;
};

const DUMMY_ORDERS: Order[] = [
  {
    id: "ord-1",
    orderNumber: "ORD-2026-0042",
    placedAt: "2026-02-08T14:30:00Z",
    status: "shipped",
    items: [
      {
        id: "item-1a",
        name: "QR Code Stickers - Matte",
        size: '2" × 2"',
        quantity: 100,
        unitPriceCents: 2499,
      },
      {
        id: "item-1b",
        name: "QR Code Stickers - Glossy",
        size: '1.5" × 1.5"',
        quantity: 50,
        unitPriceCents: 1999,
      },
    ],
    subtotalCents: 174945,
    shippingCents: 899,
    taxCents: 14000,
    totalCents: 189844,
    shippingAddress: {
      name: "Alex Johnson",
      line1: "123 Main St",
      line2: "Apt 4B",
      city: "San Francisco",
      state: "CA",
      postalCode: "94102",
      country: "United States",
    },
    trackingNumber: "9400111899561234567890",
    carrier: "USPS",
  },
  {
    id: "ord-2",
    orderNumber: "ORD-2026-0038",
    placedAt: "2026-02-05T09:15:00Z",
    status: "delivered",
    items: [
      {
        id: "item-2a",
        name: "QR Code Stickers - Matte",
        size: '2" × 2"',
        quantity: 250,
        unitPriceCents: 4499,
      },
    ],
    subtotalCents: 112475,
    shippingCents: 0,
    taxCents: 9000,
    totalCents: 121475,
    shippingAddress: {
      name: "Alex Johnson",
      line1: "123 Main St",
      line2: "Apt 4B",
      city: "San Francisco",
      state: "CA",
      postalCode: "94102",
      country: "United States",
    },
    trackingNumber: "1Z999AA10123456784",
    carrier: "UPS",
  },
  {
    id: "ord-3",
    orderNumber: "ORD-2026-0045",
    placedAt: "2026-02-10T11:00:00Z",
    status: "processing",
    items: [
      {
        id: "item-3a",
        name: "QR Code Stickers - Waterproof",
        size: '2" × 2"',
        quantity: 50,
        unitPriceCents: 2999,
      },
    ],
    subtotalCents: 149950,
    shippingCents: 699,
    taxCents: 12000,
    totalCents: 162649,
    shippingAddress: {
      name: "Alex Johnson",
      line1: "123 Main St",
      line2: "Apt 4B",
      city: "San Francisco",
      state: "CA",
      postalCode: "94102",
      country: "United States",
    },
  },
];

export function getDummyOrders(): Order[] {
  return DUMMY_ORDERS;
}

export function getDummyOrderById(id: string): Order | undefined {
  return DUMMY_ORDERS.find((o) => o.id === id);
}

export function formatOrderStatus(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return labels[status] ?? status;
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatOrderDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
