import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, ChevronDown, ChevronLeft, X, Tag, User, LogOut, LayoutDashboard } from 'lucide-react';
import { api, endpoints } from '../api';
import { formatCurrency } from '../utils/currency';
import { getScrollKey, navigateWithScrollSave } from '../utils/scrollRestore';
import { getCachedHomeData, setCachedHomeData } from '../utils/homeCache';
import voroLogo from '../assets/voro_logo.png';

const readCartCount = () => {
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  } catch {
    return 0;
  }
};

/**
 * هيدر موحّد يظهر بنفس الشكل والسلوك في كل صفحات المتجر:
 * لوجو + نافيگيشن (ديسكتوب) + بحث دائم + سلة. يدير بياناته وحالته داخلياً
 * (فئات/منتجات/عدّاد السلة) فلا تحتاج أي صفحة تمرير شيء له سوى user/setUser.
 */
const SiteHeader = ({ user, setUser, onSelectCategory }) => {
  const [categories, setCategories] = useState(() => getCachedHomeData()?.categories || []);
  const [products, setProducts] = useState(() => getCachedHomeData()?.products || []);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(readCartCount);
  const [badgePop, setBadgePop] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const scrollKey = getScrollKey(location.pathname, location.search, location.hash);

  // تحميل الأقسام والمنتجات (من الذاكرة المؤقّتة المشتركة، أو من الشبكة إن كانت فارغة)
  // — تلزم لقائمة "الفئات" والبحث بكل صفحة، حتى لو المستخدم دخل مباشرة بغير الرئيسية
  useEffect(() => {
    const cached = getCachedHomeData();
    if (cached?.categories?.length && cached?.products?.length) return;

    (async () => {
      try {
        const needCats = !cached?.categories?.length;
        const needProds = !cached?.products?.length;
        const [catsRes, prodsRes] = await Promise.all([
          needCats ? api.get(endpoints.categories) : Promise.resolve(null),
          needProds ? api.get(endpoints.products) : Promise.resolve(null),
        ]);

        const newCats = catsRes
          ? (Array.isArray(catsRes.data) ? catsRes.data : catsRes.data?.results || [])
          : cached?.categories || [];

        const newProds = prodsRes
          ? (Array.isArray(prodsRes.data) ? prodsRes.data : prodsRes.data?.results || []).map((p) => ({
              ...p,
              image: p.image || p.main_image_url || p.main_image || null,
              price: Number(p.price || 0),
              discounted_price: p.discounted_price
                ? Number(p.discounted_price)
                : (p.discount_price ? Number(p.discount_price) : Number(p.price || 0)),
            }))
          : cached?.products || [];

        if (newCats.length) setCategories(newCats);
        if (newProds.length) setProducts(newProds);
        setCachedHomeData(newProds.length ? newProds : cached?.products, newCats.length ? newCats : cached?.categories);
      } catch (error) {
        console.error('SiteHeader: failed to load categories/products', error);
      }
    })();
  }, []);

  // عدّاد السلة — يقرأ من التخزين المحلي ويتحدّث فوراً مع أي تغيير بالسلة بأي صفحة.
  // عند تغيّر العدد تُطلَق نبضة لطيفة على الشارة (توقيع الهيدر البصري).
  useEffect(() => {
    const refresh = () => {
      setCartCount((prev) => {
        const next = readCartCount();
        if (next !== prev) {
          setBadgePop(true);
          setTimeout(() => setBadgePop(false), 340);
        }
        return next;
      });
    };
    window.addEventListener('storage', refresh);
    window.addEventListener('cart-updated', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('cart-updated', refresh);
    };
  }, []);

  // إغلاق قائمة الفئات: بالنقر خارجها أو بمفتاح Escape
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event) => {
      if (!event.target.closest('[data-voro-menu]')) setIsMenuOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isMenuOpen]);

  // إغلاق قائمة الحساب: بالنقر خارجها أو بمفتاح Escape
  useEffect(() => {
    if (!isAccountOpen) return;
    const onDown = (event) => {
      if (!event.target.closest('[data-voro-account]')) setIsAccountOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setIsAccountOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isAccountOpen]);

  // الهيدر ثابت (sticky) دائماً؛ يظهر له ظل خفيف فقط بعد بدء التمرير
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goToProduct = (productId) => {
    navigateWithScrollSave(navigate, `/product/${productId}`, scrollKey);
    setSearchTerm('');
  };

  const handleCategoryClick = (id) => {
    setIsMenuOpen(false);
    if (onSelectCategory) {
      onSelectCategory(id);
    } else {
      navigate(id ? `/categories/${id}` : '/categories');
    }
  };

  const handleCartClick = () => {
    // الرئيسية وتفاصيل المنتج تملكان نافذة سلة محلية (تستمع لهذا الحدث)؛
    // بقية الصفحات تُفتح لها السلة عبر التوجّه للرئيسية
    const hasLocalCartModal = location.pathname === '/' || location.pathname.startsWith('/product/');
    if (hasLocalCartModal) {
      window.dispatchEvent(new CustomEvent('voro:open-cart'));
    } else {
      navigate('/?openCart=1');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser?.(null);
    navigate('/login');
  };

  const filteredProducts = searchTerm
    ? products.filter((product) =>
        (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  // الرابط النشط — يُبقي الخط السفلي ظاهراً للصفحة الحالية
  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  // حقل البحث يظهر في الصفحة الرئيسية فقط
  const isHome = location.pathname === '/';

  // قرص تنقّل واحد داخل المجموعة المقسّمة — النشط أبيض بظل خفيف، والبقية رمادي هادئ
  const navPill = (active) =>
    `px-4 h-9 inline-flex items-center gap-1 rounded-full text-[14px] font-medium whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
      active ? 'bg-white text-gray-900 shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
    }`;

  return (
    <div className="sticky top-0 z-40">
      <header className={`relative bg-white/95 backdrop-blur-md border-b transition-shadow duration-300 ${scrolled ? 'shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] border-gray-100' : 'border-gray-100/70'}`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 md:gap-6 h-16 lg:h-[72px]">
            {/* النافيگيشن + البحث — مجموعة واحدة مدموجة (segmented) بالوسط:
                الرئيسية · العروض · الفئات، ثم حقل البحث مدموج معها بنفس الحاوية */}
            <nav className="hidden lg:flex flex-1 items-center justify-center order-2">
              <div className="flex items-center gap-1 bg-gray-100/80 rounded-full p-1">
                <Link to="/" className={navPill(isActive('/'))}>
                  الرئيسية
                </Link>
                <Link to="/offers" className={navPill(isActive('/offers'))}>
                  العروض
                </Link>
                <div className="relative" data-voro-menu>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-expanded={isMenuOpen}
                    className={navPill(isMenuOpen || isActive('/categories'))}
                  >
                    المنتجات
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
                  </button>
                </div>

                {/* حقل البحث — مدموج داخل نفس المجموعة، في الرئيسية فقط */}
                {isHome && (
                  <>
                    <span className="mx-1 w-px h-5 bg-gray-300/70" aria-hidden="true" />
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="ابحث عن منتج..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-9 w-44 xl:w-56 pr-9 pl-3.5 bg-white/70 rounded-full text-[13px] text-gray-800 placeholder:text-gray-400 outline-none transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus:bg-white focus:w-52 xl:focus:w-64 focus:shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" strokeWidth={2} />
                      </div>
                      {searchTerm && (
                        <div className="voro-fade-in absolute top-full right-0 mt-2.5 w-80 bg-white rounded-2xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)] border border-gray-100 z-50 overflow-hidden max-h-96 overflow-y-auto">
                          {filteredProducts.slice(0, 6).map((product) => (
                            <button
                              key={product.id}
                              onClick={() => goToProduct(product.id)}
                              className="w-full text-right p-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors"
                            >
                              <div className="w-12 h-12 shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                                <img src={product.image} alt="" className="w-full h-full object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-[13px] text-gray-800 truncate">{product.name}</div>
                                <div className="text-black font-bold text-sm mt-0.5">{formatCurrency(product.discounted_price || product.price)}</div>
                              </div>
                            </button>
                          ))}
                          {filteredProducts.length === 0 && (
                            <div className="p-5 text-center text-gray-400 text-sm">لا توجد نتائج</div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </nav>

            {/* الأزرار — أقصى اليمين في RTL: السلة ثم الحساب/الدخول */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0 order-1">
              {/* السلة — التوقيع البصري للهيدر (أقصى اليمين في RTL) */}
              <button
                onClick={handleCartClick}
                aria-label="السلة"
                className="relative h-10 w-10 shrink-0 flex items-center justify-center rounded-full text-gray-800 hover:bg-gray-100 transition-colors duration-300"
              >
                <ShoppingCart className="h-[22px] w-[22px]" strokeWidth={1.75} />
                {cartCount > 0 && (
                  <span className={`absolute -top-0.5 -right-0.5 min-w-[19px] h-[19px] px-1 bg-black text-white text-[11px] leading-none rounded-full flex items-center justify-center font-semibold shadow-sm ${badgePop ? 'voro-badge-pop' : ''}`}>
                    {cartCount}
                  </span>
                )}
              </button>

              {/* الحساب — ديسكتوب فقط (على الموبايل ينتقل لتبويب "الحساب" بالشريط السفلي).
                  زر أيقونة دائري متطابق مع السلة يفتح قائمة نظيفة: الهوية + لوحة الإدارة + خروج */}
              {user ? (
                <div className="hidden lg:block relative" data-voro-account>
                  <button
                    onClick={() => setIsAccountOpen((v) => !v)}
                    aria-expanded={isAccountOpen}
                    aria-label="حسابي"
                    className={`h-10 w-10 flex items-center justify-center rounded-full transition-colors duration-300 ${isAccountOpen ? 'bg-gray-100 text-black' : 'text-gray-800 hover:bg-gray-100'}`}
                  >
                    <User className="h-[21px] w-[21px]" strokeWidth={1.75} />
                  </button>
                  {isAccountOpen && (
                    <div className="voro-fade-in absolute right-0 top-full mt-2.5 w-60 bg-white rounded-2xl shadow-[0_16px_44px_-16px_rgba(0,0,0,0.22)] border border-gray-100 overflow-hidden z-50">
                      <div className="px-4 py-3.5 border-b border-gray-50">
                        <p className="text-[12px] text-gray-400">مرحباً</p>
                        <p className="text-sm font-bold text-gray-900 truncate" dir="ltr">{user.name || user.phone}</p>
                      </div>
                      {user.is_admin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboard className="h-[18px] w-[18px] text-gray-400" strokeWidth={1.75} />
                          لوحة الإدارة
                        </Link>
                      )}
                      <button
                        onClick={() => { setIsAccountOpen(false); logout(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 border-t border-gray-50 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden lg:inline-flex h-10 items-center px-[18px] rounded-[9px] border border-gray-300 text-sm font-medium text-gray-900 hover:border-black hover:bg-black hover:text-white transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                >
                  تسجيل الدخول
                </Link>
              )}
            </div>

            {/* اللوجو — أقصى اليسار في RTL. على الموبايل ms-auto يدفعه لليسار؛
                على الديسكتوب المجموعة الوسطى (flex-1) تتكفّل بالتوزيع فنلغي الهامش (lg:ms-0) */}
            <Link to="/" className="flex items-center shrink-0 order-4 ms-auto lg:ms-0" aria-label="voro">
              <img src={voroLogo} alt="voro" className="h-9 md:h-10 w-auto select-none" draggable="false" />
            </Link>
          </div>

          {/* الـ Mega Menu — ينزلق مباشرة أسفل الهيدر، بمحاذاة الحاوية */}
          {isMenuOpen && (
            <div data-voro-menu className="hidden lg:block absolute right-0 left-0 top-full">
              <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="voro-menu-in w-full max-w-[1100px] bg-white rounded-b-2xl shadow-[0_18px_50px_-16px_rgba(0,0,0,0.22)] border border-t-0 border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-50">
                    <h4 className="text-[15px] font-bold text-gray-900">تصفّح الأقسام</h4>
                    <button
                      onClick={() => handleCategoryClick('')}
                      className="group text-sm font-medium text-gray-500 hover:text-black transition-colors flex items-center gap-1.5"
                    >
                      كل المنتجات
                      <ChevronLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" strokeWidth={2.5} />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-x-6 gap-y-1 max-h-[56vh] overflow-y-auto">
                    {categories.filter((c) => !c.parent).map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className="group flex items-center gap-3 min-h-[46px] px-3 rounded-[9px] hover:bg-[#f5f6f7] transition-colors duration-200 text-right"
                      >
                        <span className="relative h-8 w-8 shrink-0 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-colors duration-300">
                          <Tag className="h-4 w-4" strokeWidth={2} />
                          {(category.image_url || category.image) && (
                            <img src={category.image_url || category.image} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="absolute inset-0 h-full w-full object-cover" />
                          )}
                        </span>
                        <span className="text-[13px] font-medium text-gray-700 group-hover:text-black line-clamp-1 transition-colors">{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* تعتيم خفيف جداً للصفحة أسفل القائمة — يعمّق الإحساس بالطبقة */}
              <div
                className="voro-scrim fixed inset-0 top-[72px] -z-10 bg-black/5"
                aria-hidden="true"
                onClick={() => setIsMenuOpen(false)}
              />
            </div>
          )}

          {/* شريط البحث للموبايل — في الصفحة الرئيسية فقط */}
          {isHome && (
          <div className="md:hidden pb-3 px-1">
            <div className="relative">
              <input
                type="text"
                id="mobile-search-input"
                placeholder="ابحث عن منتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pr-11 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-sm shadow-inner"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" strokeWidth={2} />
              </div>
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <X className="h-4 w-4 text-gray-400" strokeWidth={2.5} />
                </button>
              )}
            </div>

            {searchTerm && (
              <div className="mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-[60vh] overflow-y-auto z-50">
                <div className="bg-primary-50 px-4 py-2 text-[10px] font-bold text-primary-600 uppercase tracking-wider">نتائج البحث</div>
                {filteredProducts.slice(0, 10).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => goToProduct(product.id)}
                    className="w-full text-right p-3 hover:bg-primary-50/50 flex items-center gap-3 border-b border-gray-50 last:border-0 active:bg-primary-100 transition-colors"
                  >
                    <div className="w-12 h-12 shrink-0 bg-white rounded-xl overflow-hidden border border-gray-100 p-1">
                      <img src={product.image} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[13px] text-gray-800 truncate">{product.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-primary-600 font-bold">{formatCurrency(product.discounted_price || product.price)}</span>
                      </div>
                    </div>
                    <div className="text-gray-300">
                      <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                    </div>
                  </button>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="p-8 text-center bg-gray-50">
                    <p className="text-gray-400 text-xs">لا توجد منتجات تطابق بحثك</p>
                  </div>
                )}
              </div>
            )}
          </div>
          )}
        </div>
      </header>
    </div>
  );
};

export default SiteHeader;
