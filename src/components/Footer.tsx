import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Send,
  Lock,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab, setFilters, showNotification } = useShop();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    showNotification('Welcome to DreamIT VIP Circle! Your 15% promo code is DREAMIT15.', 'success');
    setEmail('');
  };

  const handleCategoryClick = (cat: string) => {
    setActiveTab('shop');
    setFilters((prev) => ({ ...prev, category: cat }));
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors mt-auto">
      {/* Newsletter VIP Banner */}
      <div className="bg-gradient-to-r from-brand-950 via-indigo-950 to-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DreamIT VIP Circle</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Unlock 15% Off Your First DreamIT Order
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Subscribe to receive private preview drops, limited-edition flash sales, and seasonal discount coupons.
            </p>
          </div>

          <div className="md:col-span-5">
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-brand-400 backdrop-blur-md"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-lg shadow-brand-500/20"
              >
                <span>Join</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                DreamIT Mall
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Your digital department store for curated technology, lifestyle fashion, and modern home essentials. Zero external database requirement with instant local-first persistence.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Authenticated
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-4 h-4 text-brand-500" /> 256-bit SSL
              </span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Mall Departments
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button
                  onClick={() => handleCategoryClick('Electronics')}
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                >
                  Electronics & Audio
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Fashion')}
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                >
                  Merino & Streetwear
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Accessories')}
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                >
                  Watches & Leather
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Home & Living')}
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                >
                  Artisan Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('Fitness')}
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                >
                  Athletic & Training
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Portal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button
                  onClick={() => {
                    setActiveTab('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                >
                  Explore All Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('orders');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                >
                  Track & Cancel Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('orders');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                >
                  Request Item Returns
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                >
                  Administrator Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Guarantees */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Guarantees
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>Complimentary Delivery over $100</span>
              </li>
              <li className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span>30-Day Hassle-Free Returns</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Instant Order Cancellations</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} DreamIT Mall. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Local-First Web Architecture
            </span>
            <span>•</span>
            <span>Customer & Admin Portals</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
