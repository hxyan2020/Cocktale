export type ProductImage = {
  angle: "hero" | "front" | "side" | "detail" | "packaging" | "lifestyle";
  url: string;
  alt: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: "ingredient" | "utensil" | "accessory" | "glassware";
  subcategory: string;
  priceCents: number;
  currency: "usd";
  description: string;
  longDescription: string;
  specs: { label: string; value: string }[];
  images: ProductImage[];
  stock: number;
  unit: string;
  brand: string;
  tags: string[];
  relatedCocktailIds: string[];
  sourceKey: string;
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type OrderStatus = "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

export type OrderLine = {
  productId: string;
  name: string;
  unitAmountCents: number;
  quantity: number;
  image: string;
};

export type ShippingAddress = {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
};

export type Order = {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  currency: "usd";
  subtotalCents: number;
  totalCents: number;
  items: OrderLine[];
  stripeSessionId?: string;
  stripePaymentIntentId?: string | null;
  shippingName?: string;
  shippingEmail?: string;
  shippingPhone?: string;
  shippingAddress?: ShippingAddress;
  carrier?: string;
  trackingNumber?: string;
  shippedAt?: string;
  notes?: string;
  demo?: boolean;
};

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "fulfilled",
  "cancelled",
  "refunded",
] as const;

export const PAYMENT_STATUSES = ["unpaid", "paid", "refunded"] as const;
