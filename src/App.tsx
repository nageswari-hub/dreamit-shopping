import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryNav } from './components/CategoryNav';
import { ProductGrid } from './components/ProductGrid';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrdersView } from './components/OrdersView';
import { AdminDashboard } from './components/AdminDashboard';
import { Toast } from './components/Toast';

const StoreContent: React.FC = () => {
  const { activeTab } = useShop();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      {activeTab === 'shop' && (
        <>
          <HeroBanner />
          <CategoryNav />
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full" id="product-catalog">
            <ProductGrid />
          </main>
        </>
      )}

      {activeTab === 'orders' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <OrdersView />
        </main>
      )}

      {activeTab === 'admin' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <AdminDashboard />
        </main>
      )}

      <ProductModal />
      <CartDrawer />
      <WishlistDrawer />
      <CheckoutModal />
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
