import { useEffect, useState } from 'react';
import * as axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { api, endpoints } from '../api';
import BottomNav from '../components/BottomNav';
import Cart from '../components/CartNew';
import Checkout from '../components/CheckoutNew';
import TopBar from '../components/TopBar';
import BannerSlider from '../components/BannerSlider';
import CategoryProductsSection from '../components/CategoryProductsSection';
import { formatCurrency } from '../utils/currency';

const Home = ({ user, setUser }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    loadCart();
    // Show welcome message if exists
    const welcomeMessage = localStorage.getItem('welcome_message');
    if (welcomeMessage) {
      showNotification(welcomeMessage);
      localStorage.removeItem('welcome_message');
    }
  }, []);

  const refreshData = () => {
    fetchProducts();
    fetchCategories();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.relative')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const fetchProducts = async () => {
    try {
      const response = await api.get(endpoints.products);
      console.log('📡 API Response:', response);
      const data = response.data;
      const list = Array.isArray(data) ? data : (data?.results || []);
      console.log(`📦 Products list (${list.length} منتجات):`, list);
      
      // Normalize to match UI expectations
      const normalized = list.map((p) => {
        const finalImage = p.image || p.main_image_url || p.main_image || null;
        // Log image details for first 3 products
        if (list.indexOf(p) < 3) {
          console.log(`🖼️ منتج: ${p.name}`, {
            'id': p.id,
            'p.image': p.image ? '✅' : '❌',
            'p.main_image_url': p.main_image_url ? '✅' : '❌',
            'p.main_image': p.main_image ? '✅' : '❌',
            'النهائي': finalImage ? '✅' : '❌',
            'URL': finalImage
          });
        }
        return {
          ...p,
          image: finalImage,
          stock: typeof p.stock_quantity === 'number' ? p.stock_quantity : (p.is_in_stock ? 1 : 0),
          discount: typeof p.discount_percentage === 'number' ? p.discount_percentage : 0,
        };
      });
      
      console.log('✅ منتجات معالجة:', normalized);
      setProducts(normalized);
    } catch (error) {
      console.error('❌ خطأ في جلب المنتجات:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get(endpoints.categories);
      console.log('Categories API Response:', response);
      const data = response.data;
      const list = Array.isArray(data) ? data : (data?.results || []);
      console.log('Categories list:', list);
      setCategories(list);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
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
    // التحقق من المخزون
    if (product.stock <= 0) {
      showNotification('عذراً، هذا المنتج غير متوفر في المخزون', 'error');
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    let newCart;

    if (existingItem) {
      // التحقق من أن الكمية الجديدة لا تتجاوز المخزون
      const newQuantity = existingItem.quantity + 1;
      if (newQuantity > product.stock) {
        showNotification(`عذراً، المخزون المتوفر فقط ${product.stock} قطعة`, 'error');
        return;
      }
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: newQuantity }
          : item
      );
    } else {
      // حساب السعر المخصوم الصحيح
      const priceNum = Number(product?.price ?? 0);
      const discountAmount = Number(product?.discount_amount ?? 0);
      const finalPrice = product?.discounted_price 
        ? Number(product.discounted_price) 
        : (discountAmount > 0 ? Math.max(priceNum - discountAmount, 0) : priceNum);
      
      // حفظ المنتج مع السعر المخصوم
      const productWithDiscountedPrice = {
        ...product,
        price: finalPrice,
        original_price: priceNum,
        quantity: 1
      };
      newCart = [...cart, productWithDiscountedPrice];
    }

    handleCartChange(newCart);

    // Show success message
    showNotification('تم إضافة المنتج للسلة بنجاح!', 'success');
  };

  const showNotification = (message, type = 'success') => {
    // Create notification element
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 bounce-in`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutComplete = () => {
    setCart([]);
    setIsCheckoutOpen(false);
    window.location.reload();
  };

  const filteredProducts = products.filter(product => {
    console.log('Filtering product:', product, 'selectedCategory:', selectedCategory);
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // If no category is selected (homepage), only show products with show_on_homepage = true
    // If a category is selected, show all products in that category
    const matchesHomepage = selectedCategory ? true : (product.show_on_homepage !== false);
    
    return matchesCategory && matchesSearch && matchesHomepage;
  });

  // Helper function to get products for a specific category
  const getProductsForCategory = (categoryId) => {
    return products.filter(product => {
      const matchesCategory = product.category === categoryId;
      const isActive = product.is_active !== false;
      const matchesSearch = searchTerm === '' ||
        (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && isActive && matchesSearch;
    });
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Load coupon data from localStorage for Checkout
  const appliedCoupon = localStorage.getItem('appliedCoupon') ? JSON.parse(localStorage.getItem('appliedCoupon')) : null;
  const couponDiscount = localStorage.getItem('couponDiscount') ? parseFloat(localStorage.getItem('couponDiscount')) : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">{/* pb for bottom nav */}
      {isCartOpen && <Cart cart={cart} onCartChange={handleCartChange} onClose={toggleCart} handleCheckout={handleCheckout} />}
      {isCheckoutOpen && <Checkout cart={cart} onCheckout={handleCheckoutComplete} onClose={() => setIsCheckoutOpen(false)} appliedCoupon={appliedCoupon} couponDiscount={couponDiscount} />}
      {/* Top bar */}
      <TopBar />
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-2 md:space-x-4 space-x-reverse">
              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md flex items-center justify-center">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold gradient-text">MIMI STORE</h1>
              </div>
            </div>

            {/* Search + Icons */}
            <div className="flex items-center gap-4">
              {/* Search icon (mobile) */}
              <button className="p-2.5 text-gray-600 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50 md:hidden">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              {/* Cart */}
              <div className="relative">
                <button onClick={toggleCart} className="p-2.5 text-gray-600 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50 relative">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
                  </svg>
                  {getCartItemCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-md">
                      {getCartItemCount()}
                    </span>
                  )}
                </button>
              </div>
              {/* Refresh */}
              <button
                onClick={refreshData}
                className="p-2 text-gray-600 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                title="تحديث البيانات"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              {/* Menu */}
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  className="p-2 text-gray-600 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                {/* Categories Dropdown */}
                {isMenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 overflow-hidden transition-all duration-300 transform origin-top-left">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-white text-sm font-medium">
                      تصفح حسب الفئة
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategory('');
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-right px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center justify-start"
                    >
                      <span className="ml-2">جميع المنتجات</span>
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-right px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center justify-start"
                      >
                        <span className="ml-2">{category.name}</span>
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop search */}
              <div className="hidden md:block w-72">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* User */}
              {user ? (
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 md:space-x-reverse">
                  <span className="text-gray-700 text-sm mb-2 md:mb-0">مرحباً، {user.phone}</span>
                  {user.is_admin && (
                    <Link to="/admin" className="btn-secondary py-2 px-3 text-sm mb-2 md:mb-0">لوحة الإدارة</Link>
                  )}
                  <button onClick={logout} className="text-red-600 hover:text-red-700 text-sm">تسجيل خروج</button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row">
                  <Link to="/login" className="btn-primary py-2 px-4 text-sm">تسجيل دخول</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {/* Banner Slider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <BannerSlider />
      </div>

      {/* Products by Category Sections */}
      <div className="bg-gradient-to-b from-white to-gray-50">
        {selectedCategory ? (
          // If a specific category is selected, show grid view with filter
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 inline-block relative">
                  {categories.find(c => c.id === selectedCategory)?.name || 'منتجاتنا'}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                </h3>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 fade-in">
                  <div className="inline-block p-6 rounded-full bg-gray-100 mb-6">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">لا توجد منتجات</h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-6">لم يتم العثور على منتجات في هذا القسم</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {filteredProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="product-card bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 w-full aspect-square">
                    <img
                      src={product.image || '/placeholder-product.png'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      onLoad={(e) => {
                        if (index < 3) {
                          console.log(`✅ تم تحميل صورة: ${product.name}`);
                        }
                      }}
                      onError={(e) => {
                        console.log(`❌ فشل تحميل صورة: ${product.name}`);
                        console.log(`   URL كان: ${product.image || '/placeholder-product.png'}`);
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3Eلا توجد صورة%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    {(product.discount_percentage || product.discount) > 0 && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white w-10 h-10 rounded-full text-xs font-bold shadow-lg flex items-center justify-center">
                        <span>{product.discount_percentage || product.discount}%</span>
                      </div>
                    )}
                    {product.stock <= 5 && product.stock > 0 && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg flex items-center">
                        <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="mr-1">متبقي {product.stock}</span>
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/50 flex items-center justify-center">
                        <div className="text-center p-4">
                          <span className="text-white font-bold text-xl block mb-2">نفد المخزون</span>
                          <span className="text-white/80 text-sm">غير متوفر حالياً</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3 md:p-4 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm md:text-base text-gray-800 line-clamp-3 flex-1 pr-2">
                        {product.name}
                      </h4>
                      {product.brand && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                          {product.brand}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-xs mb-3 line-clamp-1 pr-2 hidden md:block">
                      {product.description || 'لا يوجد وصف متاح للمنتج'}
                    </p>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                      {(product.discount_percentage || product.discount) > 0 ? (
                        <div className="flex items-center space-x-2 space-x-reverse flex-1">
                          <span className="text-base md:text-lg font-bold text-indigo-600">
                            {formatCurrency(product.discounted_price || (product.price * (1 - (product.discount_percentage || product.discount) / 100)))}
                          </span>
                          <span className="text-xs md:text-sm text-gray-500 line-through">
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <span className="text-base md:text-lg font-bold text-indigo-600">
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-1 space-x-reverse">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        disabled={product.stock === 0}
                        className={`flex-1 py-2 px-2 rounded-lg font-medium transition-all text-xs ${product.stock === 0
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'btn-primary shadow-md hover:shadow-lg'
                          }`}
                      >
                        {product.stock === 0 ? (
                          <span className="flex items-center justify-center">
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            نفد المخزون
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
                            </svg>
                            <span className="hidden sm:inline">أضف للسلة</span><span className="sm:hidden">سلة</span>
                          </span>
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${product.id}`);
                        }}
                        className="px-2 py-2 border border-indigo-500 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors flex items-center text-xs"
                      >
                        <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="hidden sm:inline">تفاصيل</span><span className="sm:hidden">عرض</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
                </div>
              )}
            </div>
          </section>
        ) : (
          // If no category selected, show carousel view of all categories with their products
          <>
            <section className="py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                  <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">منتجاتنا</h3>
                  <p className="text-gray-600">اكتشف أحدث المنتجات الإلكترونية بأفضل الأسعار وجودة في العراق</p>
                </div>
              </div>
            </section>
            
            {/* Category Product Sliders */}
            {categories.map(category => {
              const categoryProducts = getProductsForCategory(category.id);
              return (
                <CategoryProductsSection
                  key={category.id}
                  category={category}
                  products={categoryProducts}
                  onAddToCart={addToCart}
                  onViewDetails={(product) => navigate(`/product/${product.id}`)}
                />
              );
            })}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">MIMI STORE</h3>
              <p className="text-gray-300">
                متجرك الإلكتروني المفضل للحصول على أفضل المنتجات بأسعار مميزة
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">الرئيسية</a></li>
                <li><a href="#" className="hover:text-white transition-colors">المنتجات</a></li>
                <li><a href="#" className="hover:text-white transition-colors">من نحن</a></li>
                <li><a href="#" className="hover:text-white transition-colors">اتصل بنا</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">خدمة العملاء</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">سياسة الإرجاع</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الشحن والتوصيل</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الأسئلة الشائعة</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الدعم الفني</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">تواصل معنا</h4>
              <div className="space-y-2 text-gray-300">
                <a href="tel:+96407737698219" className="hover:text-white transition-colors block">📞 07737698219</a>
                <a href="https://wa.me/9647737698219" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors block">💬 واتساب</a>
                <a href="https://t.me/mimi_store10" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors block">📱 تيليجرام</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2025 MIMI STORE. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
        <div className="grid grid-cols-4 gap-1">
          <button className="flex flex-col items-center py-2 text-primary-600">
            <svg className="h-6 w-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="text-xs">الرئيسية</span>
          </button>
          <button className="flex flex-col items-center py-2 text-gray-600">
            <svg className="h-6 w-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs">البحث</span>
          </button>
          <button className="flex flex-col items-center py-2 text-gray-600 relative">
            <svg className="h-6 w-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
            </svg>
            {getCartItemCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {getCartItemCount()}
              </span>
            )}
            <span className="text-xs">السلة</span>
          </button>
          <button className="flex flex-col items-center py-2 text-gray-600">
            <svg className="h-6 w-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">الحساب</span>
          </button>
        </div>
      </div>
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Home;
