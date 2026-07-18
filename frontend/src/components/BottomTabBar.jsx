import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Percent, User } from 'lucide-react';

const TABS = [
  { to: '/', label: 'الرئيسية', Icon: Home, match: (path) => path === '/' },
  { to: '/categories', label: 'المتجر', Icon: ShoppingBag, match: (path) => path.startsWith('/categories') },
  { to: '/offers', label: 'العروض', Icon: Percent, match: (path) => path.startsWith('/offers') },
  { to: '/login', label: 'الحساب', Icon: User, match: (path) => path.startsWith('/login') },
];

/**
 * شريط تبويب سفلي بأسلوب تطبيقات الموبايل — للشاشات الصغيرة فقط (lg:hidden).
 * يبقى واحداً في كل صفحات المتجر الرئيسية.
 */
const BottomTabBar = () => {
  const { pathname } = useLocation();

  return (
    <nav
      dir="rtl"
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-100 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-4">
        {TABS.map(({ to, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center gap-0.5 py-2.5 min-h-[56px]"
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className={`h-6 w-6 ${active ? 'text-primary-900' : 'text-gray-400'}`}
                strokeWidth={active ? 2.25 : 1.75}
              />
              <span className={`text-[11px] ${active ? 'font-bold text-primary-900' : 'font-medium text-gray-400'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
