import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';

const CategoryProductsSection = ({ 
  category, 
  products, 
  onAddToCart,
  onViewDetails 
}) => {
  const containerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const ITEMS_PER_ROW = 2;
  const ROWS_PER_PAGE = 2;
  const ITEMS_PER_PAGE = ITEMS_PER_ROW * ROWS_PER_PAGE;
  
  const pages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const currentPageProducts = products.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    setTouchEnd(e.changedTouches[0].clientX);
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeThreshold = 50;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // سحب من اليمين إلى اليسار = الصفحة التالية
        goToNextPage();
      } else {
        // سحب من اليسار إلى اليمين = الصفحة السابقة
        goToPreviousPage();
      }
    }
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % pages);
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => (prev - 1 + pages) % pages);
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Header */}
        <div className="flex items-center justify-between mb-6 pr-2">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-gray-600 text-sm mt-1">{category.description}</p>
            )}
          </div>
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
        <div
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="touch-pan-y"
        >
          {/* Products Grid (2x2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 transition-opacity duration-500">
            {currentPageProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer"
              >
                {/* Product Image */}
                <div className="relative h-48 md:h-64 bg-gray-100 overflow-hidden">
                  <img
                    src={product.image || product.main_image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onClick={() => onViewDetails(product)}
                  />

                  {/* Stock Indicator */}
                  {product.stock > 0 && product.stock <= 5 && (
                    <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      متبقي {product.stock}
                    </div>
                  )}

                  {/* Out of Stock Overlay */}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-white font-bold text-lg block mb-1">
                          نفد المخزون
                        </span>
                        <span className="text-white/80 text-xs">غير متوفر حالياً</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3 md:p-4 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
                  {/* Product Name */}
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm md:text-base text-gray-800 line-clamp-2 flex-1 pr-2">
                      {product.name}
                    </h4>
                    {product.brand && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full whitespace-nowrap ml-2">
                        {product.brand}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                    {product.discount_percentage > 0 ? (
                      <div className="flex items-center space-x-2 space-x-reverse flex-1">
                        <span className="text-base md:text-lg font-bold text-indigo-600">
                          {formatCurrency(product.discounted_price)}
                        </span>
                        <span className="text-xs text-gray-500 line-through">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-base md:text-lg font-bold text-gray-800">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <button
                    onClick={() => onAddToCart(product)}
                    disabled={product.stock === 0}
                    className={`w-full py-2.5 rounded-lg font-semibold transition-all text-sm ${
                      product.stock > 0
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg active:scale-95'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <svg
                      className="h-4 w-4 inline-block ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8"
                      />
                    </svg>
                    إضافة للسلة
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              {Array.from({ length: pages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToPage(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    index === currentPage
                      ? 'bg-indigo-600 w-8'
                      : 'bg-gray-300 w-2.5 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryProductsSection;