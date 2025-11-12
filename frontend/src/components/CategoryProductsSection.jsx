import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';

const CategoryProductsSection = ({ 
  category, 
  products, 
  onAddToCart,
  onViewDetails 
}) => {
  const gridRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [dragDirection, setDragDirection] = useState(null);

  const ITEMS_PER_PAGE = 2;
  
  const pages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const currentPageProducts = products.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const goToNextPage = () => {
    if (currentPage < pages - 1) {
      setDragDirection('right');
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setTimeout(() => setDragDirection(null), 50);
      }, 10);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setDragDirection('left');
      setTimeout(() => {
        setCurrentPage((prev) => prev - 1);
        setTimeout(() => setDragDirection(null), 50);
      }, 10);
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  // Handle Touch Start
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  // Handle Touch End
  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;
    const SWIPE_THRESHOLD = 30; // أقل = أسرع تفاعل

    if (distance < -SWIPE_THRESHOLD) {
      // Swiped right (من اليسار لليمين) - next page
      goToNextPage();
    } else if (distance > SWIPE_THRESHOLD) {
      // Swiped left (من اليمين لليسار) - previous page
      goToPreviousPage();
    }
    
    setTouchStart(null);
  };

  // Handle Mouse Down
  const handleMouseDown = (e) => {
    setDragStart(e.clientX);
  };

  // Handle Mouse Up
  const handleMouseUp = (e) => {
    if (!dragStart) return;
    
    const distance = dragStart - e.clientX;
    const DRAG_THRESHOLD = 30; // أقل = أسرع تفاعل

    if (distance < -DRAG_THRESHOLD) {
      // Dragged right (من اليسار لليمين) - next page
      goToNextPage();
    } else if (distance > DRAG_THRESHOLD) {
      // Dragged left (من اليمين لليسار) - previous page
      goToPreviousPage();
    }
    
    setDragStart(null);
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-white border-b border-gray-100">
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
        <div>
          {/* Products Grid (2 Columns) */}
          <div 
            ref={gridRef}
            onTouchStart={handleTouchStart} 
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`grid grid-cols-2 gap-3 md:gap-6 select-none ${dragStart ? 'cursor-grabbing opacity-75' : 'cursor-grab'} ${
              dragDirection === 'left' ? 'animate-slideOutRight' : dragDirection === 'right' ? 'animate-slideOutLeft' : ''
            } transition-all duration-400`}
          >
            {currentPageProducts.map((product, idx) => (
              <div
                key={product.id}
                className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 hover:scale-105 group cursor-pointer ${
                  dragDirection === 'left' ? 'animate-slideInRight' : dragDirection === 'right' ? 'animate-slideInLeft' : 'animate-fadeIn'
                } ${idx === 0 ? 'animation-delay-0' : 'animation-delay-100'}`}
              >
                {/* Product Image */}
                <div className="relative h-48 sm:h-56 md:h-80 bg-gray-100 overflow-hidden">
                  <img
                    src={product.image || product.main_image_url}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    onClick={() => onViewDetails(product)}
                  />

                  {/* Discount Badge - Top Left */}
                  {product.discount_percentage > 0 && (
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-gradient-to-br from-red-500 to-red-600 text-white w-9 h-9 sm:w-11 sm:h-11 rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow">
                      <span>{product.discount_percentage}%</span>
                    </div>
                  )}

                  {/* Stock Indicator - Top Right */}
                  {product.stock > 0 && product.stock <= 5 && (
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center gap-1 hover:shadow-xl transition-shadow">
                      <svg
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"
                        />
                      </svg>
                      <span>متبقي {product.stock}</span>
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
                <div className="p-2 sm:p-3 md:p-4 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
                  {/* Product Name */}
                  <div className="flex justify-between items-start mb-1 sm:mb-2">
                    <h4 className="font-bold text-xs sm:text-sm md:text-base text-gray-800 line-clamp-2 flex-1 pr-1">
                      {product.name}
                    </h4>
                    {product.brand && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded-full whitespace-nowrap ml-1">
                        {product.brand}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-2 pb-1 sm:pb-2 border-b border-gray-100">
                    {product.discount_percentage > 0 ? (
                      <div className="flex items-center space-x-1 sm:space-x-2 space-x-reverse flex-1">
                        <span className="text-xs sm:text-sm md:text-lg font-bold text-indigo-600">
                          {formatCurrency(product.discounted_price)}
                        </span>
                        <span className="text-xs text-gray-500 line-through">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs sm:text-sm md:text-lg font-bold text-gray-800">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-row-reverse">
                    {/* View Details Button - Left */}
                    <button
                      onClick={() => onViewDetails(product)}
                      className="flex-1 py-1.5 sm:py-2 md:py-2.5 rounded-lg font-semibold transition-all text-xs sm:text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 active:scale-95 border border-gray-300"
                    >
                      <svg
                        className="h-3 w-3 sm:h-4 sm:w-4 inline-block ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      عرض
                    </button>

                    {/* Add to Cart Button - Right */}
                    <button
                      onClick={() => onAddToCart(product)}
                      disabled={product.stock === 0}
                      className={`flex-1 py-1.5 sm:py-2 md:py-2.5 rounded-lg font-semibold transition-all text-xs sm:text-sm ${
                        product.stock > 0
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg active:scale-95'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <svg
                        className="h-3 w-3 sm:h-4 sm:w-4 inline-block ml-1"
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
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-1.5 mt-6 sm:mt-8">
              {Array.from({ length: pages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToPage(index)}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentPage
                      ? 'bg-indigo-600 w-8 h-2'
                      : 'bg-gray-300 w-2 h-2 hover:bg-gray-400'
                  }`}
                  aria-label={`انتقل إلى الصفحة ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideOutLeft {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-40px);
          }
        }

        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(40px);
          }
        }

        :global(.animate-fadeIn) {
          animation: fadeIn 0.5s ease-out forwards;
        }

        :global(.animate-slideInLeft) {
          animation: slideInLeft 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        :global(.animate-slideInRight) {
          animation: slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        :global(.animate-slideOutLeft) {
          animation: slideOutLeft 0.3s ease-in forwards;
        }

        :global(.animate-slideOutRight) {
          animation: slideOutRight 0.3s ease-in forwards;
        }

        :global(.animation-delay-0) {
          animation-delay: 0ms;
        }

        :global(.animation-delay-100) {
          animation-delay: 100ms;
        }

        :global(.transition-all) {
          transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </section>
  );
};

export default CategoryProductsSection;