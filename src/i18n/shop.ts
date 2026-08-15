import type { LocaleCode } from "@/i18n/locales";

export type ShopMessages = {
  market: string;
  cart: string;
  orders: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  all: string;
  ingredients: string;
  utensils: string;
  glassware: string;
  accessories: string;
  addToCart: string;
  added: string;
  buyGear: string;
  price: string;
  inStock: string;
  outOfStock: string;
  specs: string;
  description: string;
  related: string;
  cartTitle: string;
  cartEmpty: string;
  quantity: string;
  remove: string;
  subtotal: string;
  checkout: string;
  continueShopping: string;
  ordersTitle: string;
  ordersEmpty: string;
  orderStatus: string;
  orderTotal: string;
  viewOrder: string;
  successTitle: string;
  successBody: string;
  successPending: string;
  successMissing: string;
  successFailed: string;
  demoPaid: string;
  stripeMissing: string;
  checkoutDemo: string;
  processing: string;
  images: string;
  brand: string;
  unit: string;
  shopFromCocktail: string;
  gallery: string;
  trackTitle: string;
  trackPlaced: string;
  trackPaid: string;
  trackPreparing: string;
  trackFulfilled: string;
  trackPending: string;
  trackCancelled: string;
  trackRefunded: string;
  productCount: string;
  productNotFound: string;
  orderNotFound: string;
  item: string;
  photo: string;
  stripeSession: string;
  demoLabel: string;
  guest: string;
};

export const EN_SHOP_MESSAGES: ShopMessages = {
  market: "Market",
  cart: "Cart",
  orders: "Orders",
  title: "Cocktale Market",
  subtitle: "Ingredients, glassware, and bar tools from every recipe—priced and ready to ship.",
  searchPlaceholder: "Search products…",
  all: "All",
  ingredients: "Ingredients",
  utensils: "Utensils",
  glassware: "Glassware",
  accessories: "Accessories",
  addToCart: "Add to cart",
  added: "Added",
  buyGear: "Shop what you need",
  price: "Price",
  inStock: "In stock",
  outOfStock: "Out of stock",
  specs: "Specifications",
  description: "Description",
  related: "Used in cocktails",
  cartTitle: "Your cart",
  cartEmpty: "Your cart is empty. Browse the market to stock your bar.",
  quantity: "Qty",
  remove: "Remove",
  subtotal: "Subtotal",
  checkout: "Checkout with Stripe",
  continueShopping: "Continue shopping",
  ordersTitle: "Purchase history",
  ordersEmpty: "No orders yet. Complete a checkout to see them here.",
  orderStatus: "Status",
  orderTotal: "Total",
  viewOrder: "View order",
  successTitle: "Order confirmed",
  successBody: "Thanks—your bar shelf is on the way. Track everything in Orders.",
  successPending: "Confirming your payment…",
  successMissing: "No checkout session found. If you already paid, open Orders to check status.",
  successFailed: "We could not confirm this payment yet. Your card may still have been charged—check Orders or try again from Cart.",
  demoPaid: "Demo checkout completed (add Stripe keys for live card payments).",
  stripeMissing: "Stripe keys not set — running demo checkout.",
  checkoutDemo: "Complete demo checkout",
  processing: "Redirecting to secure checkout…",
  images: "Product images",
  brand: "Brand",
  unit: "Unit",
  shopFromCocktail: "Buy ingredients & tools for this drink",
  gallery: "More photos",
  trackTitle: "Order tracking",
  trackPlaced: "Order placed",
  trackPaid: "Payment confirmed",
  trackPreparing: "Preparing shipment",
  trackFulfilled: "Fulfilled",
  trackPending: "Awaiting payment",
  trackCancelled: "Cancelled",
  trackRefunded: "Refunded",
  productCount: "{n} products",
  productNotFound: "Product not found.",
  orderNotFound: "Order not found.",
  item: "Item",
  photo: "Photo",
  stripeSession: "Stripe session",
  demoLabel: "demo",
  guest: "Guest",
};

const catalogs: Partial<Record<LocaleCode, ShopMessages>> = {
  en: EN_SHOP_MESSAGES,
  "zh-CN": {
    ...EN_SHOP_MESSAGES,
    market: "市集",
    cart: "购物车",
    orders: "订单",
    title: "Cocktale 市集",
    subtitle: "每一张鸡尾酒卡片里的原料、杯具与工具——标好价格，即可下单。",
    searchPlaceholder: "搜索商品…",
    all: "全部",
    ingredients: "原料",
    utensils: "器具",
    glassware: "杯具",
    accessories: "配件",
    addToCart: "加入购物车",
    added: "已加入",
    buyGear: "购买所需物料",
    inStock: "有货",
    outOfStock: "缺货",
    specs: "规格参数",
    description: "商品描述",
    cartTitle: "购物车",
    cartEmpty: "购物车是空的。去市集为吧台补货吧。",
    checkout: "通过 Stripe 结账",
    continueShopping: "继续购物",
    ordersTitle: "购买记录",
    ordersEmpty: "还没有订单。完成结账后会显示在这里。",
    orderStatus: "状态",
    orderTotal: "合计",
    viewOrder: "查看订单",
    successTitle: "订单已确认",
    successBody: "感谢购买——可在「订单」中查看与管理。",
    successPending: "正在确认付款…",
    successMissing: "未找到结账会话。如果已付款，请到「订单」查看状态。",
    successFailed: "暂时无法确认付款。银行卡可能已扣款——请到「订单」查看，或从购物车重试。",
    demoPaid: "演示结账已完成（配置 Stripe 密钥后可真实收款）。",
    stripeMissing: "未配置 Stripe 密钥 — 使用演示结账。",
    checkoutDemo: "完成演示结账",
    shopFromCocktail: "购买这杯所需的原料与工具",
    gallery: "更多图片",
    trackTitle: "订单追踪",
    trackPlaced: "已下单",
    trackPaid: "已付款",
    trackPreparing: "备货中",
    trackFulfilled: "已发货/完成",
    trackPending: "等待付款",
  },
};

export function getShopMessages(locale: LocaleCode): ShopMessages {
  return catalogs[locale] ?? EN_SHOP_MESSAGES;
}

export const SHOP_KEYS = Object.keys(EN_SHOP_MESSAGES) as (keyof ShopMessages)[];
