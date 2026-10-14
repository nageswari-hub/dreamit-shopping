import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { SHIPPING_METHODS } from '../data/mockProducts';
import { OrderCustomer, ShippingMethod } from '../types';
import confetti from 'canvas-confetti';
import {
  X,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Banknote,
  Printer,
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
    currentUser,
  } = useShop();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Customer Shipping Details
  const [customer, setCustomer] = useState<OrderCustomer>(() => ({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone
      ? (currentUser.phone.startsWith('+91') ? currentUser.phone : `+91 ${currentUser.phone}`)
      : '+91 ',
    address: '42 MG Road, Koramangala',
    city: 'Bengaluru',
    postalCode: '560034',
    country: 'India',
  }));

  // Selected Shipping Method
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod>(SHIPPING_METHODS[0]);

  // Confirmation state
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset checkout flow to Step 1 whenever modal is opened
  useEffect(() => {
    if (isCheckoutOpen) {
      setStep(1);
      setCompletedOrder(null);
      setIsProcessing(false);
      if (currentUser) {
        setCustomer((prev) => ({
          ...prev,
          fullName: currentUser.name || prev.fullName,
          email: currentUser.email || prev.email,
          phone: currentUser.phone
            ? (currentUser.phone.startsWith('+91') ? currentUser.phone : `+91 ${currentUser.phone}`)
            : prev.phone,
        }));
      }
    }
  }, [isCheckoutOpen, currentUser]);

  const handleCloseModal = () => {
    setStep(1);
    setCompletedOrder(null);
    setIsProcessing(false);
    setIsCheckoutOpen(false);
  };

  if (!isCheckoutOpen) return null;

  const freeShipping = cartSubtotal >= 100;
  const actualShippingCost =
    selectedShipping.id === 'standard' && freeShipping ? 0 : selectedShipping.cost;
  const estimatedTax = (cartSubtotal - cartDiscount) * 0.08;
  const orderTotal = Math.max(0, cartSubtotal - cartDiscount + actualShippingCost + estimatedTax);

  const handlePlaceCodOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
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
        paymentMethod: 'cod',
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
          colors: ['#10b981', '#f59e0b', '#0e8ce9', '#8b5cf6'],
        });
      } catch (err) {
        console.log('Confetti error:', err);
      }
    }, 700);
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

          <button
            onClick={handleCloseModal}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
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
              <span>Cash on Delivery</span>
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
                    Phone Number (for Delivery SMS & Dispatch updates) *
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

          {/* STEP 3: Payment Method (Exclusively Cash on Delivery) */}
          {step === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
              <div className="lg:col-span-7 space-y-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-xs font-bold mb-2 border border-amber-300 dark:border-amber-900/60">
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Payment Gateway: Cash on Delivery Only</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Cash on Delivery (COD)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    No advance online payment required. Pay safely in cash or scan delivery QR upon courier arrival at your doorstep.
                  </p>
                </div>

                {/* 3 Trust Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-[11px]">0% Advance Risk</div>
                      <div className="text-[10px] text-slate-500">Zero card details needed</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-[11px]">Doorstep Delivery</div>
                      <div className="text-[10px] text-slate-500">Pay when parcel arrives</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-[11px]">Flexible Mode</div>
                      <div className="text-[10px] text-slate-500">Cash or UPI upon delivery</div>
                    </div>
                  </div>
                </div>

                {/* Delivery & Cash Amount Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-slate-50 dark:from-slate-800/80 dark:to-slate-900 border border-amber-200/90 dark:border-slate-700 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-200/60 dark:border-slate-700">
                    <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 text-xs">
                      <Banknote className="w-4 h-4 text-amber-600" />
                      <span>Cash Amount to Keep Ready:</span>
                    </span>
                    <span className="font-black text-lg text-slate-900 dark:text-white font-mono">
                      {formatPrice(orderTotal)}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Recipient Name:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{customer.fullName} ({customer.phone})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Delivery Address:</span>
                      <span className="font-medium text-right max-w-xs">{customer.address}, {customer.city} - {customer.postalCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Shipping Courier:</span>
                      <span className="font-semibold text-brand-600 dark:text-brand-400">{selectedShipping.name} ({selectedShipping.estimatedDays})</span>
                    </div>
                  </div>
                </div>

                {/* Policy Note */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <p>
                    • <strong>Cash on Delivery Refund Policy:</strong> In case of cancellation or return, refund will be issued to your bank account after the parcel is returned to our warehouse.
                  </p>
                  <p>
                    • Please keep the exact amount ready upon delivery. An SMS dispatch alert will be sent to <strong>{customer.phone}</strong>.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={handlePlaceCodOrder}
                    disabled={isProcessing}
                    className="px-7 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-600/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span>Placing Order...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Place Cash on Delivery Order • {formatPrice(orderTotal)}</span>
                      </>
                    )}
                  </button>
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
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Order Confirmed • Cash on Delivery</span>
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  Thank You, {completedOrder.customer.fullName}!
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your Cash on Delivery order has been successfully placed at DreamIT Mall. Pay safely upon arrival. Your tracking code and invoice are generated below.
                </p>
              </div>

              {/* Order ID & COD Payment Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Order Number:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {completedOrder.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900">
                  <span className="text-amber-900 dark:text-amber-300 font-bold flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-amber-600" />
                    <span>Payment Method:</span>
                  </span>
                  <span className="font-bold text-amber-800 dark:text-amber-200">
                    Cash on Delivery (COD)
                  </span>
                </div>
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
                  <span className="text-slate-500 font-medium">Payable on Delivery:</span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {formatPrice(completedOrder.total)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    handleCloseModal();
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
                    handleCloseModal();
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
