import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Order } from '../types';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  XCircle,
  AlertCircle,
  CornerDownLeft,
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const {
    orders,
    formatPrice,
    addToCart,
    setActiveTab,
    showNotification,
    cancelOrder,
    requestReturn,
  } = useShop();

  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    orders[0]?.id || null
  );
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  // Cancellation modal state
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Found a better price elsewhere');

  // Return request modal state
  const [returningOrder, setReturningOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState('Item size does not fit as expected');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(text);
    showNotification('Tracking number copied to clipboard', 'info');
    setTimeout(() => setCopiedTracking(null), 2500);
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart(item.product, item.quantity, item.selectedColor, item.selectedSize);
    });
    showNotification(`Re-added ${order.items.length} items to your shopping bag!`);
  };

  const confirmCancel = () => {
    if (!cancellingOrder) return;
    cancelOrder(cancellingOrder.id, cancelReason);
    setCancellingOrder(null);
  };

  const confirmReturn = () => {
    if (!returningOrder) return;
    requestReturn(returningOrder.id, returnReason);
    setReturningOrder(null);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Processing':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Shipped':
        return 'bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800';
      case 'Delivered':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Cancelled':
        return 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Return Requested':
        return 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Returned':
        return 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusStep = (status: Order['status']) => {
    switch (status) {
      case 'Confirmed':
        return 1;
      case 'Processing':
        return 2;
      case 'Shipped':
        return 3;
      case 'Delivered':
      case 'Return Requested':
      case 'Returned':
        return 4;
      default:
        return 1;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Orders, Tracking & Returns
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your deliveries, cancel active shipments, request returns, and print official invoices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-bold">
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Recorded
          </span>
        </div>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const currentStep = getStatusStep(order.status);
            const isCancelled = order.status === 'Cancelled';
            const canCancel = order.status === 'Confirmed' || order.status === 'Processing';
            const canReturn = order.status === 'Delivered';

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all"
              >
                {/* Order Summary Header Bar */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-5 sm:p-6 bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Order Number
                      </span>
                      <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                        {order.orderNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Date Placed
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Total Amount
                      </span>
                      <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    <button
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Timeline Progress Bar (if not cancelled) */}
                {!isCancelled ? (
                  <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="max-w-2xl mx-auto">
                      <div className="relative flex items-center justify-between">
                        {/* Connection Line */}
                        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-700 -z-0" />
                        <div
                          className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-brand-600 transition-all duration-500 -z-0"
                          style={{
                            width: `${((currentStep - 1) / 3) * 100}%`,
                          }}
                        />

                        {/* Milestones */}
                        {[
                          { step: 1, label: 'Confirmed', icon: Clock },
                          { step: 2, label: 'Processing', icon: Package },
                          { step: 3, label: 'Shipped', icon: Truck },
                          { step: 4, label: 'Delivered', icon: CheckCircle2 },
                        ].map((s) => {
                          const Icon = s.icon;
                          const isReached = currentStep >= s.step;
                          const isCurrent = currentStep === s.step;

                          return (
                            <div key={s.step} className="flex flex-col items-center z-10">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                  isReached
                                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 ring-4 ring-white dark:ring-slate-900'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 ring-4 ring-white dark:ring-slate-900'
                                } ${isCurrent ? 'scale-110' : ''}`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <span
                                className={`text-[11px] font-bold mt-2 ${
                                  isReached
                                    ? 'text-slate-900 dark:text-white'
                                    : 'text-slate-400'
                                }`}
                              >
                                {s.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tracking snippet */}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-brand-500" />
                        <span className="text-slate-500">Tracking Code:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {order.trackingNumber}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(order.trackingNumber)}
                        className="flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline font-semibold cursor-pointer"
                      >
                        {copiedTracking === order.trackingNumber ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Tracking</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-rose-50/70 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900 flex items-center justify-between text-xs text-rose-800 dark:text-rose-200">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span>
                        This order was cancelled on{' '}
                        {order.cancelledAt
                          ? new Date(order.cancelledAt).toLocaleDateString()
                          : 'recently'}
                        . Reason: <em>"{order.cancellationReason}"</em>.
                      </span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      Refund Issued
                    </span>
                  </div>
                )}

                {/* Return Status Notice */}
                {order.status === 'Return Requested' && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border-b border-purple-200 dark:border-purple-900 flex items-center gap-2 text-xs text-purple-800 dark:text-purple-200">
                    <CornerDownLeft className="w-4 h-4 text-purple-600" />
                    <span>
                      Return requested: <em>"{order.returnReason}"</em>. Our support team will review and approve within 24 hours.
                    </span>
                  </div>
                )}
                {order.status === 'Returned' && (
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Item returned and refund completed to original payment method.</span>
                  </div>
                )}

                {/* Expanded Order Items & Actions */}
                {isExpanded && (
                  <div className="p-6 space-y-6">
                    {/* Item list */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Items In This Order
                      </h4>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="py-3 flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={item.product.images[0]}
                                alt=""
                                className="w-14 h-14 rounded-xl object-cover bg-slate-100"
                              />
                              <div>
                                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                  {item.product.title}
                                </h5>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                  {item.selectedColor && (
                                    <span>Color: {item.selectedColor}</span>
                                  )}
                                  {item.selectedSize && (
                                    <span>Size: {item.selectedSize}</span>
                                  )}
                                  <span>Qty: {item.quantity}</span>
                                </div>
                              </div>
                            </div>
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery & Billing Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
                      <div>
                        <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                          Delivery Address
                        </span>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {order.customer.fullName}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                          {order.customer.address}, {order.customer.city},{' '}
                          {order.customer.postalCode}, {order.customer.country}
                        </p>
                        <p className="text-slate-500 mt-1">
                          Phone: {order.customer.phone} | Email: {order.customer.email}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                          Payment & Summary
                        </span>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Subtotal</span>
                          <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                            <span>Discount</span>
                            <span>-{formatPrice(order.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Shipping ({order.shippingMethod.name})</span>
                          <span>
                            {order.shippingCost === 0
                              ? 'FREE'
                              : formatPrice(order.shippingCost)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Taxes</span>
                          <span>{formatPrice(order.tax)}</span>
                        </div>
                        {order.razorpayPaymentId && (
                          <div className="flex justify-between text-brand-600 dark:text-brand-400 font-semibold">
                            <span>Razorpay ID</span>
                            <span className="font-mono text-[11px]">{order.razorpayPaymentId}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                          <span>Total</span>
                          <span className="text-brand-600 dark:text-brand-400">
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Action Buttons with Cancel & Return */}
                    <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                      {/* Cancel Order Action */}
                      {canCancel && (
                        <button
                          onClick={() => setCancellingOrder(order)}
                          className="px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Order</span>
                        </button>
                      )}

                      {/* Request Return Action */}
                      {canReturn && (
                        <button
                          onClick={() => setReturningOrder(order)}
                          className="px-4 py-2 rounded-xl border border-purple-300 dark:border-purple-900 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <CornerDownLeft className="w-3.5 h-3.5" />
                          <span>Request Return</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedInvoice(order)}
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Invoice</span>
                      </button>
                      <button
                        onClick={() => handleReorder(order)}
                        className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Re-order Items</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              No orders placed yet
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              When you purchase items from DreamIT Mall, your real-time tracking timeline, cancellation, and return options will appear here.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('shop')}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md cursor-pointer"
          >
            Start Shopping Now
          </button>
        </div>
      )}

      {/* Cancel Order Dialog Modal */}
      {cancellingOrder && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Cancel Order {cancellingOrder.orderNumber}?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to cancel this order? The items will be returned to inventory and a refund will be processed.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Reason for cancellation:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                <option value="Changed my mind / Ordered by mistake">Changed my mind / Ordered by mistake</option>
                <option value="Shipping takes too long">Shipping takes too long</option>
                <option value="Need to change shipping address">Need to change shipping address</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setCancellingOrder(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Keep Order
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Request Dialog Modal */}
      {returningOrder && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
              <CornerDownLeft className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Request Return for {returningOrder.orderNumber}
              </h3>
              <p className="text-xs text-slate-500">
                DreamIT Mall offers a 30-day hassle-free return guarantee on delivered items.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Reason for return:
              </label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="Item size does not fit as expected">Item size does not fit as expected</option>
                <option value="Item received defective or damaged">Item received defective or damaged</option>
                <option value="Product does not match website description">Product does not match website description</option>
                <option value="Arrived later than expected">Arrived later than expected</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setReturningOrder(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmReturn}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Submit Return Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {selectedInvoice && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-xl font-black tracking-tight text-brand-600">
                  DREAMIT MALL
                </span>
                <span className="block text-xs text-slate-500">Official Purchase Invoice</span>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-400 block">INVOICE TO</span>
                <p className="font-bold text-slate-900">{selectedInvoice.customer.fullName}</p>
                <p className="text-slate-600">{selectedInvoice.customer.address}</p>
                <p className="text-slate-600">
                  {selectedInvoice.customer.city}, {selectedInvoice.customer.country}
                </p>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-400 block">ORDER DETAILS</span>
                <p className="font-mono font-bold text-slate-900">
                  {selectedInvoice.orderNumber}
                </p>
                <p className="text-slate-600">
                  Date: {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                </p>
                <p className="text-slate-600 font-mono">
                  Track: {selectedInvoice.trackingNumber}
                </p>
                <p className="text-slate-600">
                  Status: <strong>{selectedInvoice.status}</strong>
                </p>
                {selectedInvoice.razorpayPaymentId && (
                  <p className="text-slate-600 font-mono text-[10px]">
                    Razorpay ID: {selectedInvoice.razorpayPaymentId}
                  </p>
                )}
              </div>
            </div>

            {/* Invoice items table */}
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="text-left py-2">Item Description</th>
                  <th className="text-center py-2">Qty</th>
                  <th className="text-right py-2">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedInvoice.items.map((it) => (
                  <tr key={it.id}>
                    <td className="py-2.5">
                      <span className="font-bold text-slate-900">{it.product.title}</span>
                      <span className="block text-[10px] text-slate-500">
                        {it.selectedColor ? `Color: ${it.selectedColor}` : ''}{' '}
                        {it.selectedSize ? `| Size: ${it.selectedSize}` : ''}
                      </span>
                    </td>
                    <td className="text-center py-2.5">{it.quantity}</td>
                    <td className="text-right py-2.5 font-bold">
                      {formatPrice(it.product.price * it.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total footer */}
            <div className="border-t border-slate-200 pt-3 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatPrice(selectedInvoice.subtotal)}</span>
              </div>
              {selectedInvoice.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount:</span>
                  <span>-{formatPrice(selectedInvoice.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Shipping:</span>
                <span>{formatPrice(selectedInvoice.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (8%):</span>
                <span>{formatPrice(selectedInvoice.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-black pt-2 border-t border-slate-300 text-slate-950">
                <span>Total Paid:</span>
                <span className="text-brand-600">{formatPrice(selectedInvoice.total)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
