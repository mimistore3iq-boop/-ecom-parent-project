import React, { useRef, useEffect, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Eye, ShoppingCart, Clock } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { getScrollKey, navigateWithScrollSave } from '../utils/scrollRestore';

export const ProductCard = ({ product, onAddToCart, categoryId = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollKey = getScrollKey(location.pathname, location.search, location.hash);

  const goToProduct = () => {
    const carouselContext = categoryId ? { categoryId, productId: product.id } : null;
    navigateWithScrollSave(navigate, `/product/${product.id}`, scrollKey, carouselContext);
  };

  const discountPct = Math.round(Number(product.discount_percentage ?? product.discount ?? 0));

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer border border-gray-100 h-full flex flex-col relative transform hover:-translate-y-2"
      onClick={goToProduct}
      style={{ animation: 'cardAppear 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards' }}
    >
      {/* شارة الوقت المتبقّي */}
      {product.is_on_sale && product.time_left > 0 && (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-md z-30 flex items-center gap-1">
          <Clock className="h-3 w-3" strokeWidth={2.5} />
          {Math.ceil(product.time_left / 86400)} يوم
        </div>
      )}

      {/* صورة المنتج */}
      <div className={`relative h-44 sm:h-56 md:h-64 bg-white overflow-hidden shrink-0 border-b border-gray-50 transition-opacity duration-300 ${product.stock === 0 ? 'opacity-40' : 'opacity-100'}`}>
        <img
          src={product.image || product.main_image_url || '/placeholder-product.png'}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 p-3"
          loading="lazy"
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://media.voroiq.com/placeholder-product.png'; }}
        />

        {(product.is_on_sale || discountPct > 0) && discountPct > 0 && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg z-20 shadow-md">
            {discountPct}% خصم
          </div>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/5 backdrop-blur-[0.5px] flex items-center justify-center z-20">
            <span className="text-white font-extrabold text-[12px] bg-gray-800/90 px-3 py-1.5 rounded-xl shadow-lg border border-gray-700 uppercase tracking-wider">نفد المخزون</span>
          </div>
        )}
      </div>

      {/* معلومات المنتج */}
      <div className="p-3 sm:p-4 bg-white flex-1 flex flex-col justify-between">
        <div className="mb-3">
          <h4 className="font-bold text-[13px] sm:text-sm text-gray-800 line-clamp-2 text-right leading-relaxed min-h-[2.5rem]">
            {product.name}
          </h4>

          <div className="flex flex-col items-end mt-2">
            {product.is_on_sale ? (
              <>
                <span className="text-sm sm:text-base font-extrabold text-red-600 tracking-tight">
                  {formatCurrency(product.discounted_price || product.discount_price)}
                </span>
                <span className="text-[11px] text-gray-400 line-through opacity-70">
                  {formatCurrency(product.price)}
                </span>
              </>
            ) : (
              <span className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* أزرار الإجراء */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={(e) => { e.stopPropagation(); goToProduct(); }}
            className="flex-1 py-2.5 rounded-xl font-bold transition-all text-[11px] flex items-center justify-center gap-1 bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 active:scale-95 shadow-sm"
          >
            <Eye className="h-4 w-4" strokeWidth={2} />
            <span>عرض</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); if (product.stock > 0) onAddToCart(product); }}
            disabled={product.stock === 0}
            className={`flex-[1.5] py-2.5 rounded-xl font-bold transition-all text-[11px] flex items-center justify-center gap-1 shadow-md ${
              product.stock > 0
                ? 'bg-primary-900 text-white hover:bg-black active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="h-4 w-4" strokeWidth={2} />
            <span>السلة</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const CategoryProductsSection = ({ category, products, onAddToCart, onViewDetails }) => {
  const gridRef = useRef(null);

  // عجلة الماوس تحرّك الكاروسيل أفقياً عند التأشير عليه (مع دعم RTL)
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (el.scrollWidth <= el.clientWidth) return;            // لا يوجد فائض للتمرير
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;     // تمرير أفقي أصلاً (تاتش‌باد)
      const isRTL = getComputedStyle(el).direction === 'rtl';
      const before = el.scrollLeft;
      el.scrollLeft += (isRTL ? -1 : 1) * e.deltaY;
      if (el.scrollLeft !== before) e.preventDefault();        // امنع تمرير الصفحة فقط عند تحرّك الكاروسيل فعلاً
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const scrollByPage = (dir) => {
    const el = gridRef.current;
    if (!el) return;
    // صفحة كاملة بالضبط — مع scroll-snap يستقرّ العرض على بداية بطاقة دائماً
    el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
  };

  if (!products || products.length === 0) return null;

  return (
    <>
    <style>{`
      @keyframes cardAppear { from { opacity: 0; transform: translateY(10px);} to { opacity: 1; transform: translateY(0);} }
      .voro-carousel {
        display: flex;
        gap: 12px;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        touch-action: pan-x pan-y;
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .voro-carousel > * { scroll-snap-align: start; }
      .voro-carousel::-webkit-scrollbar { display: none; }
      /* الموبايل: بطاقتان بالضبط، ونقطة التقاط كل بطاقتين حتى ينتقل العرض
         زوجاً زوجاً فلا يظهر جزء من بطاقة ثالثة */
      @media (max-width: 767px) {
        .voro-carousel > * { scroll-snap-align: none; }
        .voro-carousel > *:nth-child(odd) { scroll-snap-align: start; }
      }
    `}</style>
    <section className="py-6 bg-white border-b border-gray-100">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 pr-2">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800">{category.name}</h3>
          <Link
            to={`/categories/${category.id}`}
            className="text-gray-500 hover:text-primary-900 font-medium text-xs md:text-sm flex items-center gap-1 transition-colors"
          >
            عرض الكل
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>

        <div className="relative group/carousel">
          {/* التالي (يسار في RTL) */}
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            aria-label="التالي"
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 text-gray-700 hover:bg-primary-900 hover:text-white transition-all opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>
          {/* السابق (يمين في RTL) */}
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            aria-label="السابق"
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-gray-100 text-gray-700 hover:bg-primary-900 hover:text-white transition-all opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
          </button>

          <div
            ref={gridRef}
            data-category-carousel={category.id}
            className="voro-carousel overflow-x-auto pb-4"
          >
            {products.map((product) => (
              <div
                key={product.id}
                data-product-id={product.id}
                className="flex-shrink-0 w-[calc((100%-12px)/2)] md:w-[calc((100%-24px)/3)] lg:w-[calc((100%-36px)/4)] xl:w-[calc((100%-48px)/5)] 2xl:w-[calc((100%-60px)/6)] transition-transform duration-300 active:scale-[0.98]"
              >
                <ProductCard product={product} onAddToCart={onAddToCart} categoryId={category.id} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

CategoryProductsSection.ProductCard = ProductCard;

const MemoizedCategoryProductsSection = memo(CategoryProductsSection);
MemoizedCategoryProductsSection.ProductCard = ProductCard;

export default MemoizedCategoryProductsSection;
