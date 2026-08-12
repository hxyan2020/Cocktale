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
  demoPaid: string;
  stripeMissing: string;
  processing: string;
  images: string;
  brand: string;
  unit: string;
  shopFromCocktail: string;
  gallery: string;
};

const en: ShopMessages = {
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
  demoPaid: "Demo checkout completed (add Stripe keys for live payments).",
  stripeMissing: "Stripe keys not set — running demo checkout.",
  processing: "Redirecting to secure checkout…",
  images: "Product images",
  brand: "Brand",
  unit: "Unit",
  shopFromCocktail: "Buy ingredients & tools for this drink",
  gallery: "More photos",
};

const catalogs: Partial<Record<LocaleCode, ShopMessages>> = {
  en,
  "zh-CN": {
    ...en,
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
    demoPaid: "演示结账已完成（配置 Stripe 密钥后可真实收款）。",
    stripeMissing: "未配置 Stripe 密钥 — 使用演示结账。",
    shopFromCocktail: "购买这杯所需的原料与工具",
    gallery: "更多图片",
  },
};

export function getShopMessages(locale: LocaleCode): ShopMessages {
  return catalogs[locale] ?? en;
}

export const SHOP_KEYS = Object.keys(en) as (keyof ShopMessages)[];
