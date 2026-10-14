import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Product } from '../types';
import { AUTHORIZED_ADMIN_EMAIL, CURRENCIES } from '../data/mockProducts';
import {
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Layers,
  X,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  Lock,
  User,
  CornerDownLeft,
  Truck,
  CheckCircle2,
  Smartphone,
  MessageSquare,
  ExternalLink,
  Banknote,
  MapPin,
  Package,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    currency,
    login,
    openAuthModal,
    setActiveTab,
    products,
    orders,
    formatPrice,
    addProduct,
    updateProduct,
    deleteProduct,
    resetToDefaults,
    approveReturn,
    updateOrderStatus,
    cancelOrder,
    smsApiKey,
    setSmsApiKey,
    sendOtp,
  } = useShop();

  const currencyConfig = CURRENCIES[currency] || CURRENCIES.USD;
  const currencySymbol = currencyConfig.symbol;
  const currencyRate = currencyConfig.rate;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<'inventory' | 'orders' | 'settings'>('inventory');
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'returns' | 'cancelled'>('all');
  const [tempSmsKey, setTempSmsKey] = useState(smsApiKey);
  const [testPhone, setTestPhone] = useState('7013304012');
  const [testSmsStatus, setTestSmsStatus] = useState<string | null>(null);

  // Form states for New / Edit Product
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    brand: '',
    category: 'Electronics' as Product['category'],
    price: 99.99,
    originalPrice: 129.99,
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    tags: 'tech, premium',
  });

  // Access Control Guard: Only pokurinageswari@gmail.com can access admin portal
  const isAdmin =
    currentUser?.role === 'admin' &&
    currentUser?.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 animate-fade-in text-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-xl space-y-6">
          <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>Restricted Access Gate</span>
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Administrator Privileges Required
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              The DreamIT Mall Management Portal is strictly restricted to authorized store administrator (<strong>{AUTHORIZED_ADMIN_EMAIL}</strong>). Regular customers do not have permission to view sales ledgers or modify inventory.
            </p>
          </div>

          {currentUser ? (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-300">
                  Signed in as: <strong>{currentUser.name}</strong> ({currentUser.email})
                </span>
              </div>
              <span className="text-rose-500 font-bold">Access Denied</span>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200">
              You are currently browsing as a guest. Please sign in with the authorized Administrator account (<strong>{AUTHORIZED_ADMIN_EMAIL}</strong>).
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => login('7013304012', 'admin123', 'admin')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Log in as Administrator ({AUTHORIZED_ADMIN_EMAIL})</span>
            </button>
            <button
              onClick={() => openAuthModal('admin')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Custom Admin Sign In
            </button>
            <button
              onClick={() => setActiveTab('shop')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Return to Mall
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Analytics Metrics
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, ord) => sum + ord.total, 0);
  const totalOrdersCount = orders.length;
  const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  const lowStockCount = products.filter((p) => p.stock <= 5).length;
  const pendingReturns = orders.filter((o) => o.status === 'Return Requested');
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'Confirmed' || o.status === 'Processing' || o.status === 'Shipped' || o.status === 'Delivered'
  ).length;
  const returnedOrdersCount = orders.filter(
    (o) => o.status === 'Returned' || o.status === 'Return Requested'
  ).length;
  const cancelledOrdersCount = orders.filter(
    (o) => o.status === 'Cancelled' || o.status === 'Cancellation Requested'
  ).length;

  const filteredOrders = orders.filter((ord) => {
    if (orderFilter === 'active') {
      return ord.status === 'Confirmed' || ord.status === 'Processing' || ord.status === 'Shipped' || ord.status === 'Delivered';
    }
    if (orderFilter === 'returns') {
      return ord.status === 'Returned' || ord.status === 'Return Requested';
    }
    if (orderFilter === 'cancelled') {
      return ord.status === 'Cancelled' || ord.status === 'Cancellation Requested';
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      brand: '',
      category: 'Electronics',
      price: 99.99,
      originalPrice: 129.99,
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      tags: 'tech, premium',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      title: p.title,
      description: p.description,
      brand: p.brand,
      category: p.category,
      price: Number((p.price * currencyRate).toFixed(2)),
      originalPrice: Number(((p.originalPrice || p.price) * currencyRate).toFixed(2)),
      stock: p.stock,
      imageUrl: p.images[0] || '',
      tags: p.tags.join(', '),
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    // Convert input price back to base USD storage
    const basePrice = Number((Number(formData.price) / currencyRate).toFixed(2));
    const baseOriginalPrice = Number((Number(formData.originalPrice) / currencyRate).toFixed(2));

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        title: formData.title.trim(),
        description: formData.description.trim(),
        brand: formData.brand.trim() || 'DreamIT Studio',
        category: formData.category,
        price: basePrice,
        originalPrice: baseOriginalPrice,
        stock: Number(formData.stock),
        images: [formData.imageUrl.trim() || editingProduct.images[0]],
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
    } else {
      addProduct({
        title: formData.title.trim(),
        description: formData.description.trim() || 'Curated item.',
        brand: formData.brand.trim() || 'DreamIT Studio',
        category: formData.category,
        price: basePrice,
        originalPrice: baseOriginalPrice,
        stock: Number(formData.stock),
        images: [formData.imageUrl.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        isNew: true,
      });
    }

    setIsAddModalOpen(false);
  };

  const handleStockAdjust = (p: Product, delta: number) => {
    const newStock = Math.max(0, p.stock + delta);
    updateProduct({ ...p, stock: newStock });
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header with Admin Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              DreamIT Mall Administrator
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
              Verified Admin
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Store operations ledger, live inventory controls, and order approvals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (
                window.confirm(
                  '⚠️ WARNING: Are you sure you want to reset the store catalog to default demo products?\n\nThis will remove all custom products you added. Click "Cancel" to keep your products, or "OK" only if you really want to reset.'
                )
              ) {
                resetToDefaults();
              }
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Catalog</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Sales</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm">
              {currencySymbol}
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white block">
            {formatPrice(totalRevenue)}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>100% Local-First Ledger</span>
          </span>
        </div>

        {/* Orders Processed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Orders Recorded</span>
            <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white block">
            {totalOrdersCount}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Avg Order: <strong>{formatPrice(avgOrderValue)}</strong>
          </span>
        </div>

        {/* Active Catalog Items */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Inventory</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white block">
            {products.length} SKUs
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Across 5 Core Categories
          </span>
        </div>

        {/* Low Stock & Return Alerts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Action Alerts</span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                pendingReturns.length > 0 || lowStockCount > 0
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white block">
            {pendingReturns.length} Returns / {lowStockCount} Low Stock
          </span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
            {pendingReturns.length > 0 ? 'Customer Returns Require Review' : 'All Clear'}
          </span>
        </div>
      </div>

      {/* Tabs: Inventory Manager vs Customer Orders & Returns */}
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveAdminTab('inventory')}
          className={`text-sm font-bold pb-2 -mb-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeAdminTab === 'inventory'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Inventory SKU Manager ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('orders')}
          className={`text-sm font-bold pb-2 -mb-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeAdminTab === 'orders'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Customer Orders & Returns ({orders.length})</span>
          {pendingReturns.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white text-[10px] font-black">
              {pendingReturns.length} Action
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveAdminTab('settings')}
          className={`text-sm font-bold pb-2 -mb-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeAdminTab === 'settings'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Real SMS & Gateways</span>
        </button>
      </div>

      {/* TAB 1: Inventory Table Section */}
      {activeAdminTab === 'inventory' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Inventory Catalog Manager
              </h2>
              <p className="text-xs text-slate-500">
                Update pricing, adjust stock numbers, or create new listings.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {products.length} products listed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-5">Product Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((prod) => (
                  <tr
                    key={prod.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.images[0]}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block line-clamp-1">
                            {prod.title}
                          </span>
                          <span className="text-[11px] text-slate-500">{prod.brand}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {prod.category}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {formatPrice(prod.price)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStockAdjust(prod, -1)}
                          className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                            prod.stock <= 5
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {prod.stock}
                        </span>
                        <button
                          onClick={() => handleStockAdjust(prod, 1)}
                          className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteProduct(prod.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Orders & Return Approvals */}
      {activeAdminTab === 'orders' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Customer Orders, Returns &amp; Cancellations
              </h2>
              <p className="text-xs text-slate-500">
                Complete overview of customer orders, item breakdowns, return cash pickups, and cancellation status.
              </p>
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setOrderFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  orderFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Orders ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('active')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  orderFilter === 'active'
                    ? 'bg-brand-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Active ({activeOrdersCount})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('returns')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  orderFilter === 'returns'
                    ? 'bg-purple-600 text-white shadow-xs font-bold'
                    : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                }`}
              >
                Returns ({returnedOrdersCount})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('cancelled')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  orderFilter === 'cancelled'
                    ? 'bg-rose-600 text-white shadow-xs font-bold'
                    : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                }`}
              >
                Cancelled ({cancelledOrdersCount})
              </button>
            </div>
          </div>

          {filteredOrders.length > 0 ? (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredOrders.map((ord) => {
                const isReturned = ord.status === 'Returned' || ord.status === 'Return Requested';
                const isCancelled = ord.status === 'Cancelled' || ord.status === 'Cancellation Requested';

                return (
                  <div
                    key={ord.id}
                    className="p-5 sm:p-6 space-y-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Header Row: Order ID, Date, Payment & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Track: {ord.trackingNumber}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          • {new Date(ord.createdAt).toLocaleDateString()} {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                          Cash on Delivery (COD)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            ord.status === 'Returned'
                              ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300'
                              : ord.status === 'Return Requested'
                              ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300'
                              : ord.status === 'Cancelled'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300'
                              : ord.status === 'Cancellation Requested'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                          }`}
                        >
                          {ord.status}
                        </span>
                        <span className="font-mono font-black text-base text-slate-900 dark:text-white ml-2">
                          {formatPrice(ord.total)}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Shipping Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Customer Info */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Customer Details
                        </span>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-brand-600" />
                          <span>{ord.customer.fullName}</span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-300">
                          ✉️ {ord.customer.email}
                        </div>
                        {ord.customer.phone && (
                          <div className="text-slate-600 dark:text-slate-300 font-mono">
                            📱 +91 {ord.customer.phone.replace(/[\s\-\(\)\+]/g, '').slice(-10)}
                          </div>
                        )}
                      </div>

                      {/* Delivery Address */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Delivery / Pickup Address
                        </span>
                        <div className="text-slate-700 dark:text-slate-200 font-medium flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>
                            {ord.customer.address}, {ord.customer.city}, {ord.customer.country}
                            {ord.customer.postalCode ? ` - ${ord.customer.postalCode}` : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ordered Items Breakdown */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Ordered Items ({ord.items.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {ord.items.map((it) => (
                          <div
                            key={it.id}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 flex items-center gap-2.5 text-xs"
                          >
                            {it.product.images?.[0] ? (
                              <img
                                src={it.product.images[0]}
                                alt={it.product.title}
                                className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                <Package className="w-5 h-5 text-slate-400" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <span className="font-semibold text-slate-900 dark:text-white truncate block">
                                {it.product.title}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                Qty: <strong>{it.quantity}</strong>
                                {it.selectedColor ? ` • ${it.selectedColor}` : ''}
                                {it.selectedSize ? ` • ${it.selectedSize}` : ''}
                              </span>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white shrink-0">
                              {formatPrice(it.product.price * it.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Return Details Card (Strictly display the requested cash pickup notice) */}
                    {isReturned && (
                      <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-xs space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-extrabold text-purple-900 dark:text-purple-200">
                            <CornerDownLeft className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span>Customer Return Details (Cash on Delivery)</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
                            ✓ Inventory Restocked
                          </span>
                        </div>
                        <p className="text-purple-700 dark:text-purple-300 font-semibold">
                          Refunds for COD orders are issued in cash at the time of return pickup.
                        </p>
                        {ord.returnRequestedAt && (
                          <div className="text-[10px] text-purple-600 dark:text-purple-400 font-mono pt-1 border-t border-purple-200/60 dark:border-purple-800">
                            Return Timestamp: {new Date(ord.returnRequestedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Cancellation Details Card */}
                    {isCancelled && (
                      <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-extrabold text-rose-900 dark:text-rose-200">
                            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                            <span>Order Cancellation Details</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                            ✓ Inventory Restocked
                          </span>
                        </div>
                        <p className="text-rose-700 dark:text-rose-300">
                          <strong>Order Cancelled by Customer</strong> • No payment was collected (Cash on Delivery).
                        </p>
                        {ord.cancelledAt && (
                          <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-rose-200/60 dark:border-rose-800">
                            Cancelled on: {new Date(ord.cancelledAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin Action Controls (For Active or Return Requested orders) */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {ord.status === 'Return Requested' && (
                        <button
                          type="button"
                          onClick={() => approveReturn(ord.id)}
                          className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <CornerDownLeft className="w-3.5 h-3.5" />
                          <span>Approve Return (Restock &amp; Confirm Cash Pickup)</span>
                        </button>
                      )}

                      {ord.status === 'Confirmed' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(ord.id, 'Processing')}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                        >
                          Mark Processing
                        </button>
                      )}
                      {ord.status === 'Processing' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(ord.id, 'Shipped')}
                          className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold cursor-pointer shadow-xs"
                        >
                          Mark Shipped
                        </button>
                      )}
                      {ord.status === 'Shipped' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(ord.id, 'Delivered')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer shadow-xs"
                        >
                          Mark Delivered
                        </button>
                      )}

                      {(ord.status === 'Confirmed' || ord.status === 'Processing') && (
                        <button
                          type="button"
                          onClick={() => cancelOrder(ord.id, 'Cancelled by Admin')}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-xs font-bold cursor-pointer"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 px-4 space-y-2">
              <Package className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No orders found under &quot;{orderFilter}&quot;
              </p>
              <p className="text-xs text-slate-400">
                Customer purchases, returns, and cancellations will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Real SMS & Gateway Settings */}
      {activeAdminTab === 'settings' && (
        <div className="space-y-6">
          {/* SMS Gateway Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Real Telecom Cellular SMS Gateway (India +91)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Dispatch live SMS OTPs to customer mobile numbers (such as 7013304012) via Fast2SMS.
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  smsApiKey
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${smsApiKey ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span>{smsApiKey ? 'Live SMS Active' : 'Standby / Simulated Mode'}</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>How Real SMS Works in Web Applications:</strong> Web browsers running on laptops or mobile phones cannot send physical telecom cellular SMS without an SMS Gateway API. Fast2SMS connects your app to Indian telecom towers (Jio, Airtel, Vi) to deliver real SMS messages directly to customer phones.
                </div>
              </div>

              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold">
                <ExternalLink className="w-3.5 h-3.5" />
                <a
                  href="https://www.fast2sms.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Get Free Fast2SMS API Key (Fast2SMS provides instant free credits upon signup) &rarr;
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <label className="font-bold text-slate-700 dark:text-slate-300 block text-xs">
                Fast2SMS API Key (Authorization Key)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="password"
                  value={tempSmsKey}
                  onChange={(e) => setTempSmsKey(e.target.value)}
                  placeholder="Paste Fast2SMS API Key from fast2sms.com/dashboard/dev-api"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSmsApiKey(tempSmsKey.trim());
                    setTestSmsStatus('Fast2SMS Gateway Key saved successfully!');
                    setTimeout(() => setTestSmsStatus(null), 3500);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Save SMS Key
                </button>
              </div>
              {testSmsStatus && (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{testSmsStatus}</span>
                </div>
              )}
            </div>

            {/* Test SMS dispatch */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-700 dark:text-slate-300 block text-xs">
                Send Test Verification SMS to Real Phone Number
              </span>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full sm:w-60 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const res = sendOtp(testPhone);
                    setTestSmsStatus(res.message);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send Test SMS to Phone</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cash on Delivery Exclusive Gateway Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Storewide Payment Method: Cash on Delivery (COD) Only
                  </h2>
                  <p className="text-xs text-slate-500">
                    All customer checkouts are exclusively Cash on Delivery. Online payment gateways (Razorpay, Cards, NetBanking) are disabled.
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>COD Active Storewide</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>No Online Gateways Required:</strong> Customers place orders without entering debit/credit cards or online payment passwords. Courier collects cash or contactless UPI on delivery.</span>
              </div>
              <div className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <span><strong>Parcel Return Policy:</strong> When Cash on Delivery orders are cancelled or returned, refunds are only issued after the parcel physically arrives back at your warehouse.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingProduct ? 'Edit Product SKU' : 'Add New Product to DreamIT Mall'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Ultra-thin Wireless Mechanical Keyboard"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. KeySmith"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="Fitness">Fitness</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Price ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder={`e.g. ${(199.99 * currencyRate).toFixed(0)}`}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Compare Price ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, originalPrice: Number(e.target.value) })
                    }
                    placeholder={`e.g. ${(249.99 * currencyRate).toFixed(0)}`}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Product Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key features and details..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-md cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
