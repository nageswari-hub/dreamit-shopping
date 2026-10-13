import React from 'react';
import { ShopProvider } from './context/ShopContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryNav } from './components/CategoryNav';
import { Toast } from './components/Toast';

const StoreContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <HeroBanner />
      <CategoryNav />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full" id="product-catalog">
        <div className="p-8 text-center text-slate-500">
          Product Catalog & Filters Loading in Milestone 4...
        </div>
      </main>
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <StoreContent />
    </ShopProvider>
  );
}
