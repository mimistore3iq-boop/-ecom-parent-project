import React, { useRef, memo } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';

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
    <section className="py-8 bg-white border-b border-gray-100 vertical-scroll-fix">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Header */}
        <div className="flex items-center justify-between mb-6 pr-2">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
            {category.name}
          </h3>
          <Link
            to={`/categories/${category.id}`}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm md:text-base flex items-center gap-2 whitespace-nowrap"
          >
            عرض الكل
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* Products Grid Container */}
        <div className="relative">
          {/* Scrollable Container */}
          <div 
            ref={gridRef}
            className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory hide-scrollbar horizontal-scroll-fix"
            style={{ 
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              overscrollBehaviorX: 'contain',
              scrollPadding: '0 1rem',
              scrollBehavior: 'smooth'
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[75%] md:w-[35%] snap-center first:mr-4 last:ml-4"
                style={{ contentVisibility: 'auto', containIntrinsicSize: '300px 400px' }}
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100 h-full flex flex-col relative">
                  {/* Time Left Badge - Top Left */}
                  {product.is_on_sale && product.time_left > 0 && (
                    <div 
                      className="absolute top-3 left-3 bg-green-500/90 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold shadow-lg z-30 flex items-center gap-1 animate-pulse"
                      style={{ willChange: 'transform' }}
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      باقي {Math.ceil(product.time_left / 86400)} يوم
                    </div>
                  )}

                  {/* Product Image Wrapper */}
                  <div className="relative h-48 sm:h-56 md:h-72 bg-white overflow-hidden shrink-0">
                    <img
                      src={product.image || product.main_image_url}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 p-2"
                      onClick={() => onViewDetails(product)}
                      loading="lazy"
                      style={{ viewTransitionName: `product-image-${product.id}` }}
                    />

                    {/* Discount Badge - Corner Ribbon Style */}
                    {product.discount_percentage > 0 && (
                      <div className="absolute top-0 right-0 overflow-hidden w-16 h-16 z-20">
                        <div className="absolute top-2 right-[-24px] bg-red-600 text-white text-[10px] font-bold py-1 w-24 text-center transform rotate-45 shadow-sm">
                          {product.discount_percentage}% خصم
                        </div>
                      </div>
                    )}

                    {/* Stock Indicator - Bottom Right */}
                    {product.stock > 0 && product.stock <= 5 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[9px] font-medium z-10">
                        متبقي {product.stock} فقط
                      </div>
                    )}

                    {/* Out of Stock Overlay */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-20">
                        <div className="text-center bg-white/80 p-3 rounded-xl shadow-lg border border-gray-100">
                          <span className="text-red-600 font-bold text-sm block mb-1">نفد المخزون</span>
                          <span className="text-gray-500 text-[10px]">غير متوفر حالياً</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3 sm:p-4 bg-white flex-1 flex flex-col justify-between">
                    <div>
                      {/* Product Name & Brand */}
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-sm sm:text-base text-gray-800 line-clamp-2 flex-1 pr-1 text-right">
                          {product.name}
                        </h4>
                        {product.brand && (
                          <span className="text-[10px] text-gray-400 font-medium">
                            {product.brand}
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-4">
                        {product.is_on_sale ? (
                          <div className="flex flex-col items-end flex-1">
                            <span className="text-base sm:text-xl font-bold text-red-600">
                              {formatCurrency(product.discounted_price || product.discount_price)}
                            </span>
                            <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                              {formatCurrency(product.price)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-end flex-1">
                            <span className="text-base sm:text-xl font-bold text-gray-800">
                              {formatCurrency(product.price)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-row-reverse mt-auto">
                      <button
                        onClick={() => onViewDetails(product)}
                        className="flex-1 py-2 rounded-xl font-bold transition-all text-[10px] sm:text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-95 border border-gray-100 flex items-center justify-center gap-1"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>تفاصيل</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product);
                        }}
                        disabled={product.stock === 0}
                        className={`flex-[1.8] py-2 rounded-xl font-bold transition-all text-[10px] sm:text-xs flex items-center justify-center gap-1 shadow-sm ${
                          product.stock > 0
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:shadow-md active:scale-95'
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(CategoryProductsSection);
