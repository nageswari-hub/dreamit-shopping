import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Product } from '../types';
import {
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  DollarSign,
  Layers,
  X,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    orders,
    formatPrice,
    addProduct,
    updateProduct,
    deleteProduct,
    resetToDefaults,
  } = useShop();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  // Analytics Metrics
  const totalRevenue = orders.reduce((sum, ord) => sum + ord.total, 0);
  const totalOrdersCount = orders.length;
  const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

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
      price: p.price,
      originalPrice: p.originalPrice || p.price,
      stock: p.stock,
      imageUrl: p.images[0] || '',
      tags: p.tags.join(', '),
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        title: formData.title.trim(),
        description: formData.description.trim(),
        brand: formData.brand.trim() || 'Elevate Studio',
        category: formData.category,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        stock: Number(formData.stock),
        images: [formData.imageUrl.trim() || editingProduct.images[0]],
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
    } else {
      addProduct({
        title: formData.title.trim(),
        description: formData.description.trim() || 'Premium curated item.',
        brand: formData.brand.trim() || 'Elevate Studio',
        category: formData.category,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        stock: Number(formData.stock),
        images: [formData.imageUrl.trim()],
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Store Management & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time store ledger, inventory controls, and revenue insights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetToDefaults}
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
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white block">
            {formatPrice(totalRevenue)}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>100% Client-Side Local Ledger</span>
          </span>
        </div>

        {/* Orders Processed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Orders Filled</span>
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

        {/* Low Stock Alerts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Stock Health</span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                lowStockCount > 0
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white block">
            {lowStockCount} Items
          </span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
            {lowStockCount > 0 ? 'Replenishment Recommended' : 'Optimal Inventory'}
          </span>
        </div>
      </div>

      {/* Inventory Table Section */}
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
                <th className="py-3 px-4">Rating</th>
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
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 dark:text-white">
                      ★ {prod.rating}
                    </span>
                    <span className="text-slate-500 text-[11px]"> ({prod.reviewsCount})</span>
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
                {editingProduct ? 'Edit Product SKU' : 'Add New Product to Store'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
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
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Compare Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, originalPrice: Number(e.target.value) })
                    }
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
