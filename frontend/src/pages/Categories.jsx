import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api, endpoints } from '../api';
import Footer from '../components/Footer';
import { ProductCard } from '../components/CategoryProductsSection';
import { ArrowRight, Archive, Box, ChevronLeft, Package } from 'lucide-react';
import BottomTabBar from '../components/BottomTabBar';
import SiteHeader from '../components/SiteHeader';

const Categories = ({ user, setUser }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const { id: categoryIdParam } = useParams();
  const navigate = useNavigate();

  // مصدر الحقيقة الوحيد للقسم المختار هو رابط الصفحة (URL). هكذا يبقى العرض
  // متطابقاً مع العنوان دائماً: /categories = شبكة الأقسام، /categories/:id = منتجات القسم.
  // (يمنع بقاء منتجات قسم قديم ظاهرة عند الرجوع إلى /categories)
  const selectedCategory = categoryIdParam ? parseInt(categoryIdParam, 10) : null;

  // تحميل الأقسام والسلة مرّة واحدة عند فتح الصفحة
  useEffect(() => {
    fetchCategories();
    loadCart();
  }, []);

  // جلب منتجات القسم كلما تغيّر القسم في الرابط؛ وتفريغها عند العودة لشبكة الأقسام
  useEffect(() => {
    if (selectedCategory) {
      fetchProductsByCategory(selectedCategory);
    } else {
      setProducts([]);
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
    if (!categoryId) return;
    try {
      setLoading(true);
      setProducts([]); // Clear old products to avoid flicker
      console.log(`Fetching products for category ID: ${categoryId}`);
      
      const response = await api.get(`${endpoints.productsByCategory}${categoryId}/products/`);
      const data = response.data;
      const list = Array.isArray(data) ? data : (data?.results || []);
      
      console.log(`Found ${list.length} products for category ${categoryId}`);

      const normalized = list.map((p) => {
        const discountPct = typeof p.discount_percentage === 'number' ? p.discount_percentage : (p.discount || 0);
        const priceNum = Number(p.price || 0);
        return {
          ...p,
          id: p.id,
          name: p.name || 'منتج بدون اسم',
          image: p.main_image_url || p.main_image || p.image || null,
          stock: typeof p.stock_quantity === 'number' ? p.stock_quantity : (p.is_in_stock ? 1 : 0),
          discount: discountPct,
          discount_percentage: discountPct,
          price: priceNum,
          discounted_price: p.discounted_price || Math.round(priceNum * (1 - discountPct / 100)),
        };
      });

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

  if (loading && categories.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <SiteHeader user={user} setUser={setUser} />

      {/* رأس الصفحة — بنر موحّد (أحادي اللون) مطابق لصفحة العروض */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-900 py-14">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">المنتجات</h1>
          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto">
            اكتشف منتجاتنا المميزة المصنفة حسب الفئات
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      {!selectedCategory && (
        <section className="py-12 bg-white">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
            {categories.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-block p-6 rounded-full bg-gray-100 mb-6">
                  <Archive className="w-16 h-16 text-gray-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-3">لا توجد فئات</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">لا توجد فئات متاحة حالياً</p>
                <Link to="/" className="btn-primary">
                  العودة للرئيسية
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => navigate(`/categories/${category.id}`)}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-900/25 hover:shadow-[0_14px_34px_-14px_rgba(0,0,0,0.18)] transition-all duration-300 text-right flex flex-col"
                  >
                    {/* صورة القسم — مع أيقونة بديلة عند غيابها أو فشل تحميلها */}
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                        <Box className="h-12 w-12" strokeWidth={1.5} />
                      </div>
                      {(category.image_url || category.image) && (
                        <img
                          src={category.image_url || category.image}
                          alt={category.name}
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          className="relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="p-3.5 md:p-4 flex items-center justify-between gap-2">
                      <h3 className="text-[14px] md:text-[15px] font-bold text-gray-900 line-clamp-1">{category.name}</h3>
                      <ChevronLeft className="h-4 w-4 shrink-0 text-gray-400 transition-all duration-300 group-hover:text-black group-hover:-translate-x-0.5" strokeWidth={2.5} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Products Grid */}
      {selectedCategory && (
        <section className="py-12 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => navigate('/categories')}
                className="flex items-center text-primary-600 hover:text-primary-800 transition-colors"
              >
                <ArrowRight className="h-5 w-5 mr-1" strokeWidth={2} />
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
                  <Package className="w-16 h-16 text-gray-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-3">لا توجد منتجات</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">لا توجد منتجات في هذه الفئة حالياً</p>
                <button
                  onClick={() => navigate('/categories')}
                  className="btn-primary"
                >
                  العودة للفئات
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6 px-2">
                {products.map((product) => (
                  <div key={product.id} className="h-full">
                    {ProductCard ? (
                      <ProductCard 
                        product={product} 
                        onAddToCart={addToCart} 
                      />
                    ) : (
                      <div className="p-4 border rounded-xl bg-white text-center text-xs">
                        {product.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
      <Footer />
      <BottomTabBar />
    </div>
  );
};

export default Categories;