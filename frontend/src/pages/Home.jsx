import { useEffect, useState } from 'react';
import { api, endpoints } from '../api';
import Footer from '../components/Footer';
import Cart from '../components/CartNew';
import Checkout from '../components/CheckoutNew';
import BannerSlider from '../components/BannerSlider';
import CategoryProductsSection, { ProductCard } from '../components/CategoryProductsSection';
import { getCachedHomeData, setCachedHomeData } from '../utils/homeCache';
import SiteHeader from '../components/SiteHeader';
import BottomTabBar from '../components/BottomTabBar';

const Home = ({ user, setUser }) => {
  const [products, setProducts] = useState(() => getCachedHomeData()?.products || []);
  const [categories, setCategories] = useState(() => getCachedHomeData()?.categories || []);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(() => !getCachedHomeData()?.products?.length);

  useEffect(() => {
    const hasCache = Boolean(getCachedHomeData()?.products?.length);
    fetchProducts(hasCache);
    fetchCategories(hasCache);
    loadCart();
    // Show welcome message if exists
    const welcomeMessage = localStorage.getItem('welcome_message');
    if (welcomeMessage) {
      showNotification(welcomeMessage);
      localStorage.removeItem('welcome_message');
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('openCart') === '1') {
      setIsCartOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const openCart = () => setIsCartOpen(true);
    window.addEventListener('voro:open-cart', openCart);
    return () => window.removeEventListener('voro:open-cart', openCart);
  }, []);

  const fetchProducts = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await api.get(endpoints.products);
      console.log('📡 API Response:', response);
      const data = response.data;
      const list = Array.isArray(data) ? data : (data?.results || []);
      console.log(`📦 Products list (${list.length} منتجات):`, list);
      
      // Normalize to match UI expectations
      const normalized = list.map((p) => {
        const finalImage = p.image || p.main_image_url || p.main_image || null;
        const priceNum = Number(p.price || 0);
        const discountPriceNum = p.discount_price ? Number(p.discount_price) : null;
        
        return {
          ...p,
          image: finalImage,
          price: priceNum,
          discount_price: discountPriceNum,
          discounted_price: p.discounted_price ? Number(p.discounted_price) : (discountPriceNum || priceNum),
          stock: typeof p.stock_quantity === 'number' ? p.stock_quantity : (p.is_in_stock ? 1 : 0),
          discount: typeof p.discount_percentage === 'number' ? p.discount_percentage : 0,
          time_left: p.time_left || 0,
          is_on_sale: p.is_on_sale || false
        };
      });
      
      console.log('✅ منتجات معالجة:', normalized);
      setProducts(normalized);
      const cachedCategories = getCachedHomeData()?.categories || categories;
      setCachedHomeData(normalized, cachedCategories.length ? cachedCategories : categories);
    } catch (error) {
      console.error('❌ خطأ في جلب المنتجات:', error);
      if (!silent) setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (silent = false) => {
    try {
      const response = await api.get(endpoints.categories);
      console.log('Categories API Response:', response);
      const data = response.data;
      const list = Array.isArray(data) ? data : (data?.results || []);
      console.log('Categories list:', list);
      setCategories(list);
      const cachedProducts = getCachedHomeData()?.products || [];
      setCachedHomeData(cachedProducts.length ? cachedProducts : products, list);
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (!silent) setCategories([]);
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
    window.dispatchEvent(new Event('cart-updated'));
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

  // منتجات القسم المختار (لعرض الشبكة عند اختيار قسم من الهيدر)
  const filteredProducts = products.filter(product => {
    const isDirectMatch = !selectedCategory || product.category === selectedCategory;

    const selectedCatObj = categories.find(c => c.id === selectedCategory);
    const childIds = selectedCatObj?.children?.map(child => child.id) || [];
    const isChildMatch = childIds.includes(product.category);

    return isDirectMatch || isChildMatch;
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
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      {isCartOpen && <Cart cart={cart} onCartChange={handleCartChange} onClose={toggleCart} handleCheckout={handleCheckout} />}
      {isCheckoutOpen && <Checkout cart={cart} onCheckout={handleCheckoutComplete} onClose={() => setIsCheckoutOpen(false)} appliedCoupon={appliedCoupon} couponDiscount={couponDiscount} />}
      <SiteHeader
        user={user}
        setUser={setUser}
        onSelectCategory={(id) => { setSelectedCategory(id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />
      {/* Banner Slider — full-bleed (يغطّي كامل العرض بلا حواف) */}
      <BannerSlider />

      {/* Products by Category Sections */}
      <div className="bg-gradient-to-b from-white to-gray-50">
        {selectedCategory ? (
          // If a specific category is selected, show grid view with filter
          <section className="py-12">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
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
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 px-2">
                {filteredProducts.map(product => (
                  <ProductCard 
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
      <Footer />
      <BottomTabBar />
    </div>
  );
};

export default Home;
