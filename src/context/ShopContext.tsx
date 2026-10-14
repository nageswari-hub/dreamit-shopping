import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Product,
  CartItem,
  Order,
  OrderStatus,
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
  sendOtp: (identifier: string) => { success: boolean; otp?: string; message: string; email?: string; phone?: string };
  resetPasswordWithOtp: (identifier: string, otp: string, expectedOtp: string, newPassword: string) => { success: boolean; message: string };
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
  smsApiKey: string;
  setSmsApiKey: (key: string) => void;

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
  userOrders: Order[];
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

const loadInitialUsers = (): User[] => {
  const dreamit = getStorageItem<User[]>('dreamit_users', []);
  const elevate = getStorageItem<User[]>('elevate_users', []);

  const map = new Map<string, User>();
  DEMO_USERS.forEach((u) => map.set(u.id, u));
  if (Array.isArray(elevate)) {
    elevate.forEach((u) => {
      if (u && (u.id || u.phone || u.email)) {
        map.set(u.id || u.email || u.phone, u);
      }
    });
  }
  if (Array.isArray(dreamit)) {
    dreamit.forEach((u) => {
      if (u && (u.id || u.phone || u.email)) {
        map.set(u.id || u.email || u.phone, u);
      }
    });
  }
  return normalizeStoredUsers(Array.from(map.values()));
};

const loadInitialProducts = (): Product[] => {
  const dreamit = getStorageItem<Product[]>('dreamit_products', null as any);
  if (Array.isArray(dreamit) && dreamit.length > 0) {
    return dreamit;
  }
  const elevate = getStorageItem<Product[]>('elevate_products', null as any);
  if (Array.isArray(elevate) && elevate.length > 0) {
    return elevate;
  }
  return INITIAL_PRODUCTS;
};

const isLegacyDummyOrder = (o: any) => {
  if (!o) return true;
  if (o.customer?.email === 'jane.doe@example.com') return true;
  if (o.customer?.fullName === 'Jane Doe') return true;
  if (o.id === 'ord-1791869776872' || o.id === 'ord-1791876784423') return true;
  return false;
};

const loadInitialOrders = (): Order[] => {
  const dreamit = getStorageItem<Order[]>('dreamit_orders', []);
  const elevate = getStorageItem<Order[]>('elevate_orders', []);
  const oMap = new Map<string, Order>();
  if (Array.isArray(elevate)) {
    elevate.forEach((o) => {
      if (o && o.id && !isLegacyDummyOrder(o)) oMap.set(o.id, o);
    });
  }
  if (Array.isArray(dreamit)) {
    dreamit.forEach((o) => {
      if (o && o.id && !isLegacyDummyOrder(o)) oMap.set(o.id, o);
    });
  }
  return Array.from(oMap.values());
};

