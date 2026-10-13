import React from 'react';
import { useShop } from '../context/ShopContext';
import {
  Grid,
  Laptop,
  Shirt,
  Coffee,
  Watch,
  Dumbbell,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'All', label: 'All Catalog', icon: Grid },
  { name: 'Electronics', label: 'Electronics', icon: Laptop },
  { name: 'Fashion', label: 'Fashion', icon: Shirt },
  { name: 'Accessories', label: 'Accessories', icon: Watch },
  { name: 'Home & Living', label: 'Home & Living', icon: Coffee },
  { name: 'Fitness', label: 'Fitness & Sports', icon: Dumbbell },
];

export const CategoryNav: React.FC = () => {
  const { filters, setFilters, products } = useShop();

  const getCategoryCount = (categoryName: string) => {
    if (categoryName === 'All') return products.length;
    return products.filter((p) => p.category === categoryName).length;
  };

  return (
    <div className="py-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = filters.category === cat.name;
            const count = getCategoryCount(cat.name);

            return (
              <button
                key={cat.name}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    category: cat.name,
                  }))
                }
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 ring-2 ring-brand-600/30'
                    : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
