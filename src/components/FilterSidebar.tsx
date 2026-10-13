import React from 'react';
import { useShop } from '../context/ShopContext';
import { RotateCcw, Filter, Star, Check } from 'lucide-react';

export const FilterSidebar: React.FC = () => {
  const { filters, setFilters, resetFilters, formatPrice, products } = useShop();

  const activeFiltersCount =
    (filters.category !== 'All' ? 1 : 0) +
    (filters.maxPrice < 500 ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.search ? 1 : 0);

  const categories = ['All', 'Electronics', 'Fashion', 'Accessories', 'Home & Living', 'Fitness'];

  return (
    <aside
      aria-label="Product filters"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 space-y-6 shadow-xs sticky top-24"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <h2 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            Filters
          </h2>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-bold">
              {activeFiltersCount}
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Category List */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
          Categories
        </span>
        <div className="space-y-1">
          {categories.map((cat) => {
            const count =
              cat === 'All'
                ? products.length
                : products.filter((p) => p.category === cat).length;
            const isSelected = filters.category === cat;

            return (
              <button
                key={cat}
                onClick={() => setFilters((prev) => ({ ...prev, category: cat }))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{cat}</span>
                <span className="text-[11px] text-slate-400">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Max Price
          </span>
          <span className="font-bold text-brand-600 dark:text-brand-400">
            {formatPrice(filters.maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min="20"
          max="500"
          step="10"
          value={filters.maxPrice}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))
          }
          className="w-full accent-brand-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
          <span>{formatPrice(20)}</span>
          <span>{formatPrice(500)}</span>
        </div>
      </div>

      {/* Customer Rating Filter */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
          Minimum Rating
        </span>
        <div className="space-y-1">
          {[
            { value: 0, label: 'Any Rating' },
            { value: 4.5, label: '4.5 Stars & above' },
            { value: 4.0, label: '4.0 Stars & above' },
            { value: 3.5, label: '3.5 Stars & above' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilters((prev) => ({ ...prev, minRating: item.value }))}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                filters.minRating === item.value
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {item.value > 0 ? (
                  <>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{item.label}</span>
                  </>
                ) : (
                  <span>{item.label}</span>
                )}
              </div>
              {filters.minRating === item.value && <Check className="w-3.5 h-3.5 text-brand-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* In Stock Only Checkbox */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, inStockOnly: e.target.checked }))
            }
            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500/30 border-slate-300 dark:border-slate-700 cursor-pointer"
          />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            In-Stock Items Only
          </span>
        </label>
      </div>
    </aside>
  );
};