const loadInitialCurrentUser = (): User | null => {
  const dreamitUser = getStorageItem<User | null>('dreamit_user', null);
  const elevateUser = getStorageItem<User | null>('elevate_user', null);
  const rawUser = dreamitUser || elevateUser || null;
  if (!rawUser) return null;
  if (
    rawUser.id === 'usr-admin' ||
    rawUser.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase() ||
    rawUser.email?.toLowerCase() === 'admin@dreamit.com'
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
      rawUser.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()
        ? ('admin' as UserRole)
        : ('customer' as UserRole),
  };
};

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Authentication
  const [users, setUsers] = useState<User[]>(() => loadInitialUsers());
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadInitialCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>('customer');
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [activeOtps, setActiveOtps] = useState<Record<string, { otp: string; expiresAt: number }>>({});
  const [razorpayKeyId, setRazorpayKeyId] = useState<string>(() =>
    getStorageItem('dreamit_razorpay_key', 'rzp_test_51MockDreamIT')
  );
  const [smsApiKey, setSmsApiKey] = useState<string>(() =>
    getStorageItem('dreamit_sms_api_key', '')
  );

  // Products
  const [products, setProducts] = useState<Product[]>(() => loadInitialProducts());

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() =>
    getStorageItem('dreamit_cart', getStorageItem('elevate_cart', []))
  );

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() =>
    getStorageItem('dreamit_wishlist', getStorageItem('elevate_wishlist', []))
  );

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => loadInitialOrders());

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

  // Disk-Backed Persistence Integration (/api/store)
  const [isStoreLoadedFromDisk, setIsStoreLoadedFromDisk] = useState(false);

  // 1. Initial Load from backend disk store (/api/store)
  useEffect(() => {
    fetch('/api/store')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && typeof data === 'object') {
          // Products loaded from disk store (authoritative)
          if (Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
            setStorageItem('dreamit_products', data.products);
          }

          // Merge users
          if (Array.isArray(data.users) && data.users.length > 0) {
            setUsers((prev) => {
              const uMap = new Map<string, User>();
              data.users.forEach((u: User) => {
                if (u && (u.id || u.phone || u.email)) {
                  uMap.set(u.id || u.email || u.phone, u);
                }
              });
              prev.forEach((u) => {
                const key = u.id || u.email || u.phone;
                if (key && !uMap.has(key)) {
                  uMap.set(key, u);
                }
              });
              const merged = normalizeStoredUsers(Array.from(uMap.values()));
              setStorageItem('dreamit_users', merged);
              return merged;
            });
          }

          // Merge orders
          if (Array.isArray(data.orders)) {
            setOrders((prev) => {
              const oMap = new Map<string, Order>();
              data.orders.forEach((o: Order) => {
                if (o && o.id && !isLegacyDummyOrder(o)) oMap.set(o.id, o);
              });
              prev.forEach((o) => {
                if (o && o.id && !isLegacyDummyOrder(o) && !oMap.has(o.id)) {
                  oMap.set(o.id, o);
                }
              });
              const merged = Array.from(oMap.values());
              setStorageItem('dreamit_orders', merged);
              return merged;
            });
          }
        }
        setIsStoreLoadedFromDisk(true);
      })
      .catch((err) => {
        console.warn('Backend store fetch notice:', err);
        setIsStoreLoadedFromDisk(true);
      });
  }, []);

  // 2. Debounced auto-save to disk store (/api/store)
  useEffect(() => {
    if (!isStoreLoadedFromDisk) return;
    const timer = setTimeout(() => {
      try {
        fetch('/api/store', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            products,
            users,
            orders,
            lastSavedAt: new Date().toISOString(),
          }),
        }).catch((err) => {
          console.warn('Failed to save store to disk:', err);
        });
      } catch (e) {
        console.warn('Disk save error:', e);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [products, users, orders, isStoreLoadedFromDisk]);

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
    const key = currentUser ? `dreamit_cart_${currentUser.id}` : 'dreamit_cart_guest';
    setStorageItem(key, cart);
  }, [cart, currentUser]);

  useEffect(() => {
    const key = currentUser ? `dreamit_wishlist_${currentUser.id}` : 'dreamit_wishlist_guest';
    setStorageItem(key, wishlist);
  }, [wishlist, currentUser]);

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

  useEffect(() => {
    setStorageItem('dreamit_sms_api_key', smsApiKey);
  }, [smsApiKey]);

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

  const sendOtp = (
    identifier: string
  ): { success: boolean; otp?: string; message: string; email?: string; phone?: string } => {
    const raw = identifier.trim();
    if (!raw) {
      return { success: false, message: 'Please enter your registered mobile number or Gmail address.' };
    }

    const isEmail = raw.includes('@');
    const cleanPhone = raw.replace(/[\s\-\(\)\+]/g, '');
    const last10 = cleanPhone.slice(-10);

    // Find user by either email, phone, or name
    const user = users.find((u) => {
      if (isEmail) {
        return u.email.toLowerCase() === raw.toLowerCase();
      }
      const uPhone = (u.phone || '').replace(/[\s\-\(\)\+]/g, '');
      if (cleanPhone.length >= 7 && (uPhone === cleanPhone || (uPhone.length >= 10 && uPhone.endsWith(last10)))) {
        return true;
      }
      return u.name.toLowerCase() === raw.toLowerCase();
    });

    if (!user) {
      return {
        success: false,
        message: isEmail
          ? `No registered account found with email "${raw}". Please check your email or Sign Up.`
          : `No registered account found with identifier "${raw}". Please check your mobile number or username, or Sign Up first.`,
      };
    }

    const userPhoneClean = (user.phone || '').replace(/[\s\-\(\)\+]/g, '').slice(-10);
    const userEmail = user.email;

    // Generate 6-digit OTP code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    // Store active OTP under both keys so it can be verified via phone or email
    setActiveOtps((prev) => ({
      ...prev,
      [userPhoneClean]: { otp: generatedOtp, expiresAt },
      [userEmail.toLowerCase()]: { otp: generatedOtp, expiresAt },
    }));

    // 1. Dispatch real email notification via FormSubmit AJAX service
    if (userEmail && userEmail.includes('@')) {
      try {
        fetch(`https://formsubmit.co/ajax/${encodeURIComponent(userEmail)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            _subject: 'DreamIT Mall: Your Password Reset Verification Passcode',
            to_email: userEmail,
            registered_mobile: `+91 ${userPhoneClean}`,
            otp_passcode: generatedOtp,
            instructions: `Your DreamIT Mall verification OTP is ${generatedOtp}. This passcode is valid for 10 minutes. Enter this code on the verification screen to reset your password. Never share this code.`,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log('[FormSubmit Live Email Delivery]:', data);
          })
          .catch((err) => {
            console.warn('[FormSubmit Email Dispatch Error]:', err);
          });
      } catch (err) {
        console.warn('Email dispatch failed:', err);
      }
    }

    // 2. If real Fast2SMS Gateway API Key is configured and we have a valid 10-digit phone, dispatch live cellular SMS
    if (smsApiKey && smsApiKey.trim().length > 0 && userPhoneClean.length === 10) {
      try {
        fetch(
          `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(
            smsApiKey.trim()
          )}&variables_values=${generatedOtp}&route=otp&numbers=${userPhoneClean}`
        )
          .then((res) => res.json())
          .then((data) => {
            console.log('Fast2SMS Live Gateway Delivery Result:', data);
          })
          .catch((err) => {
            console.warn('Fast2SMS API dispatch error:', err);
          });
      } catch (err) {
        console.warn('SMS dispatch failed:', err);
      }
      showNotification(`📲 Real SMS dispatched to +91 ${userPhoneClean} & verification email sent to ${userEmail}.`, 'success');
    } else {
      console.log(`[DreamIT Security Debug - Dev Only] Password reset OTP for ${userEmail} (+91 ${userPhoneClean}) is: ${generatedOtp}`);
      showNotification(`📧 Verification code sent to registered Gmail (${userEmail}) & mobile (+91 ${userPhoneClean}).`, 'success');
    }

    return {
      success: true,
      otp: generatedOtp,
      email: userEmail,
      phone: userPhoneClean,
      message: `OTP sent to registered Gmail (${userEmail}) and mobile (+91 ${userPhoneClean}).`,
    };
  };

  const resetPasswordWithOtp = (
    identifier: string,
    otp: string,
    expectedOtp: string,
    newPassword: string
  ): { success: boolean; message: string } => {
    const raw = identifier.trim();
    const isEmail = raw.includes('@');
    const cleanPhone = raw.replace(/[\s\-\(\)\+]/g, '');
    const last10 = cleanPhone.slice(-10);

    if (!otp.trim()) {
      return { success: false, message: 'Please enter the 6-digit verification code.' };
    }

    const storedPhone = activeOtps[last10];
    const storedEmail = activeOtps[raw.toLowerCase()];
    const stored = storedEmail || storedPhone;

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
      if (isEmail && u.email.toLowerCase() === raw.toLowerCase()) {
        userFound = true;
        return { ...u, password: newPassword.trim() };
      }
      const uPhone = (u.phone || '').replace(/[\s\-\(\)\+]/g, '');
      if (uPhone === cleanPhone || (uPhone.length >= 10 && uPhone.endsWith(last10))) {
        userFound = true;
        return { ...u, password: newPassword.trim() };
      }
      return u;
    });

    if (!userFound) {
      return { success: false, message: 'User record not found.' };
    }

    setUsers(updatedUsers);

    // Clear used OTP
    setActiveOtps((prev) => {
      const next = { ...prev };
      delete next[last10];
      delete next[raw.toLowerCase()];
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
      return { success: false, message: 'Please enter your registered mobile number, email, or username.' };
    }

    const digitsOnly = cleanInput.replace(/[\s\-\(\)\+]/g, '');
    const last10 = digitsOnly.slice(-10);

    // Find user by phone number, email, or name/username
    let user = users.find((u) => {
      const uPhone = (u.phone || '').replace(/[\s\-\(\)\+]/g, '');
      if (digitsOnly.length >= 7 && (uPhone === digitsOnly || (uPhone.length >= 10 && uPhone.endsWith(last10)))) {
        return true;
      }
      if (u.email.toLowerCase() === cleanInput.toLowerCase()) {
        return true;
      }
      if (u.name.toLowerCase() === cleanInput.toLowerCase()) {
        return true;
      }
      return false;
    });

    if (!user) {
      return {
        success: false,
        message: 'No account registered with this mobile number, email, or username. Please check your credentials or Sign Up first!',
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
    // Load this user's specific cart & wishlist
    const userCart = getStorageItem<CartItem[]>(`dreamit_cart_${user.id}`, []);
    setCart(userCart);
    const userWishlist = getStorageItem<string[]>(`dreamit_wishlist_${user.id}`, []);
    setWishlist(userWishlist);

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
    setCart([]);
    setWishlist([]);
    localStorage.removeItem('dreamit_user');
    localStorage.removeItem('elevate_user');
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
      userId: currentUser?.id,
      userName: currentUser?.name,
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

  // Filtered orders belonging specifically to the logged in user
  const userOrders = useMemo(() => {
    if (!currentUser) return [];
    const cleanUserPhone = (currentUser.phone || '').replace(/[\s\-\(\)\+]/g, '');
    const userEmailLower = (currentUser.email || '').toLowerCase().trim();
    const userNameLower = (currentUser.name || '').toLowerCase().trim();

    return orders.filter((o) => {
      // 1. Direct userId match
      if (o.userId && o.userId === currentUser.id) return true;
      // 2. Direct email match
      if (userEmailLower && o.customer?.email?.toLowerCase().trim() === userEmailLower) return true;
      // 3. Direct phone match (last 10 digits)
      const oPhoneClean = (o.customer?.phone || '').replace(/[\s\-\(\)\+]/g, '');
      if (
        cleanUserPhone.length >= 7 &&
        (oPhoneClean === cleanUserPhone || (cleanUserPhone.length >= 10 && oPhoneClean.endsWith(cleanUserPhone.slice(-10))))
      ) {
        return true;
      }
      // 4. Exact user name match
      if (userNameLower && o.customer?.fullName?.toLowerCase().trim() === userNameLower) return true;

      return false;
    });
  }, [orders, currentUser]);

  const cancelOrder = (
    orderId: string,
    reason = 'Cancelled by Customer'
  ) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found.' };

    if (order.status !== 'Confirmed' && order.status !== 'Processing') {
      return {
        success: false,
        message: `Order cannot be cancelled because it is already ${order.status.toLowerCase()}.`,
      };
    }

    const now = new Date().toISOString();

    // Restock the product items to inventory immediately
    setProducts((prev) =>
      prev.map((prod) => {
        const item = order.items.find((it) => it.product.id === prod.id);
        if (item) {
          return { ...prod, stock: prod.stock + item.quantity };
        }
        return prod;
      })
    );

    // Update order status directly to 'Cancelled'
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'Cancelled' as OrderStatus,
              cancellationReason: reason,
              cancelledAt: now,
              refundDetails: undefined,
            }
          : o
      )
    );

    showNotification(`Order ${order.orderNumber} has been cancelled successfully.`, 'info');
    return {
      success: true,
      message: `Order ${order.orderNumber} has been cancelled successfully.`,
    };
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

    if (order.status === 'Cancelled' || order.status === 'Returned') {
      return {
        success: false,
        message: `Order cannot be returned because it is already ${order.status.toLowerCase()}.`,
      };
    }

    const refundTxnId = 'RFND-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date().toISOString();

    // Restock items upon return
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
              status: 'Returned' as OrderStatus,
              returnReason: reason,
              returnRequestedAt: now,
              returnApprovedAt: now,
              refundDetails: {
                accountHolderName: o.customer.fullName,
                accountNumber: 'N/A (Cash on Delivery)',
                ifscCode: 'N/A',
                requestedAt: now,
                refundStatus: 'Refund Issued' as const,
                refundIssuedAt: now,
                refundTransactionId: refundTxnId,
              },
            }
          : o
      )
    );

    showNotification(
      'Refunds for COD orders are issued in cash at the time of return pickup.',
      'info'
    );
    return {
      success: true,
      message: 'Refunds for COD orders are issued in cash at the time of return pickup.',
    };
  };

  const approveReturn = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const refundTxnId = 'RFND-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date().toISOString();

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
              status: 'Returned' as OrderStatus,
              returnApprovedAt: now,
              refundDetails: {
                accountHolderName: o.customer.fullName,
                accountNumber: 'N/A (Cash on Delivery)',
                ifscCode: 'N/A',
                requestedAt: now,
                refundStatus: 'Refund Issued' as const,
                refundIssuedAt: now,
                refundTransactionId: refundTxnId,
              },
            }
          : o
      )
    );

    showNotification(
      'Refunds for COD orders are issued in cash at the time of return pickup.',
      'info'
    );
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
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== productId);
      setStorageItem('dreamit_products', next);
      try {
        fetch('/api/store', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            products: next,
            users,
            orders,
            lastSavedAt: new Date().toISOString(),
          }),
        }).catch((err) => console.warn('Sync delete to disk error:', err));
      } catch (e) {
        console.warn('Sync delete error:', e);
      }
      return next;
    });
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
        smsApiKey,
        setSmsApiKey,
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
        userOrders,
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
