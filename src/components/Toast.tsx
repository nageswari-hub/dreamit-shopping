import React from 'react';
import { useShop } from '../context/ShopContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { notification } = useShop();

  if (!notification) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-brand-500 flex-shrink-0" />,
  };

  const borderColors = {
    success: 'border-emerald-500/20 bg-emerald-50/90 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-100',
    error: 'border-rose-500/20 bg-rose-50/90 dark:bg-rose-950/80 text-rose-900 dark:text-rose-100',
    info: 'border-brand-500/20 bg-brand-50/90 dark:bg-brand-950/80 text-brand-900 dark:text-brand-100',
  };

  return (
    <aside
      aria-label="Notification alert"
      className="fixed bottom-6 right-6 z-50 transition-all duration-300 animate-bounce-once"
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md ${
          borderColors[notification.type]
        }`}
      >
        {icons[notification.type]}
        <p className="text-sm font-medium">{notification.message}</p>
      </div>
    </aside>
  );
};
