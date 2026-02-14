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
          className="absolute top-2 left-2 bg-red-500 text-white px-1.5 py-0.5 rounded-md text-[9px] font-bold shadow-sm z-30 flex items-center gap-1"
        >
          <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {Math.ceil(product.time_left / 86400)} يوم
        </div>
      )}

      {/* Product Image Wrapper */}
      <div className="relative h-36 sm:h-48 md:h-56 bg-white overflow-hidden shrink-0">
        <img
          src={product.image || product.main_image_url}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 p-2"
          loading="lazy"
        />

        {/* Discount Badge */}
        {product.discount_percentage > 0 && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md z-20 shadow-sm">
            {product.discount_percentage}% خصم
          </div>
        )}

        {/* Out of Stock Overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-20">
            <span className="text-red-600 font-bold text-[10px] bg-white/90 px-2 py-1 rounded-lg shadow-sm border border-red-100">نفد المخزون</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-2 sm:p-3 bg-white flex-1 flex flex-col justify-between">
        <div className="mb-2">
          <h4 className="font-bold text-[11px] sm:text-xs text-gray-800 line-clamp-2 text-right leading-tight min-h-[2rem]">
            {product.name}
          </h4>
          
          <div className="flex flex-col items-end mt-1">
            {product.is_on_sale ? (
              <>
                <span className="text-xs sm:text-sm font-bold text-red-600">
                  {formatCurrency(product.discounted_price || product.discount_price)}
                </span>
                <span className="text-[9px] text-gray-400 line-through">
                  {formatCurrency(product.price)}
                </span>
              </>
            ) : (
              <span className="text-xs sm:text-sm font-bold text-gray-800">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (product.stock > 0) onAddToCart(product);
          }}
          disabled={product.stock === 0}
          className={`w-full py-1.5 rounded-lg font-bold transition-all text-[10px] flex items-center justify-center gap-1 shadow-sm ${
            product.stock > 0
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
          </svg>
          <span>إضافة</span>
        </button>
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
        touch-action: pan-y; /* Allow vertical scrolling, container handles horizontal */
      }
      .snap-center-item {
        scroll-snap-align: start;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
            className="flex overflow-x-auto gap-3 pb-4 hide-scrollbar horizontal-scroll-fix"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[46%] sm:w-[40%] md:w-[28%] lg:w-[20%] snap-center-item"
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
