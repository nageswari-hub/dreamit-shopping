import React from 'react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { Heart, ShoppingBag, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    formatPrice,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setSelectedProduct,
  } = useShop();

  const isLiked = isInWishlist(product.id);
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <article
      aria-label={product.title}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1"
    >
      {/* Image Thumbnail Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800/60">
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent && (
            <span className="px-2.5 py-1 rounded-lg bg-rose-500 text-white text-[11px] font-extrabold shadow tracking-wide">
              -{discountPercent}% OFF
            </span>
          )}
          {product.isNew && (
            <span className="px-2.5 py-1 rounded-lg bg-brand-600 text-white text-[11px] font-bold shadow tracking-wide">
              NEW
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-black shadow tracking-wide">
              ONLY {product.stock} LEFT
            </span>
          )}
          {product.stock === 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-[10px] font-bold shadow tracking-wide">
              OUT OF STOCK
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all shadow-md z-10 cursor-pointer ${
            isLiked
              ? 'bg-rose-500 text-white shadow-rose-500/30'
              : 'bg-white/80 hover:bg-white text-slate-700 dark:bg-slate-900/80 dark:hover:bg-slate-900 dark:text-slate-200'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none p-4">
          <button
            onClick={() => setSelectedProduct(product)}
            className="pointer-events-auto px-4 py-2 rounded-xl bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white text-xs font-bold shadow-lg hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium mb-1.5">
            <span>{product.brand}</span>
            <span>{product.category}</span>
          </div>

          {/* Title */}
          <button
            type="button"
            onClick={() => setSelectedProduct(product)}
            className="text-left font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base line-clamp-2 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
          >
            {product.title}
          </button>

          {/* Colors swatch preview if available */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-3">
              {product.colors.slice(0, 4).map((color, idx) => (
                <div
                  key={idx}
                  title={color.name}
                  className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 shadow-xs"
                  style={{ backgroundColor: color.hex }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[10px] text-slate-400 font-medium">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
              Free Shipping Eligible
            </span>
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stock === 0}
            className={`p-2.5 sm:px-3 sm:py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
              product.stock === 0
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/20 hover:scale-105 active:scale-95'
            }`}
            title="Add to Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </article>
  );
};
