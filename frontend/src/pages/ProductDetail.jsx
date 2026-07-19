import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, endpoints } from '../api';
import { formatCurrency, getFreeShippingThreshold } from '../utils/currency';
import Cart from '../components/CartNew';
import CheckoutNew from '../components/CheckoutNew';
import CountdownTimer from '../components/CountdownTimer';
import { ProductCard } from '../components/CategoryProductsSection';
import { markPendingScrollRestore } from '../utils/scrollRestore';
import { ChevronRight, Check, Heart, Package, ShieldCheck, DollarSign, Frown } from 'lucide-react';
import BottomTabBar from '../components/BottomTabBar';
import SiteHeader from '../components/SiteHeader';

const ProductDetail = ({ user, setUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    fetchProduct();
    loadCart();
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [id]);

  useEffect(() => {
    const openCart = () => setIsCartOpen(true);
    window.addEventListener('voro:open-cart', openCart);
    return () => window.removeEventListener('voro:open-cart', openCart);
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`${endpoints.products}${id}/`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
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

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutComplete = () => {
    // رسالة النجاح تعرضها نافذة إتمام الطلب نفسها، فلا داعي لتنبيه مكرّر هنا
    setCart([]);
    localStorage.removeItem('cart');
    setIsCheckoutOpen(false);
  };

  const addToCart = (item = null) => {
    const target = item || product;
    if (!target) return;

    const itemPriceNum = Number(target?.price ?? 0);
    const itemDiscountAmount = Number(target?.discount_amount ?? 0);
    const itemFinalPrice = target?.discounted_price
      ? Number(target.discounted_price)
      : (itemDiscountAmount > 0 ? Math.max(itemPriceNum - itemDiscountAmount, 0) : itemPriceNum);
    const itemStock = typeof target?.stock_quantity === 'number'
      ? target.stock_quantity
      : (target?.stock ?? (target?.is_in_stock ? 1 : 0));
    const qty = item ? 1 : quantity;

    if (itemStock <= 0) {
      showNotification('عذراً، هذا المنتج غير متوفر في المخزون', 'error');
      return;
    }

    const existingItem = cart.find(cartItem => cartItem.id === target.id);
    let newCart;

    if (existingItem) {
      const newQuantity = existingItem.quantity + qty;
      if (newQuantity > itemStock) {
        showNotification(`عذراً، المخزون المتوفر فقط ${itemStock} قطعة`, 'error');
        return;
      }
      newCart = cart.map(cartItem =>
        cartItem.id === target.id
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      );
    } else {
      if (qty > itemStock) {
        showNotification(`عذراً، المخزون المتوفر فقط ${itemStock} قطعة`, 'error');
        return;
      }
      newCart = [...cart, {
        ...target,
        price: itemFinalPrice,
        original_price: itemPriceNum,
        quantity: qty,
        stock: itemStock,
      }];
    }

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart-updated'));
    showNotification(`تم إضافة ${qty} من ${target.name} للسلة بنجاح!`, 'success');
  };

  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 bounce-in`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification && notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };

  const goBack = () => {
    markPendingScrollRestore('/');
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const normalizeSimilarProduct = (p) => ({
    ...p,
    image: p.image || p.main_image_url || p.main_image,
    stock: typeof p.stock_quantity === 'number' ? p.stock_quantity : (p.stock ?? 0),
    discounted_price: p.discounted_price ? Number(p.discounted_price) : null,
    discount_price: p.discount_price ? Number(p.discount_price) : null,
    price: Number(p.price || 0),
    discount_percentage: Number(p.discount_percentage || 0),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4"><Frown className="w-16 h-16 mx-auto" /></div>
          <h2 className="text-2xl font-bold text-gray-600 mb-4">المنتج غير موجود</h2>
          <Link to="/" className="btn-primary">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  // Normalize numeric fields and images to avoid runtime errors
  const priceNum = Number(product?.price ?? 0);
  const discountAmount = Number(product?.discount_amount ?? 0);
  const discountPercentage = Number(product?.discount_percentage ?? 0);
  const stockCount = typeof product?.stock_quantity === 'number' ? product.stock_quantity : (product?.is_in_stock ? 1 : 0);
  
  // استخدام السعر المخصوم من الـ API مباشرة (discounted_price)
  // أو حسابه من السعر الأصلي - مبلغ الخصم
  const finalPrice = product?.discounted_price 
    ? Number(product.discounted_price) 
    : (discountAmount > 0 ? Math.max(priceNum - discountAmount, 0) : priceNum);

  // Get all product images
  const productImages = Array.isArray(product?.all_images) && product.all_images.length > 0
    ? product.all_images
    : [product?.main_image || product?.image || 'https://via.placeholder.com/600x400/f3f4f6/9ca3af?text=صورة+المنتج'];

  const similarProducts = Array.isArray(product?.similar_products) ? product.similar_products : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <SiteHeader user={user} setUser={setUser} />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4 space-x-reverse">
              <li>
                <button type="button" onClick={goBack} className="text-gray-500 hover:text-primary-600 transition-colors">
                  الرئيسية
                </button>
              </li>
              <li>
                <ChevronRight className="flex-shrink-0 h-5 w-5 text-gray-400" />
              </li>
              <li>
                <span className="text-gray-700 font-medium">{product.name}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-w-1 aspect-h-1 bg-white rounded-xl overflow-hidden shadow-lg">
              <div className="w-full h-96 bg-white flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-white flex items-center justify-center">
                  <div className="bg-white p-2 rounded-lg shadow-inner w-full h-full flex items-center justify-center">
                    <img
                      src={productImages[selectedImage]}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain"
                      style={{ 
                        backgroundColor: '#ffffff'
                      }}
                      onError={(e) => {
                        const currentSrc = e.target.src;
                        console.error('Failed to load image:', currentSrc);
                        
                        // محاولة إصلاح المسار إذا كان رابط R2 ويحتوي على بادئات خاطئة
                        if ((currentSrc.includes('pub-') || currentSrc.includes('media.voroiq.com')) && !e.target.dataset.triedFix) {
                          e.target.dataset.triedFix = 'true';
                          const fixedSrc = currentSrc.replace(/\/uploads\//g, '/');
                          if (fixedSrc !== currentSrc) {
                            e.target.src = fixedSrc;
                            return;
                          }
                        }

                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"%3E%3Crect fill="%23f3f4f6" width="600" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="45%25" text-anchor="middle"%3Eالصورة غير متوفرة%3C/text%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" dy="10.5" x="50%25" y="55%25" text-anchor="middle"%3Evoro Cloud Storage%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                </div>
              </div>
              {discountPercentage > 0 && (
                <div className="absolute top-4 left-4 w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-white transform rotate-3">
                  <span className="text-white font-bold text-xs">خصم</span>
                  <span className="text-white font-bold text-lg">{discountPercentage}%</span>
                </div>
              )}
              {stockCount > 0 && (
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-lg">
                  متبقي من المنتج {stockCount}
                </div>
              )}
              {stockCount === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">نفد المخزون</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="flex space-x-4 space-x-reverse overflow-x-auto">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index
                      ? 'border-primary-500'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const currentSrc = e.target.src;
                        if (currentSrc.includes('pub-') && !e.target.dataset.triedFix) {
                          e.target.dataset.triedFix = 'true';
                          const fixedSrc = currentSrc.replace(/\/uploads\//g, '/');
                          if (fixedSrc !== currentSrc) {
                            e.target.src = fixedSrc;
                            return;
                          }
                        }
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect fill="%23f3f4f6" width="80" height="80"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="10" dy="3.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3Eلا توجد%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              {product.category_name && (
                <p className="text-primary-600 font-medium">{product.category_name}</p>
              )}
            </div>

            {/* Price and Stock */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <span className={`text-4xl font-bold ${product.is_on_sale ? 'text-red-600' : 'text-primary-600'}`}>
                    {formatCurrency(finalPrice)}
                  </span>
                  {product.is_on_sale && (
                    <span className="text-xl text-gray-500 line-through">
                      {formatCurrency(priceNum)}
                    </span>
                  )}
                </div>
                {stockCount > 0 && (
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                    متبقي من المنتج {stockCount}
                  </div>
                )}
              </div>

              {/* Countdown Timer */}
              {product.is_on_sale && product.discount_end && (
                <CountdownTimer targetDate={product.discount_end} />
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">وصف المنتج</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">المميزات</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 space-x-reverse">
                      <Check className="h-5 w-5 text-green-500" strokeWidth={2} />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-gray-700">حالة المخزون:</span>
              {stockCount > 0 ? (
                <span className="text-green-600 font-semibold">
                  متبقي من المنتج {stockCount}
                </span>
              ) : (
                <span className="text-red-600 font-semibold">نفد المخزون</span>
              )}
            </div>

            {/* Quantity Selector */}
            {stockCount > 0 && (
              <div className="flex items-center space-x-4 space-x-reverse">
                <span className="text-gray-700">الكمية:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(stockCount, quantity + 1))}
                    className="px-3 py-2 text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4 space-x-reverse">
              <button
                onClick={() => addToCart()}
                disabled={stockCount === 0}
                className={`flex-1 py-4 px-6 rounded-lg font-semibold text-lg transition-all ${stockCount === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'btn-primary'
                  }`}
              >
                {stockCount === 0 ? 'نفد المخزون' : `أضف للسلة - ${formatCurrency((finalPrice || 0) * quantity)}`}
              </button>
              <button 
                onClick={() => {
                  // Get favorites from localStorage
                  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                  const isFavorite = favorites.some(item => item.id === product.id);

                  if (isFavorite) {
                    // Remove from favorites
                    const newFavorites = favorites.filter(item => item.id !== product.id);
                    localStorage.setItem('favorites', JSON.stringify(newFavorites));
                    showNotification('تم إزالة المنتج من المفضلة');
                  } else {
                    // Add to favorites
                    favorites.push(product);
                    localStorage.setItem('favorites', JSON.stringify(favorites));
                    showNotification('تم إضافة المنتج للمفضلة');
                  }
                }}
                className="px-6 py-4 border border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
              >
                <Heart className="h-6 w-6" strokeWidth={2} />
              </button>
            </div>

            {/* Shipping Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Package className="h-5 w-5 text-green-600" strokeWidth={2} />
                <span className="text-gray-700">توصيل مجاني في حالة صار المبلغ الكلي للطلبات {formatCurrency(getFreeShippingThreshold())}</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <ShieldCheck className="h-5 w-5 text-blue-600" strokeWidth={2} />
                <span className="text-gray-700">ضمان الجودة والاستبدال</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <DollarSign className="h-5 w-5 text-primary-600" strokeWidth={2} />
                <span className="text-gray-700">دفع آمن ومضمون</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products (admin-selected) */}
      {similarProducts.length > 0 && (
        <div className="bg-white py-12 border-t border-gray-100">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-right">منتجات مشابهة</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
              {similarProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={normalizeSimilarProduct(item)}
                  onAddToCart={(p) => addToCart(p)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cart Component */}
      {isCartOpen && (
        <Cart 
          cart={cart} 
          onCartChange={setCart} 
          onClose={toggleCart}
          handleCheckout={handleCheckout} 
        />
      )}

      {/* Checkout Component */}
      {isCheckoutOpen && (
        <CheckoutNew
          cart={cart}
          onCheckout={handleCheckoutComplete}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}
      <BottomTabBar />
    </div>
  );
};

export default ProductDetail;