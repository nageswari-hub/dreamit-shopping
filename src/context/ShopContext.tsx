import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Product,
  CartItem,
  Order,
  OrderStatus,
  RefundStatus,
  RefundAccountDetails,
  Review,
  Coupon,
  CurrencyCode,
  FilterState,
  User,
  UserRole,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  CURRENCIES,
  AVAILABLE_COUPONS,
  DEMO_USERS,
  AUTHORIZED_ADMIN_EMAIL,
} from '../data/mockProducts';
import { getStorageItem, setStorageItem } from '../utils/storage';

interface ShopContextType {
  // Auth
  currentUser: User | null;
  users: User[];
  login: (identifier: string, password?: string, role?: UserRole) => { success: boolean; message: string };
  register: (name: string, email: string, phone: string, password: string, role: UserRole) => { success: boolean; message: string };
  logout: () => void;
  sendOtp: (phone: string) => { success: boolean; otp?: string; message: string };
  resetPasswordWithOtp: (phone: string, otp: string, expectedOtp: string, newPassword: string) => { success: boolean; message: string };
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalRole: UserRole;
  setAuthModalRole: (role: UserRole) => void;
  authModalMode: 'login' | 'register' | 'forgot';
  setAuthModalMode: (mode: 'login' | 'register' | 'forgot') => void;
  openAuthModal: (role?: UserRole, mode?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
  razorpayKeyId: string;
  setRazorpayKeyId: (key: string) => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviewsCount'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  resetToDefaults: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartDiscount: number;
  cartCount: number;
  freeShippingThreshold: number;
  freeShippingGap: number;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Coupons
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Orders & Lifecycle
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'trackingNumber'>) => Order;
  cancelOrder: (
    orderId: string,
    reason?: string,
    bankDetails?: {
      accountHolderName?: string;
      accountNumber?: string;
      ifscCode?: string;
      bankName?: string;
      upiId?: string;
    }
  ) => { success: boolean; message: string };
  approveRefund: (orderId: string) => { success: boolean; message: string };
  confirmParcelReturnedAndRefund: (orderId: string) => { success: boolean; message: string };
  requestReturn: (orderId: string, reason?: string) => { success: boolean; message: string };
  approveReturn: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // Reviews
  reviews: Record<string, Review[]>;
  addReview: (productId: string, userName: string, rating: number, comment: string) => void;

  // Currency
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatPrice: (amountInUSD: number) => string;
  convertPrice: (amountInUSD: number) => number;

  // UI Modals & Navigation
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

const normalizeStoredUsers = (saved: any): User[] => {
  if (!Array.isArray(saved) || saved.length === 0) return DEMO_USERS;
  return saved.map((u) => {
    // Dedicated Administrator: pokurinageswari@gmail.com
    if (
      u.id === 'usr-admin' ||
      u.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase() ||
      u.email.toLowerCase() === 'admin@dreamit.com'
    ) {
      return {
        ...u,
        id: 'usr-admin',
        name: 'Nageswari (Admin)',
        email: AUTHORIZED_ADMIN_EMAIL,
        phone: u.phone === '9876543210' ? '7013304012' : (u.phone || '7013304012'),
        password: u.password || 'admin123',
        role: 'admin' as UserRole,
      };
    }
    if (u.id === 'usr-customer' || u.email === 'user@dreamit.com') {
      return {
        ...u,
        phone: u.phone || '9123456789',
        password: u.password || 'user123',
        role: 'customer' as UserRole,
      };
    }
    // STRICT SECURITY: Any other user MUST NOT have admin role!
    const role: UserRole =
      u.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()
        ? 'admin'
        : 'customer';
    return {
      ...u,
      role,
      phone: u.phone || '9999999999',
      password: u.password || 'password123',
    };
  });
};

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Authentication
  const [users, setUsers] = useState<User[]>(() => {
    const raw = getStorageItem('dreamit_users', DEMO_USERS);
    return normalizeStoredUsers(raw);
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const rawUser = getStorageItem('dreamit_user', DEMO_USERS[1]);
    if (!rawUser) return null;
    if (
      rawUser.id === 'usr-admin' ||
      rawUser.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase() ||
      rawUser.email.toLowerCase() === 'admin@dreamit.com'
    ) {
      return {
        ...rawUser,
        id: 'usr-admin',
        name: 'Nageswari (Admin)',
        email: AUTHORIZED_ADMIN_EMAIL,
        phone: rawUser.phone === '9876543210' ? '7013304012' : (rawUser.phone || '7013304012'),
        password: rawUser.password || 'admin123',
        role: 'admin' as UserRole,
      };
    }
    return {
      ...rawUser,
      role:
        rawUser.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()
          ? ('admin' as UserRole)
          : ('customer' as UserRole),
    };
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>('customer');
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [activeOtps, setActiveOtps] = useState<Record<string, { otp: string; expiresAt: number }>>({});
  const [razorpayKeyId, setRazorpayKeyId] = useState<string>(() =>
    getStorageItem('dreamit_razorpay_key', 'rzp_test_51MockDreamIT')
  );

  // Products
  const [products, setProducts] = useState<Product[]>(() =>
    getStorageItem('dreamit_products', getStorageItem('elevate_products', INITIAL_PRODUCTS))
  );

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() =>
    getStorageItem('dreamit_cart', getStorageItem('elevate_cart', []))
  );

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() =>
    getStorageItem('dreamit_wishlist', getStorageItem('elevate_wishlist', []))
  );

