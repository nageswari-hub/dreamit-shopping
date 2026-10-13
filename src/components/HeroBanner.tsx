import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { ArrowRight, Sparkles, Clock, ShieldCheck, Truck, RotateCcw, Flame } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { setFilters, setActiveTab } = useShop();

  // Flash Sale Countdown timer (dynamic hours, mins, secs)
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToCatalog = () => {
    const catalogElement = document.getElementById('product-catalog');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShowNewArrivals = () => {
    setActiveTab('shop');
    setFilters((prev) => ({ ...prev, sortBy: 'newest', category: 'All' }));
    scrollToCatalog();
  };

  const handleShowDiscountDeals = () => {
    setActiveTab('shop');
    setFilters((prev) => ({ ...prev, sortBy: 'discount', category: 'All' }));
    scrollToCatalog();
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-100 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 py-12 sm:py-16 lg:py-20 border-b border-slate-200 dark:border-slate-800">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-brand-500/10 via-indigo-500/15 to-purple-500/10 blur-3xl pointer-events-none rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/60 text-brand-700 dark:text-brand-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>Welcome to DreamIT Mall • The Ultimate Retail Experience</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Elevate Your Lifestyle at DreamIT Mall.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Discover curated electronics, luxury apparel, lifestyle creations, and athletic essentials with instant delivery, easy 30-day returns, and zero-hassle cancellations.
            </p>

            {/* CTAs with priority New Arrivals and Discount Deals */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={handleShowNewArrivals}
                className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 flex items-center gap-2 transition-all hover:gap-3 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Shop New Arrivals First</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleShowDiscountDeals}
                className="px-6 py-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Flame className="w-4 h-4 text-rose-500" />
                <span>View Discount Deals First</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Truck className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span className="text-xs font-medium">Free Global Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-xs font-medium">Verified Authentic</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <RotateCcw className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span className="text-xs font-medium">30-Day Easy Returns</span>
              </div>
            </div>
          </div>

          {/* Flash Sale Card Showcase */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-6 sm:p-8 text-white shadow-2xl border border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span>Limited DreamIT Flash Sale</span>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold">
                  Up to 30% OFF
                </span>
              </div>

              {/* Countdown Display */}
              <div className="py-6 text-center">
                <p className="text-xs text-slate-300 font-medium mb-3">Flash discounts expire in:</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 w-16 text-center">
                    <span className="block text-2xl font-black tracking-tight">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-[10px] uppercase text-slate-300 tracking-wider">Hours</span>
                  </div>
                  <span className="text-2xl font-bold text-amber-400">:</span>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 w-16 text-center">
                    <span className="block text-2xl font-black tracking-tight">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-[10px] uppercase text-slate-300 tracking-wider">Mins</span>
                  </div>
                  <span className="text-2xl font-bold text-amber-400">:</span>
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 w-16 text-center">
                    <span className="block text-2xl font-black tracking-tight">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="text-[10px] uppercase text-slate-300 tracking-wider">Secs</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Coupon Code</span>
                  <span className="text-base font-extrabold tracking-wider text-amber-300 font-mono">ELEVATE20</span>
                </div>
                <button
                  onClick={handleShowDiscountDeals}
                  className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Explore Deals
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
