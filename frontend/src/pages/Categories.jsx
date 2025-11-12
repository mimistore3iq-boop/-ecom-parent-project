import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, endpoints } from '../api';
import { formatCurrency } from '../utils/currency';
import Footer from '../components/Footer';

const Categories = ({ user }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const { id: categoryIdParam } = useParams();

  useEffect(() => {
    console.log('Component mounted, fetching initial data');
    fetchCategories();
    loadCart();
    // If category ID is in URL, set it
    if (categoryIdParam) {
      setSelectedCategory(parseInt(categoryIdParam));
    }
  }, [categoryIdParam]);
  
  // Add a manual refresh button in the UI
  const ManualRefreshButton = () => (
    <button
      onClick={refreshData}
      className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
      title="تحديث البيانات"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </button>
  );

  const refreshData = () => {
    console.log('Refreshing data...');
    // Reset selected category to force refresh
    setSelectedCategory(null);
    setCategories([]);
    setProducts([]);
    
    // Fetch fresh data
    setTimeout(() => {
      fetchCategories();
      if (selectedCategory) {
        fetchProductsByCategory(selectedCategory);
      }
    }, 100);
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoints.categories);
      const data = response.data;
      const list = Array.isArray(data) ? data : (data?.results || []);
      console.log('Fetched categories:', list);
      setCategories(list);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (categoryId) => {
    try {
      setLoading(true);
      console.log(`Fetching products for category ID: ${categoryId}`);
      
      // Try using the new endpoint first
      const response = await api.get(`${endpoints.productsByCategory}${categoryId}/products/`);
      const data = response.data;
      const list = Array.isArray(data) ? data : (data?.results || []);
      
      console.log(`Found ${list.length} products for category ${categoryId}`);

      // Normalize to match UI expectations
      const normalized = list.map((p) => {
        const discountPct = typeof p.discount_percentage === 'number' ? p.discount_percentage : (p.discount || 0);
        return {
          ...p,
          image: p.main_image_url || p.main_image || null,
          stock: typeof p.stock_quantity === 'number' ? p.stock_quantity : (p.is_in_stock ? 1 : 0),
          discount: discountPct,
          discount_percentage: discountPct,
          discounted_price: p.discounted_price || Math.round(p.price * (1 - discountPct / 100)),
        };
      });

      setProducts(normalized);
      console.log('Normalized products:', normalized);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const handleCartChange = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    let newCart;

    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }

    handleCartChange(newCart);

    // Show success message
    showNotification('تم إضافة المنتج للسلة بنجاح!');
  };

  const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 bounce-in';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading && categories.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <Link to="/" className="flex items-center space-x-2 space-x-reverse">
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold">
                  M
                </div>
                <span className="text-xl font-bold text-primary-600">MIMI STORE</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="relative">
                <Link to="/" className="p-2 text-gray-600 hover:text-primary-600 transition-colors">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
                  </svg>
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getCartItemCount()}
                    </span>
                  )}
                </Link>
              </div>
              {/* Refresh */}
              <ManualRefreshButton />
              {user && (
                <span className="text-gray-700">مرحباً، {user.phone}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">تصفح الفئات</h1>
          <p className="text-xl text-white opacity-90 max-w-2xl mx-auto">
            اكتشف منتجاتنا المميزة المصنفة حسب الفئات
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      {!selectedCategory && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {categories.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-block p-6 rounded-full bg-gray-100 mb-6">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-3">لا توجد فئات</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">لا توجد فئات متاحة حالياً</p>
                <Link to="/" className="btn-primary">
                  العودة للرئيسية
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 cursor-pointer"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{category.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {category.description || 'اكتشف منتجات هذه الفئة'}
                      </p>
                      <button className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors flex items-center justify-center">
                        عرض المنتجات
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Products Grid */}
      {selectedCategory && (
        <section className="py-12 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                العودة للفئات
              </button>
              <h2 className="text-2xl font-bold text-gray-800">
                {categories.find(c => c.id === selectedCategory)?.name || 'المنتجات'}
              </h2>
              <div></div> {/* Empty div for spacing */}
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-block p-6 rounded-full bg-gray-100 mb-6">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-3">لا توجد منتجات</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">لا توجد منتجات في هذه الفئة حالياً</p>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="btn-primary"
                >
                  العودة للفئات
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:gap-6">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 hover:scale-105 group cursor-pointer animate-fadeIn"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Product Image */}
                    <div className="relative h-48 sm:h-56 md:h-80 bg-gray-100 overflow-hidden">
                      <img
                        src={product.image || product.main_image_url}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                        onClick={() => navigate(`/product/${product.id}`)}
                      />
                      {(product.discount_percentage || product.discount) > 0 && (
                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-gradient-to-br from-red-500 to-red-600 text-white w-9 h-9 sm:w-11 sm:h-11 rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow">
                          <span>{product.discount_percentage || product.discount}%</span>
                        </div>
                      )}
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
                        {(product.discount_percentage || product.discount) > 0 ? (
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
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${product.id}`);
                          }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
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
            )}
          </div>
        </section>
      )}
      <Footer />

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

        :global(.animate-fadeIn) {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Categories;