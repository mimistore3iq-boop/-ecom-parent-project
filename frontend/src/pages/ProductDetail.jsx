import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, endpoints } from '../api';
import { formatCurrency, getFreeShippingThreshold } from '../utils/currency';
import Cart from '../components/CartNew';
import CheckoutNew from '../components/CheckoutNew';
import CountdownTimer from '../components/CountdownTimer';

const ProductDetail = ({ user }) => {
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
  }, [id]);

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
    setCart([]);
    localStorage.removeItem('cart');
    setIsCheckoutOpen(false);
    showNotification('تم إتمام طلبك بنجاح!');
  };

  const addToCart = () => {
    // التحقق من المخزون
    if (stockCount <= 0) {
      showNotification('عذراً، هذا المنتج غير متوفر في المخزون', 'error');
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    let newCart;

    if (existingItem) {
      // التحقق من أن الكمية الجديدة لا تتجاوز المخزون
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > stockCount) {
        showNotification(`عذراً، المخزون المتوفر فقط ${stockCount} قطعة`, 'error');
        return;
      }
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: newQuantity }
          : item
      );
    } else {
      // التحقق من أن الكمية المطلوبة لا تتجاوز المخزون
      if (quantity > stockCount) {
        showNotification(`عذراً، المخزون المتوفر فقط ${stockCount} قطعة`, 'error');
        return;
      }
      // حفظ المنتج مع السعر المخصوم
      const productWithDiscountedPrice = {
        ...product,
        // تأكد من حفظ السعر المخصوم الصحيح
        price: finalPrice,
        original_price: priceNum,
        quantity
      };
      newCart = [...cart, productWithDiscountedPrice];
    }

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));

    // Show success message
    showNotification(`تم إضافة ${quantity} من ${product.name} للسلة بنجاح!`, 'success');
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

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">😞</div>
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
  
  // Debug: Log product images
  console.log('Product all_images:', product?.all_images);
  console.log('Product images to display:', productImages);

  return (
    <div className="min-h-screen bg-gray-50">
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
                <button onClick={toggleCart} className="p-2 text-gray-600 hover:text-primary-600 transition-colors">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
                  </svg>
                  {getCartItemCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getCartItemCount()}
                    </span>
                  )}
                </button>
              </div>
              {user && (
                <span className="text-gray-700">مرحباً، {user.phone}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4 space-x-reverse">
              <li>
                <Link to="/" className="text-gray-500 hover:text-primary-600 transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <span className="text-gray-700 font-medium">{product.name}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                        backgroundColor: '#ffffff',
                        viewTransitionName: `product-image-${product.id}`
                      }}
                      onError={(e) => {
                        console.error('Failed to load image:', productImages[selectedImage]);
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"%3E%3Crect fill="%23f3f4f6" width="600" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="45%25" text-anchor="middle"%3Eالصورة غير متوفرة%3C/text%3E%3Ctext fill="%23dc3545" font-family="sans-serif" font-size="14" dy="10.5" x="50%25" y="55%25" text-anchor="middle"%3EImgBB Image Not Found%3C/text%3E%3C/svg%3E';
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
              {stockCount <= 5 && stockCount > 0 && (
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-lg">
                  متبقي {stockCount}
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
                {stockCount <= 5 && stockCount > 0 && (
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                    متبقي {stockCount}
                  </div>
                )}
              </div>

              {/* Countdown Timer */}
              {product.is_on_sale && product.discount_end && (
                <div className="bg-green-50 rounded-2xl p-4 border border-green-100 shadow-inner">
                  <p className="text-center text-green-800 font-bold mb-2">ينتهي العرض خلال:</p>
                  <CountdownTimer expiryDate={product.discount_end} />
                </div>
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
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
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
                  متوفر ({stockCount} قطعة)
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
                onClick={addToCart}
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
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {/* Shipping Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3 space-x-reverse">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-gray-700">توصيل مجاني في حالة صار المبلغ الكلي للطلبات {formatCurrency(getFreeShippingThreshold())}</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700">ضمان الجودة والاستبدال</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="text-gray-700">دفع آمن ومضمون</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">منتجات مشابهة</h2>
          <div className="text-center text-gray-500">
            <p>سيتم عرض المنتجات المشابهة هنا</p>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default ProductDetail;