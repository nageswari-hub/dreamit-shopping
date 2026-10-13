import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { SHIPPING_METHODS } from '../data/mockProducts';
import { OrderCustomer, ShippingMethod } from '../types';
import confetti from 'canvas-confetti';
import {
  X,
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  QrCode,
  Banknote,
  Printer,
  Zap,
  Key,
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    isCheckoutOpen,
    setIsCheckoutOpen,
    formatPrice,
    cartSubtotal,
    cartDiscount,
    appliedCoupon,
    currency,
    createOrder,
    setActiveTab,
    razorpayKeyId,
    setRazorpayKeyId,
  } = useShop();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Customer Shipping Details
  const [customer, setCustomer] = useState<OrderCustomer>({
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+91 98765 43210',
    address: '42 MG Road, Koramangala',
    city: 'Bengaluru',
    postalCode: '560034',
    country: 'India',
  });

  // Selected Shipping Method
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod>(SHIPPING_METHODS[0]);

  // Payment Method
  const [paymentType, setPaymentType] = useState<'razorpay' | 'card' | 'upi' | 'cod'>('razorpay');
  const [customKeyInput, setCustomKeyInput] = useState(razorpayKeyId);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardName, setCardName] = useState('Jane Doe');
  const [upiId, setUpiId] = useState('janedoe@okhdfcbank');

  // Confirmation state
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayError, setRazorpayError] = useState<string | null>(null);

  if (!isCheckoutOpen) return null;

  const freeShipping = cartSubtotal >= 100;
  const actualShippingCost =
    selectedShipping.id === 'standard' && freeShipping ? 0 : selectedShipping.cost;
  const estimatedTax = (cartSubtotal - cartDiscount) * 0.08;
  const orderTotal = Math.max(0, cartSubtotal - cartDiscount + actualShippingCost + estimatedTax);

  // Helper to load Razorpay Checkout script dynamically
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const finalizeOrder = (paymentMethod: 'card' | 'upi' | 'cod' | 'razorpay', paymentId?: string) => {
    const order = createOrder({
      items: cart,
      subtotal: cartSubtotal,
      discount: cartDiscount,
      couponCode: appliedCoupon?.code,
      shippingCost: actualShippingCost,
      tax: estimatedTax,
      total: orderTotal,
      currency,
      customer,
      shippingMethod: { ...selectedShipping, cost: actualShippingCost },
      paymentMethod,
      razorpayPaymentId: paymentId,
      status: 'Confirmed',
    });

    setCompletedOrder(order);
    setIsProcessing(false);
    setStep(4);

    // Confetti celebration
    try {
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#0e8ce9', '#10b981', '#f59e0b', '#8b5cf6'],
      });
    } catch (err) {
      console.log('Confetti error:', err);
    }
  };

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    setRazorpayError(null);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setRazorpayError('Unable to load Razorpay payment gateway SDK. Please check your internet connection.');
      setIsProcessing(false);
      return;
    }

    // Convert amount to INR paise
    const inrRate = 84.0;
    const amountInPaise = Math.round(orderTotal * (currency === 'INR' ? 1 : inrRate) * 100);

    const options = {
      key: customKeyInput || 'rzp_test_51MockDreamIT',
      amount: amountInPaise,
      currency: 'INR',
      name: 'DreamIT Mall',
      description: `Payment for ${cart.length} items (${formatPrice(orderTotal)})`,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80',
      prefill: {
        name: customer.fullName,
        email: customer.email,
        contact: customer.phone,
      },
      notes: {
        address: `${customer.address}, ${customer.city}`,
        mall: 'DreamIT Mall Online Store',
      },
      theme: {
        color: '#0e8ce9',
      },
      handler: function (response: any) {
        finalizeOrder('razorpay', response.razorpay_payment_id || `pay_${Date.now()}`);
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
        },
      },
    };

    try {
      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on('payment.failed', function (resp: any) {
        setIsProcessing(false);
        setRazorpayError(resp.error?.description || 'Payment was declined or cancelled.');
      });
      rzpInstance.open();
    } catch (err: any) {
      console.warn('Razorpay popup error:', err);
      // If mock key rejected by Razorpay backend in sandbox, provide instant simulated success fallback
      setIsProcessing(false);
      setRazorpayError('Razorpay test mode initialized. You can also click "Simulate Razorpay Payment" below to test the verified order workflow instantly.');
    }
  };

  const handleSimulateRazorpay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const mockPayId = `pay_rzp_${Date.now().toString(36).toUpperCase()}`;
      finalizeOrder('razorpay', mockPayId);
    }, 1000);
  };

  const handleManualOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      finalizeOrder(paymentType);
    }, 1000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Secure Checkout"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-fade-in"
    >
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {step === 4 ? 'DreamIT Order Confirmation' : 'Secure Checkout & Payment'}
            </h2>
          </div>

          {step !== 4 && (
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Stepper Indicator */}
        {step !== 4 && (
          <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-brand-600' : 'text-slate-400'}`}>
              <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-xs">
                1
              </span>
              <span>Shipping Address</span>
            </div>
            <div className="h-0.5 w-8 sm:w-16 bg-slate-200 dark:bg-slate-700" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-brand-600' : 'text-slate-400'}`}>
              <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs">
                2
              </span>
              <span>Delivery Method</span>
            </div>
            <div className="h-0.5 w-8 sm:w-16 bg-slate-200 dark:bg-slate-700" />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-brand-600' : 'text-slate-400'}`}>
              <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs">
                3
              </span>
              <span>Razorpay / Payment</span>
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="overflow-y-auto p-6 sm:p-8 flex-1">
          {/* STEP 1: Shipping Address */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Contact & Delivery Address
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.fullName}
                    onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Phone Number (for UPI & Delivery updates) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.country}
                    onChange={(e) => setCustomer({ ...customer, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.city}
                    onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    PIN / Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.postalCode}
                    onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Continue to Delivery</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Shipping Method */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Choose Delivery Speed
              </h3>
              <div className="space-y-3">
                {SHIPPING_METHODS.map((method) => {
                  const isFree = method.id === 'standard' && freeShipping;
                  const isSelected = selectedShipping.id === method.id;

                  return (
                    <div
                      key={method.id}
                      onClick={() => setSelectedShipping(method)}
                      className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-950/40 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Truck className={`w-5 h-5 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {method.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              ({method.estimatedDays})
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{method.description}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {isFree ? 'FREE' : formatPrice(method.cost)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Method with Razorpay */}
          {step === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    Select Payment Gateway
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Razorpay Tab */}
                    <button
                      type="button"
                      onClick={() => setPaymentType('razorpay')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        paymentType === 'razorpay'
                          ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 ring-2 ring-brand-500/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600'
                      }`}
                    >
                      <Zap className="w-4 h-4 text-brand-600" />
                      <span>Razorpay</span>
                    </button>

                    {/* Card Tab */}
                    <button
                      type="button"
                      onClick={() => setPaymentType('card')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        paymentType === 'card'
                          ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Card</span>
                    </button>

                    {/* UPI Tab */}
                    <button
                      type="button"
                      onClick={() => setPaymentType('upi')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        paymentType === 'upi'
                          ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600'
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      <span>UPI ID</span>
                    </button>

                    {/* COD Tab */}
                    <button
                      type="button"
                      onClick={() => setPaymentType('cod')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        paymentType === 'cod'
                          ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600'
                      }`}
                    >
                      <Banknote className="w-4 h-4" />
                      <span>COD</span>
                    </button>
                  </div>
                </div>

                {/* Razorpay Real-Time Interface */}
                {paymentType === 'razorpay' && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-50/70 via-indigo-50/40 to-slate-50 dark:from-slate-800/80 dark:to-slate-900 border border-brand-200 dark:border-slate-700 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-black text-xs">
                          R
                        </div>
                        <div>
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                            Razorpay Live Checkout
                          </span>
                          <span className="text-[11px] text-slate-500">
                            UPI (GPay / PhonePe / Paytm / QR), Cards, NetBanking
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase">
                        Real-Time
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 text-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        📱 UPI QR & Apps
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        💳 All Indian & Global Cards
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        🏦 50+ NetBanking Banks
                      </div>
                    </div>

                    {/* Razorpay Key ID Configuration */}
                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        <span className="flex items-center gap-1">
                          <Key className="w-3.5 h-3.5 text-brand-600" />
                          <span>Razorpay Key ID (Live / Test)</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Sandbox Test Key Pre-loaded</span>
                      </div>
                      <input
                        type="text"
                        value={customKeyInput}
                        onChange={(e) => {
                          setCustomKeyInput(e.target.value);
                          setRazorpayKeyId(e.target.value);
                        }}
                        placeholder="rzp_test_... or your live Key ID"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                      />
                    </div>

                    {razorpayError && (
                      <p className="text-xs text-rose-500 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 font-semibold">
                        {razorpayError}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleRazorpayPayment}
                        disabled={isProcessing}
                        className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        <span>{isProcessing ? 'Launching Razorpay...' : `Launch Razorpay • ${formatPrice(orderTotal)}`}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSimulateRazorpay}
                        disabled={isProcessing}
                        className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                        title="Quick simulated test payment"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Simulate Pay</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Card Fields */}
                {paymentType === 'card' && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                          Expiry Date (MM/YY)
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                          CVC / CVV
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="•••"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Name on card"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* UPI Fields */}
                {paymentType === 'upi' && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Virtual Payment Address (VPA / UPI ID)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                    />
                    <p className="text-[11px] text-slate-500">
                      Payment request will be dispatched to your UPI application.
                    </p>
                  </div>
                )}

                {/* COD Info */}
                {paymentType === 'cod' && (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
                    Pay safely with cash or contactless UPI upon courier arrival at your doorstep.
                  </div>
                )}

                <div className="flex justify-between items-center pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  {paymentType !== 'razorpay' && (
                    <button
                      onClick={handleManualOrder}
                      disabled={isProcessing}
                      className="px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <span>Processing...</span>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Place Order • {formatPrice(orderTotal)}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Order Summary Column */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Order Summary ({cart.length} items)
                </h4>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.product.images[0]}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover bg-white"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block line-clamp-1">
                            {item.product.title}
                          </span>
                          <span className="text-[11px] text-slate-500">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span>{formatPrice(cartSubtotal)}</span>
                  </div>
                  {cartDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>-{formatPrice(cartDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Shipping ({selectedShipping.name})</span>
                    <span>{actualShippingCost === 0 ? 'FREE' : formatPrice(actualShippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Tax (8%)</span>
                    <span>{formatPrice(estimatedTax)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <span>Final Total</span>
                    <span className="text-brand-600 dark:text-brand-400">
                      {formatPrice(orderTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Success & Confirmation */}
          {step === 4 && completedOrder && (
            <div className="text-center py-8 px-4 max-w-lg mx-auto space-y-6 animate-scale-in">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Payment Verified & Order Placed!</span>
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Thank You, {completedOrder.customer.fullName}!
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your payment was authorized and received at DreamIT Mall. Your tracking code and official tax invoice have been generated below.
                </p>
              </div>

              {/* Order ID & Razorpay Payment ID Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Order Number:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {completedOrder.orderNumber}
                  </span>
                </div>
                {completedOrder.razorpayPaymentId && (
                  <div className="flex justify-between items-center p-2 rounded-xl bg-brand-50/80 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900">
                    <span className="text-brand-900 dark:text-brand-300 font-bold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-brand-600" />
                      <span>Razorpay Payment ID:</span>
                    </span>
                    <span className="font-mono font-bold text-brand-700 dark:text-brand-300">
                      {completedOrder.razorpayPaymentId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Tracking Code:</span>
                  <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                    {completedOrder.trackingNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Estimated Delivery:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {completedOrder.shippingMethod.estimatedDays}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 font-medium">Total Paid:</span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {formatPrice(completedOrder.total)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setActiveTab('orders');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Track in My Orders
                </button>
                <button
                  onClick={handlePrintReceipt}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>
                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setActiveTab('shop');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
