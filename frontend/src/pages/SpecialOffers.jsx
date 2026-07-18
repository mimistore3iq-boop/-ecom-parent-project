import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, endpoints } from '../api';
import Footer from '../components/Footer';
import { ProductCard } from '../components/CategoryProductsSection';
import { Package } from 'lucide-react';
import BottomTabBar from '../components/BottomTabBar';
import SiteHeader from '../components/SiteHeader';
import BannerSlider from '../components/BannerSlider';

// رأس صفحة العروض الافتراضي — يظهر عند عدم وجود صورة بنر للعروض بعد
const offersHeaderFallback = (
  <div className="bg-gradient-to-br from-primary-600 to-primary-900 py-14">
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">عروض خاصة</h1>
      <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto">
        استمتع بأفضل العروض والخصومات على منتجاتنا المميزة
      </p>
    </div>
  </div>
);

const SpecialOffers = ({ user, setUser }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchProducts();
    loadCart();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get(endpoints.products);
      const data = response.data;
      const list = Array.isArray(data) ? data : (data?.results || []);

      // Filter products with discount > 0
      const discountedProducts = list.filter(p => 
        (p.discount_percentage && p.discount_percentage > 0) || 
        (p.discount && p.discount > 0)
      );

      // Normalize to match UI expectations
      const normalized = discountedProducts.map((p) => ({
        ...p,
        image: p.main_image_url || p.main_image || null,
        stock: typeof p.stock_quantity === 'number' ? p.stock_quantity : (p.is_in_stock ? 1 : 0),
        discount: typeof p.discount_percentage === 'number' ? p.discount_percentage : (p.discount || 0),
      }));

      setProducts(normalized);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <SiteHeader user={user} setUser={setUser} />

      {/* رأس الصفحة: بنر صورة للعروض إن وُجد، وإلا الرأس النصّي الافتراضي */}
      <BannerSlider placement="offers" fallback={offersHeaderFallback} />

      {/* Products Grid */}
      <section className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          {products.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-block p-6 rounded-full bg-gray-100 mb-6">
                <Package className="w-16 h-16 text-gray-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">لا توجد عروض حالياً</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">عودة لاحقاً للاستمتاع بأفضل العروض والخصومات</p>
              <Link to="/" className="btn-primary">
                العودة للرئيسية
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={addToCart} 
                />
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
      <BottomTabBar />
    </div>
  );
};

export default SpecialOffers;