  // Orders
  const [orders, setOrders] = useState<Order[]>(() =>
    getStorageItem('dreamit_orders', getStorageItem('elevate_orders', []))
  );

  // Reviews
  const [reviews, setReviews] = useState<Record<string, Review[]>>(() =>
    getStorageItem('dreamit_reviews', getStorageItem('elevate_reviews', INITIAL_REVIEWS))
  );

  // Currency
  const [currency, setCurrency] = useState<CurrencyCode>(() =>
    getStorageItem('dreamit_currency', 'USD')
  );

  // Coupon
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() =>
    getStorageItem('dreamit_coupon', null)
  );

  // Theme
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('dreamit_theme') || localStorage.getItem('elevate_theme');
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

  // Persistence Syncs
  useEffect(() => {
    setStorageItem('dreamit_users', users);
  }, [users]);

  useEffect(() => {
    setStorageItem('dreamit_user', currentUser);
  }, [currentUser]);

  useEffect(() => {
    setStorageItem('dreamit_products', products);
  }, [products]);

  useEffect(() => {
    setStorageItem('dreamit_cart', cart);
  }, [cart]);

  useEffect(() => {
    setStorageItem('dreamit_wishlist', wishlist);
  }, [wishlist]);

  useEffect(() => {
    setStorageItem('dreamit_orders', orders);
  }, [orders]);

  useEffect(() => {
    setStorageItem('dreamit_reviews', reviews);
  }, [reviews]);

  useEffect(() => {
    setStorageItem('dreamit_currency', currency);
  }, [currency]);

  useEffect(() => {
    setStorageItem('dreamit_coupon', appliedCoupon);
  }, [appliedCoupon]);

  useEffect(() => {
    localStorage.setItem('dreamit_theme', isDarkMode ? 'dark' : 'light');
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
    }, 3500);
  };

  useEffect(() => {
    setStorageItem('dreamit_razorpay_key', razorpayKeyId);
  }, [razorpayKeyId]);

  // Auth Operations
  const openAuthModal = (
    role: UserRole = 'customer',
    mode: 'login' | 'register' | 'forgot' = 'login'
  ) => {
    setAuthModalRole(role);
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const sendOtp = (phone: string): { success: boolean; otp?: string; message: string } => {
    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
    }

    const last10 = cleanPhone.slice(-10);
    // Find user with matching phone
    const user = users.find((u) => {
      const uPhone = (u.phone || '').replace(/[\s\-\(\)\+]/g, '');
      return uPhone === cleanPhone || (uPhone.length >= 10 && uPhone.endsWith(last10));
    });

    if (!user) {
      return {
        success: false,
        message: `Mobile number ${last10} is not registered. Please create an account via Sign Up first.`,
      };
    }

    // Generate 6-digit OTP code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    setActiveOtps((prev) => ({
      ...prev,
      [last10]: { otp: generatedOtp, expiresAt },
    }));

    showNotification(`📲 DreamIT SMS: Verification OTP for ${last10} is ${generatedOtp}`, 'info');

    return {
      success: true,
      otp: generatedOtp,
      message: `OTP sent to mobile number ending in ...${last10.slice(-4)}.`,
    };
  };

  const resetPasswordWithOtp = (
    phone: string,
    otp: string,
    expectedOtp: string,
    newPassword: string
  ): { success: boolean; message: string } => {
    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    const last10 = cleanPhone.slice(-10);

    if (!otp.trim()) {
      return { success: false, message: 'Please enter the 6-digit SMS OTP.' };
    }

    const stored = activeOtps[last10];
    const isOtpValid =
      (stored && stored.otp === otp.trim() && stored.expiresAt > Date.now()) ||
      (expectedOtp && expectedOtp.trim() === otp.trim());

    if (!isOtpValid) {
      return { success: false, message: 'Invalid or expired OTP. Please check the code or request a new one.' };
    }

    if (!newPassword || newPassword.trim().length < 4) {
      return { success: false, message: 'New password must be at least 4 characters long.' };
    }

    let userFound = false;
    const updatedUsers = users.map((u) => {
      const uPhone = (u.phone || '').replace(/[\s\-\(\)\+]/g, '');
      if (uPhone === cleanPhone || (uPhone.length >= 10 && uPhone.endsWith(last10))) {
        userFound = true;
        return { ...u, password: newPassword.trim() };
      }
      return u;
    });

    if (!userFound) {
      return { success: false, message: 'User record not found for this mobile number.' };
    }

    setUsers(updatedUsers);

    // Clear used OTP
    setActiveOtps((prev) => {
      const next = { ...prev };
      delete next[last10];
      return next;
    });

    showNotification('Password updated successfully! Please sign in with your new password.', 'success');
    return { success: true, message: 'Password reset successfully!' };
  };

  const login = (
    identifier: string,
    password?: string,
    role?: UserRole
  ): { success: boolean; message: string } => {
    const cleanInput = identifier.trim();
    if (!cleanInput) {
      return { success: false, message: 'Please enter your registered mobile number.' };
    }

    const digitsOnly = cleanInput.replace(/[\s\-\(\)\+]/g, '');
    const last10 = digitsOnly.slice(-10);

    // Find user by phone number or by email
    let user = users.find((u) => {
      const uPhone = (u.phone || '').replace(/[\s\-\(\)\+]/g, '');
      if (digitsOnly.length >= 7 && (uPhone === digitsOnly || (uPhone.length >= 10 && uPhone.endsWith(last10)))) {
        return true;
      }
      return u.email.toLowerCase() === cleanInput.toLowerCase();
    });

    if (!user) {
      return {
        success: false,
        message: 'No account registered with this mobile number. Please check the number or Sign Up first!',
      };
    }

    // STRICT PASSWORD VALIDATION
    if (password !== undefined) {
      const trimmedPass = password.trim();
      if (!trimmedPass) {
        return { success: false, message: 'Please enter your account password.' };
      }
      if (user.password && user.password !== trimmedPass) {
        return {
          success: false,
          message: 'Incorrect password! Please enter the correct password or click "Forgot Password" to reset it via SMS OTP.',
        };
      }
    }

    // Strict admin role authorization: ONLY pokurinageswari@gmail.com can be an administrator!
    const isAuthorizedAdmin = user.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
    const effectiveRole: UserRole = isAuthorizedAdmin ? (role === 'admin' ? 'admin' : user.role) : 'customer';

    if (user.role !== effectiveRole) {
      user = { ...user, role: effectiveRole };
      setUsers((prev) => prev.map((u) => (u.id === user!.id ? user! : u)));
    }

    setCurrentUser(user);
    closeAuthModal();
    showNotification(`Welcome back, ${user.name}! (${user.role.toUpperCase()})`);
    return { success: true, message: 'Logged in successfully!' };
  };

  const register = (
    name: string,
    email: string,
    phone: string,
    password: string,
    role: UserRole
  ): { success: boolean; message: string } => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    const cleanPass = password.trim();

    if (!cleanName) {
      return { success: false, message: 'Please enter your full name.' };
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    if (!cleanPass || cleanPass.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    const last10 = cleanPhone.slice(-10);
    const phoneExists = users.some((u) => {
      const uPhone = (u.phone || '').replace(/[\s\-\(\)\+]/g, '');
      return uPhone === cleanPhone || (uPhone.length >= 10 && uPhone.endsWith(last10));
    });

    if (phoneExists) {
      return {
        success: false,
        message: 'This mobile number is already registered. Please sign in or reset your password.',
      };
    }

    const emailExists = users.some((u) => u.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      return {
        success: false,
        message: 'An account with this email address already exists. Please sign in.',
      };
    }

    // Strict admin role check: ONLY pokurinageswari@gmail.com can be an administrator!
    let assignedRole: UserRole = 'customer';
    if (role === 'admin') {
      if (cleanEmail === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        assignedRole = 'admin';
      } else {
        return {
          success: false,
          message: `Administrator access is strictly restricted to ${AUTHORIZED_ADMIN_EMAIL}. Other accounts can only register as Customers.`,
        };
      }
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      phone: last10,
      password: cleanPass,
      role: assignedRole,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [...prev, newUser]);

    // STRICTLY DO NOT AUTO LOGIN
    // User must sign in after sign up
    showNotification('Account registered successfully! Please sign in with your mobile number.', 'success');
    return {
      success: true,
      message: 'Account registered successfully! Please sign in with your mobile number and password.',
    };
  };

  const logout = () => {
    setCurrentUser(null);
    if (activeTab === 'admin') {
      setActiveTab('shop');
    }
    showNotification('You have logged out.', 'info');
  };

  // Currency
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

    showNotification(`Added "${product.title}" to bag!`);
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
    showNotification('Item removed from bag', 'info');
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
      return { success: false, message: 'Invalid coupon. Try ELEVATE20 or WELCOME10' };
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

  // Orders & Lifecycle (Cancel & Return)
  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'trackingNumber'>): Order => {
    const orderNumber = `DMT-${Math.floor(100000 + Math.random() * 900000)}`;
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

  const cancelOrder = (
    orderId: string,
    reason = 'Customer requested cancellation',
    bankDetails?: {
      accountHolderName?: string;
      accountNumber?: string;
      ifscCode?: string;
      bankName?: string;
      upiId?: string;
    }
  ) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found.' };

    if (order.status !== 'Confirmed' && order.status !== 'Processing') {
      return {
        success: false,
        message: `Order cannot be cancelled because it is already ${order.status.toLowerCase()}.`,
      };
    }

    const isCod = order.paymentMethod === 'cod';

    // Status differentiation:
    // Online Payment -> 'Cancellation Requested' with 'Pending Admin Approval'
    // Cash on Delivery -> 'Cancelled' with 'Awaiting Parcel Return'
    const updatedStatus: OrderStatus = isCod ? 'Cancelled' : 'Cancellation Requested';
    const refundStatus: RefundStatus = isCod ? 'Awaiting Parcel Return' : 'Pending Admin Approval';

    const refundDetails: RefundAccountDetails = {
      accountHolderName: bankDetails?.accountHolderName?.trim() || order.customer.fullName,
      accountNumber: bankDetails?.accountNumber?.trim() || 'N/A',
      ifscCode: bankDetails?.ifscCode?.trim() || 'N/A',
      bankName: bankDetails?.bankName?.trim() || '',
      upiId: bankDetails?.upiId?.trim() || '',
      requestedAt: new Date().toISOString(),
      refundStatus,
    };

    // Update order status
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: updatedStatus,
              cancellationReason: reason,
              cancelledAt: new Date().toISOString(),
              refundDetails,
            }
          : o
      )
    );

    if (isCod) {
      showNotification(
        `Order ${order.orderNumber} cancelled. For Cash on Delivery, refund will be issued to your bank account only after the parcel is returned to our warehouse.`,
        'info'
      );
      return {
        success: true,
        message: 'Order cancelled. Refund will be issued when the parcel is returned.',
      };
    } else {
      showNotification(
        `Cancellation request for Order ${order.orderNumber} submitted with account details. Administrator will verify and issue your refund.`,
        'success'
      );
      return {
        success: true,
        message: 'Cancellation requested. Awaiting administrator acceptance to issue refund.',
      };
    }
  };

  // Administrator accepts online payment cancellation & issues refund
  const approveRefund = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found.' };

    const refundTxnId = 'RFND-ONL-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date().toISOString();

    // Restock product items!
    setProducts((prev) =>
      prev.map((prod) => {
        const item = order.items.find((it) => it.product.id === prod.id);
        if (item) {
          return { ...prod, stock: prod.stock + item.quantity };
        }
        return prod;
      })
    );

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'Cancelled',
              refundDetails: o.refundDetails
                ? {
                    ...o.refundDetails,
                    refundStatus: 'Refund Issued',
                    refundIssuedAt: now,
                    refundTransactionId: refundTxnId,
                  }
                : {
                    accountHolderName: o.customer.fullName,
                    accountNumber: 'N/A',
                    ifscCode: 'N/A',
                    requestedAt: now,
                    refundStatus: 'Refund Issued',
                    refundIssuedAt: now,
                    refundTransactionId: refundTxnId,
                  },
            }
          : o
      )
    );

    showNotification(
      `Cancellation accepted for Order ${order.orderNumber}! Refund issued (Ref: ${refundTxnId}). Inventory restocked.`,
      'success'
    );
    return { success: true, message: 'Refund successfully issued to customer.' };
  };

  // Administrator confirms COD parcel returned & issues refund
  const confirmParcelReturnedAndRefund = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found.' };

    const refundTxnId = 'COD-RFND-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date().toISOString();

    // Restock items upon physical parcel return!
    setProducts((prev) =>
      prev.map((prod) => {
        const item = order.items.find((it) => it.product.id === prod.id);
        if (item) {
          return { ...prod, stock: prod.stock + item.quantity };
        }
        return prod;
      })
    );

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'Cancelled',
              refundDetails: o.refundDetails
                ? {
                    ...o.refundDetails,
                    parcelReturnedAt: now,
                    refundStatus: 'Refund Issued',
                    refundIssuedAt: now,
                    refundTransactionId: refundTxnId,
                  }
                : {
                    accountHolderName: o.customer.fullName,
                    accountNumber: 'N/A',
                    ifscCode: 'N/A',
                    requestedAt: now,
                    parcelReturnedAt: now,
                    refundStatus: 'Refund Issued',
                    refundIssuedAt: now,
                    refundTransactionId: refundTxnId,
                  },
            }
          : o
      )
    );

    showNotification(
      `Parcel return confirmed for COD Order ${order.orderNumber}! Refund issued (Ref: ${refundTxnId}). Inventory restocked.`,
      'success'
    );
    return { success: true, message: 'Parcel return confirmed and refund issued.' };
  };

  const requestReturn = (orderId: string, reason = 'Dissatisfied with item condition or fit') => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found.' };

    if (order.status !== 'Delivered') {
      return {
        success: false,
        message: 'Returns can only be requested for Delivered orders.',
      };
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'Return Requested',
              returnReason: reason,
              returnRequestedAt: new Date().toISOString(),
            }
          : o
      )
    );

    showNotification(`Return request for Order ${order.orderNumber} submitted to DreamIT Support!`, 'success');
    return { success: true, message: 'Return request submitted.' };
  };

  const approveReturn = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // Restock items upon return approval
    setProducts((prev) =>
      prev.map((prod) => {
        const item = order.items.find((it) => it.product.id === prod.id);
        if (item) {
          return { ...prod, stock: prod.stock + item.quantity };
        }
        return prod;
      })
    );

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'Returned',
              returnApprovedAt: new Date().toISOString(),
            }
          : o
      )
    );

    showNotification(`Return approved for Order ${order.orderNumber}. Inventory restocked.`, 'success');
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    showNotification(`Order status updated to "${status}"`, 'info');
  };

  // Reviews
  const addReview = (productId: string, userName: string, rating: number, comment: string) => {
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId,
      userName: userName.trim() || currentUser?.name || 'DreamIT Shopper',
      rating,
      date: new Date().toISOString().split('T')[0],
      comment: comment.trim(),
      verifiedPurchase: true,
    };

    setReviews((prev) => ({
      ...prev,
      [productId]: [newReview, ...(prev[productId] || [])],
    }));

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

    showNotification('Review posted successfully!', 'success');
  };

  // Admin Catalog Operations
  const addProduct = (newProdData: Omit<Product, 'id' | 'rating' | 'reviewsCount'>) => {
    const product: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviewsCount: 0,
    };
    setProducts((prev) => [product, ...prev]);
    showNotification(`Product "${product.title}" added to DreamIT Mall!`, 'success');
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showNotification(`Product "${updated.title}" updated!`, 'success');
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showNotification('Product removed from catalog', 'info');
  };

  const resetToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setReviews(INITIAL_REVIEWS);
    setCart([]);
    setWishlist([]);
    setOrders([]);
    setAppliedCoupon(null);
    showNotification('Store catalog reset to demo baseline', 'info');
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <ShopContext.Provider
      value={{
        currentUser,
        users,
        login,
        register,
        logout,
        sendOtp,
        resetPasswordWithOtp,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalRole,
        setAuthModalRole,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,
        razorpayKeyId,
        setRazorpayKeyId,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        resetToDefaults,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartDiscount,
        cartCount,
        freeShippingThreshold,
        freeShippingGap,
        wishlist,
        toggleWishlist,
        isInWishlist,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        orders,
        createOrder,
        cancelOrder,
        approveRefund,
        confirmParcelReturnedAndRefund,
        requestReturn,
        approveReturn,
        updateOrderStatus,
        reviews,
        addReview,
        currency,
        setCurrency,
        formatPrice,
        convertPrice,
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
