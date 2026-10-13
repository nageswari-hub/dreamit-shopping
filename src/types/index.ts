export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rate: number; // against 1 USD
}

export interface ProductVariantColor {
  name: string;
  hex: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number; // in USD
  originalPrice?: number;
  category: 'Electronics' | 'Fashion' | 'Home & Living' | 'Accessories' | 'Fitness';
  brand: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  images: string[];
  colors?: ProductVariantColor[];
  sizes?: string[];
  tags: string[];
  featured?: boolean;
  isNew?: boolean;
  specs?: Record<string, string>;
}

export interface CartItem {
  id: string; // generated unique id: `${product.id}-${color}-${size}`
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  minSubtotal: number;
  description: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  cost: number;
  estimatedDays: string;
  description: string;
}

export interface OrderCustomer {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingCost: number;
  tax: number;
  total: number;
  currency: CurrencyCode;
  customer: OrderCustomer;
  shippingMethod: ShippingMethod;
  paymentMethod: 'card' | 'upi' | 'cod';
  status: 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered';
  trackingNumber: string;
}

export interface FilterState {
  category: string;
  search: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  inStockOnly: boolean;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
}
