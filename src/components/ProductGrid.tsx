import React, { useMemo, useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import { FilterSidebar } from './FilterSidebar';
import {
  SlidersHorizontal,
  PackageOpen,
  RotateCcw,
  Sparkles,
  Flame,
  Search,
  X,
} from 'lucide-react';

export const ProductGrid: React.FC = () => {
  const { products, filters, setFilters, resetFilters } = useShop();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (filters.category !== 'All' && p.category !== filters.category) {
          return false;
        }

        // Real-time Search filter across title, description, brand, category, tags
        if (filters.search && filters.search.trim() !== '') {
          const q = filters.search.toLowerCase().trim();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          const matchTags = p.tags && p.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchBrand && !matchCategory && !matchTags) {
            return false;
          }
        }

        // Price filter
        if (p.price > filters.maxPrice) {
          return false;
        }

        // Rating filter
        if (p.rating < filters.minRating) {
          return false;
        }

        // Stock filter
        if (filters.inStockOnly && p.stock <= 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Discount Deals first (sorted by highest discount percentage, then remaining)
        if (filters.sortBy === 'discount') {
          const discA =
            a.originalPrice && a.originalPrice > a.price
              ? (a.originalPrice - a.price) / a.originalPrice
              : 0;
          const discB =
            b.originalPrice && b.originalPrice > b.price
              ? (b.originalPrice - b.price) / b.originalPrice
              : 0;
          if (discB !== discA) {
            return discB - discA; // Biggest discount first
          }
          return a.price - b.price;
        }

        // New Arrivals first (all isNew: true items first, then remaining)
        if (filters.sortBy === 'newest') {
          const isNewA = a.isNew ? 1 : 0;
          const isNewB = b.isNew ? 1 : 0;
          if (isNewB !== isNewA) {
            return isNewB - isNewA; // New arrivals first!
          }
          return b.rating - a.rating;
        }

        if (filters.sortBy === 'price-low') return a.price - b.price;
        if (filters.sortBy === 'price-high') return b.price - a.price;
        if (filters.sortBy === 'rating') return b.rating - a.rating;

        // Default featured
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, filters]);

  const activeSortLabel = useMemo(() => {
    switch (filters.sortBy) {
      case 'newest':
        return 'Showing New Arrivals First';
      case 'discount':
        return 'Showing Biggest Discount Deals First';
      case 'price-low':
        return 'Price: Low to High';
      case 'price-high':
        return 'Price: High to Low';
      case 'rating':
        return 'Highest Rated First';
      default:
        return 'Featured Collection';
    }
  }, [filters.sortBy]);

  return (
    <section className="space-y-6">
      {/* Top Banner if Search or Priority sorting is active */}
      {filters.search && (
        <div className="p-3.5 rounded-2xl bg-brand-50/80 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-brand-900 dark:text-brand-200">
            <Search className="w-4 h-4 text-brand-600" />
            <span>
              Search results for <strong>"{filters.search}"</strong> ({filteredProducts.length} items found)
            </span>
          </div>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear search</span>
          </button>
        </div>
      )}

      {/* Top Bar with Quick Highlight Pills & Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {filters.category === 'All' ? 'DreamIT Catalog' : `${filters.category} Collection`}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-bold">
              {filteredProducts.length} items
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{activeSortLabel}</p>
        </div>

        {/* Priority Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* New Arrivals First Pill */}
          <button
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                sortBy: prev.sortBy === 'newest' ? 'featured' : 'newest',
              }))
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              filters.sortBy === 'newest'
                ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-600/30'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>New Arrivals First</span>
          </button>

          {/* Discount Deals First Pill */}
          <button
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                sortBy: prev.sortBy === 'discount' ? 'featured' : 'discount',
              }))
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              filters.sortBy === 'discount'
                ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-600/30'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Discount Deals First</span>
          </button>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
            <span>Filters</span>
          </button>

          {/* Sort By Dropdown */}
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sortBy: e.target.value as any,
              }))
            }
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer shadow-xs"
          >
            <option value="featured">Featured Collection</option>
            <option value="newest">✨ New Arrivals First</option>
            <option value="discount">🔥 Discount Deals First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Mobile Collapsible Filter Drawer */}
      {mobileFilterOpen && (
        <div className="lg:hidden p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <FilterSidebar />
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-3">
          <FilterSidebar />
        </div>

        {/* Product Cards Grid */}
        <div className="lg:col-span-9">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <PackageOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  No matching products found
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {filters.search
                    ? `No products matched "${filters.search}". Try a different keyword.`
                    : 'Try adjusting your filters, increasing the price range, or clearing filters.'}
                </p>
              </div>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
