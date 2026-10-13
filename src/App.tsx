import { ShopProvider, useShop } from './context/ShopContext';

function StoreMain() {
  const { products, currency, formatPrice } = useShop();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 text-slate-800 dark:text-slate-100">
      <h1 className="text-3xl font-extrabold tracking-tight">ElevateStore Engine Active</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Loaded {products.length} products. Active currency: {currency} (e.g. {formatPrice(100)})
      </p>
    </div>
  );
}

export default function App() {
  return (
    <ShopProvider>
      <StoreMain />
    </ShopProvider>
  );
}
