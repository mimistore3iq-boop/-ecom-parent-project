import React, { useRef, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';

export const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer border border-gray-100 h-full flex flex-col relative transform hover:-translate-y-2"
      onClick={() => navigate(`/product/${product.id}`)}
      style={{ 
        animation: 'cardAppear 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards'
      }}
    >
      {/* Time Left Badge - Top Left */}
      {product.is_on_sale && product.time_left > 0 && (
        <div 
          className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-md z-30 flex items-center gap-1"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {Math.ceil(product.time_left / 86400)} يوم
        </div>
      )}

      {/* Product Image Wrapper */}
      <div className="relative h-44 sm:h-56 md:h-64 bg-white overflow-hidden shrink-0 border-b border-gray-50">
        <img
          src={product.image || product.main_image_url}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 p-3"
          loading="lazy"
        />

        {/* Discount Badge */}
        {product.discount_percentage > 0 && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-pink-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg z-20 shadow-md">
            {product.discount_percentage}% خصم
          </div>
        )}

        {/* Out of Stock Overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="text-red-600 font-extrabold text-[12px] bg-white/95 px-3 py-1.5 rounded-xl shadow-lg border border-red-100 uppercase tracking-wider">نفد المخزون</span>
          </div>
        )}
      </div>

      {/* Product Info */}
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

        {/* Action Buttons Row */}
        <div className="flex gap-2 mt-auto">
          {/* View Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product.id}`);
            }}
            className="flex-1 py-2 rounded-xl font-bold transition-all text-[11px] flex items-center justify-center gap-1 bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 active:scale-95 shadow-sm"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>عرض</span>
          </button>

          {/* Add to Cart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (product.stock > 0) onAddToCart(product);
            }}
            disabled={product.stock === 0}
            className={`flex-[1.5] py-2 rounded-xl font-bold transition-all text-[11px] flex items-center justify-center gap-1 shadow-md ${
              product.stock > 0
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-indigo-200 active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
            </svg>
            <span>السلة</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const CategoryProductsSection = ({ 
  category, 
  products, 
  onAddToCart,
  onViewDetails 
}) => {
  const gridRef = useRef(null);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <>
    <style>{`
      @keyframes cardAppear {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      
      .horizontal-scroll-fix {
        -webkit-overflow-scrolling: touch;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        touch-action: pan-x pan-y; /* تفعيل السحب الأفقي والعمودي معاً */
        display: flex;
        gap: 12px;
        padding-bottom: 15px;
      }
      .snap-center-item {
        scroll-snap-align: start;
        transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .snap-center-item:active {
        transform: scale(0.98);
      }
      .horizontal-scroll-fix::-webkit-scrollbar {
        display: none;
      }
    `}</style>
    <section className="py-6 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 pr-2">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800">
            {category.name}
          </h3>
          <Link
            to={`/categories/${category.id}`}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-xs md:text-sm flex items-center gap-1"
          >
            عرض الكل
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="relative">
          <div 
            ref={gridRef}
            className="flex overflow-x-auto gap-3 pb-4 hide-scrollbar horizontal-scroll-fix px-1"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[48.5%] sm:w-[40%] md:w-[28%] lg:w-[20%] snap-center-item"
              >
                <ProductCard product={product} onAddToCart={onAddToCart} />
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
