import React, { useMemo, useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import { FilterSidebar } from './FilterSidebar';
import { SlidersHorizontal, PackageOpen, RotateCcw } from 'lucide-react';

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

        // Search filter
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchBrand && !matchCategory && !matchTags) {
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
        if (filters.sortBy === 'price-low') return a.price - b.price;
        if (filters.sortBy === 'price-high') return b.price - a.price;
        if (filters.sortBy === 'rating') return b.rating - a.rating;
        if (filters.sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        // default featured
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, filters]);

  return (
    <section className="space-y-6">
      {/* Top Bar with count and sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {filters.category === 'All' ? 'Explore Catalog' : `${filters.category} Collection`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Showing <strong className="text-slate-900 dark:text-white">{filteredProducts.length}</strong> of {products.length} handpicked items
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-600" />
            <span>Filters</span>
          </button>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs text-slate-600 dark:text-slate-400 font-medium hidden sm:inline">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: e.target.value as any,
                }))
              }
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer shadow-sm"
            >
              <option value="featured">Featured & Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>
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
                  Try adjusting your search query, increasing the maximum price range, or clearing filters.
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
