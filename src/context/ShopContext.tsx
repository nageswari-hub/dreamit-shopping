import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Product,
  CartItem,
  Order,
  Review,
  Coupon,
  CurrencyCode,
  FilterState,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  CURRENCIES,
  AVAILABLE_COUPONS,
} from '../data/mockProducts';
import { getStorageItem, setStorageItem } from '../utils/storage';

interface ShopContextType {
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  reviews: Record<string, Review[]>;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatPrice: (amountInUSD: number) => string;
  convertPrice: (amountInUSD: number) => number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  cartSubtotal: number;
  cartDiscount: number;
  cartCount: number;
  freeShippingThreshold: number;
  freeShippingGap: number;
  addToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'trackingNumber'>) => Order;
  addReview: (productId: string, userName: string, rating: number, comment: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviewsCount'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  resetToDefaults: () => void;
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  activeTab: 'shop' | 'orders' | 'admin';
  setActiveTab: (tab: 'shop' | 'orders' | 'admin') => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  notification: { message: string; type: 'success' | 'info' | 'error' } | null;
  showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const INITIAL_FILTERS: FilterState = {
  category: 'All',
  search: '',
  minPrice: 0,
  maxPrice: 500,
  minRating: 0,
  inStockOnly: false,
  sortBy: 'featured',
};

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Products
  const [products, setProducts] = useState<Product[]>(() =>
    getStorageItem('elevate_products', INITIAL_PRODUCTS)
  );

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() =>
    getStorageItem('elevate_cart', [])
  );

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() =>
    getStorageItem('elevate_wishlist', [])
  );

  // Orders
  const [orders, setOrders] = useState<Order[]>(() =>
    getStorageItem('elevate_orders', [])
  );

  // Reviews
  const [reviews, setReviews] = useState<Record<string, Review[]>>(() =>
    getStorageItem('elevate_reviews', INITIAL_REVIEWS)
  );

  // Currency
  const [currency, setCurrency] = useState<CurrencyCode>(() =>
    getStorageItem('elevate_currency', 'USD')
  );

  // Coupon
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() =>
    getStorageItem('elevate_coupon', null)
  );

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('elevate_theme');
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // UI States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'shop' | 'orders' | 'admin'>('shop');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    setStorageItem('elevate_products', products);
  }, [products]);

  useEffect(() => {
    setStorageItem('elevate_cart', cart);
  }, [cart]);

  useEffect(() => {
    setStorageItem('elevate_wishlist', wishlist);
  }, [wishlist]);

  useEffect(() => {
    setStorageItem('elevate_orders', orders);
  }, [orders]);

  useEffect(() => {
    setStorageItem('elevate_reviews', reviews);
  }, [reviews]);

  useEffect(() => {
    setStorageItem('elevate_currency', currency);
  }, [currency]);

  useEffect(() => {
    setStorageItem('elevate_coupon', appliedCoupon);
  }, [appliedCoupon]);

  // Sync dark mode class on <html>
  useEffect(() => {
    localStorage.setItem('elevate_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 3200);
  };

  // Currency conversions
  const convertPrice = (usdAmount: number): number => {
    const rate = CURRENCIES[currency]?.rate || 1;
    return Math.round(usdAmount * rate * 100) / 100;
  };

  const formatPrice = (usdAmount: number): string => {
    const config = CURRENCIES[currency] || CURRENCIES.USD;
    const converted = convertPrice(usdAmount);
    return `${config.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Cart Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (cartSubtotal < appliedCoupon.minSubtotal) return 0;
    return (cartSubtotal * appliedCoupon.discountPercent) / 100;
  }, [cartSubtotal, appliedCoupon]);

  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const freeShippingThreshold = 100; // in USD
  const freeShippingGap = Math.max(0, freeShippingThreshold - cartSubtotal);

  // Cart Methods
  const addToCart = (product: Product, quantity = 1, color?: string, size?: string) => {
    const resolvedColor = color || (product.colors && product.colors[0]?.name) || '';
    const resolvedSize = size || (product.sizes && product.sizes[0]) || '';
    const cartItemId = `${product.id}-${resolvedColor}-${resolvedSize}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQty } : item
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          product,
          quantity: Math.min(product.stock, quantity),
          selectedColor: resolvedColor,
          selectedSize: resolvedSize,
        },
      ];
    });

    showNotification(`Added "${product.title}" to cart!`);
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const clamped = Math.min(item.product.stock, quantity);
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showNotification('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Wishlist Methods
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showNotification('Removed from wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showNotification('Saved to wishlist!', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Coupon Methods
  const applyCoupon = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    const found = AVAILABLE_COUPONS.find((c) => c.code === trimmed);
    if (!found) {
      return { success: false, message: 'Invalid coupon code. Try ELEVATE20 or WELCOME10' };
    }
    if (cartSubtotal < found.minSubtotal) {
      return {
        success: false,
        message: `Order must be at least $${found.minSubtotal} to use ${found.code}`,
      };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Coupon ${found.code} applied (-${found.discountPercent}%)!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showNotification('Coupon removed', 'info');
  };

  // Orders
  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'trackingNumber'>): Order => {
    const orderNumber = `ELV-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingNumber = `TRK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      trackingNumber,
    };

    // Deduct stock from products
    setProducts((prev) =>
      prev.map((prod) => {
        const purchasedItem = orderData.items.find((item) => item.product.id === prod.id);
        if (purchasedItem) {
          const newStock = Math.max(0, prod.stock - purchasedItem.quantity);
          return { ...prod, stock: newStock };
        }
        return prod;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  // Reviews
  const addReview = (productId: string, userName: string, rating: number, comment: string) => {
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId,
      userName: userName.trim() || 'Anonymous Shopper',
      rating,
      date: new Date().toISOString().split('T')[0],
      comment: comment.trim(),
      verifiedPurchase: true,
    };

    setReviews((prev) => ({
      ...prev,
      [productId]: [newReview, ...(prev[productId] || [])],
    }));

    // Recalculate product rating & count
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id === productId) {
          const currentReviews = reviews[productId] || [];
          const allRatings = [rating, ...currentReviews.map((r) => r.rating)];
          const avgRating = Math.round((allRatings.reduce((a, b) => a + b, 0) / allRatings.length) * 10) / 10;
          return {
            ...prod,
            rating: avgRating,
            reviewsCount: prod.reviewsCount + 1,
          };
        }
        return prod;
      })
    );

    showNotification('Your review was posted successfully!', 'success');
  };

  // Admin Product Operations
  const addProduct = (newProdData: Omit<Product, 'id' | 'rating' | 'reviewsCount'>) => {
    const product: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviewsCount: 0,
    };
    setProducts((prev) => [product, ...prev]);
    showNotification(`Product "${product.title}" created!`, 'success');
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showNotification(`Product "${updated.title}" updated!`, 'success');
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showNotification('Product deleted from store', 'info');
  };

  const resetToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setReviews(INITIAL_REVIEWS);
    setCart([]);
    setWishlist([]);
    setOrders([]);
    setAppliedCoupon(null);
    showNotification('Store catalog reset to default demo data', 'info');
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        cart,
        wishlist,
        orders,
        reviews,
        currency,
        setCurrency,
        formatPrice,
        convertPrice,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        cartSubtotal,
        cartDiscount,
        cartCount,
        freeShippingThreshold,
        freeShippingGap,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        createOrder,
        addReview,
        addProduct,
        updateProduct,
        deleteProduct,
        resetToDefaults,
        selectedProduct,
        setSelectedProduct,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        activeTab,
        setActiveTab,
        filters,
        setFilters,
        resetFilters,
        isDarkMode,
        toggleDarkMode,
        notification,
        showNotification,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = (): ShopContextType => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
