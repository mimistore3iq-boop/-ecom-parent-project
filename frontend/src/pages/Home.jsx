import { useEffect, useState } from 'react';
import * as axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { api, endpoints } from '../api';
import BottomNav from '../components/BottomNav';
import Cart from '../components/CartNew';
import Checkout from '../components/CheckoutNew';
import TopBar from '../components/TopBar';
import BannerSlider from '../components/BannerSlider';
import CategorySlider from '../components/CategorySlider';
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
    // التحقق مما إذا كان المنتج ينتمي للقسم المختار أو أي من أبنائه
    const isDirectMatch = !selectedCategory || product.category === selectedCategory;
    
    // جلب القسم المختار مع أبنائه
    const selectedCatObj = categories.find(c => c.id === selectedCategory);
    const childIds = selectedCatObj?.children?.map(child => child.id) || [];
    const isChildMatch = childIds.includes(product.category);

    const matchesCategory = isDirectMatch || isChildMatch;

    const matchesSearch = searchTerm === '' || 
      (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesHomepage = selectedCategory ? true : (product.show_on_homepage !== false);
    
    return matchesCategory && matchesSearch && matchesHomepage;
  });

  // دالة جلب منتجات القسم مع كافة أبنائه (للعرض في الصفحة الرئيسية)
  const getProductsForCategoryTree = (category) => {
    const childIds = category.children?.map(child => child.id) || [];
    const allIds = [category.id, ...childIds];
    
    return products.filter(product => {
      const matchesCategory = allIds.includes(product.category);
      const isActive = product.is_active !== false;
      return matchesCategory && isActive;
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
                    {categories.filter(c => !c.parent).map(category => (
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

      {/* Category Slider */}
      <CategorySlider 
        categories={categories.filter(c => !c.parent)} 
        selectedCategory={selectedCategory} 
        onCategorySelect={setSelectedCategory} 
      />

      {/* Products by Category Sections */}
      <div className="bg-gradient-to-b from-white to-gray-50">
        {selectedCategory ? (
          // If a specific category is selected, show grid view with filter
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    {categories.find(c => c.id === selectedCategory)?.name || 'المنتجات'}
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    تم العثور على {filteredProducts.length} منتج
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {filteredProducts.map(product => (
                  <CategoryProductsSection.ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={addToCart} 
                  />
                ))}
              </div>
            </div>
          </section>
        ) : (
          // Homepage: Show sections for each parent category
          categories.filter(c => !c.parent).map(category => {
            const categoryProducts = getProductsForCategoryTree(category);
            if (categoryProducts.length === 0) return null;
            
            return (
              <CategoryProductsSection
                key={category.id}
                category={category}
                products={categoryProducts}
                onAddToCart={addToCart}
              />
            );
          })
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
