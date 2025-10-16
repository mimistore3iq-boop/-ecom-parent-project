import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import NotificationManager from '../components/NotificationManager';

const AdminPanel = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'product', 'category'
  const [editingItem, setEditingItem] = useState(null);
  const navigate = useNavigate();

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    discount: '',
    main_image: null,
    second_image: null,
    third_image: null,
    fourth_image: null,
    main_image_url: '',
    second_image_url: '',
    third_image_url: '',
    fourth_image_url: ''
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
      fetchCategories();
    } else if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'notifications') {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/orders/');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      console.log('Fetching notifications...');
      const response = await api.get('/api/notifications/?all=true');
      console.log('Notifications response:', response.data);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.response) {
        console.error('Error response:', error.response);
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      console.log('Fetching unread count...');
      const response = await api.get('/api/notifications/unread_count/?all=true');
      console.log('Unread count response:', response.data);
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      if (error.response) {
        console.error('Error response:', error.response);
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/api/notifications/${id}/mark_as_read/`);
      // Update the notification in the state
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, is_read: true } : notification
      ));
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/api/notifications/mark_all_as_read/');
      // Update all notifications in the state
      setNotifications(notifications.map(notification => ({ ...notification, is_read: true })));
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleImageUpload = async (file) => {
    // Upload image to ImgBB by converting to Base64
    const toBase64 = (f) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result || '';
          // remove data URL prefix
          const base64 = String(result).includes(',') ? String(result).split(',')[1] : String(result);
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(f);
      });

    try {
      const base64 = await toBase64(file);
      const formData = new FormData();
      // استخدام مفتاح API المقدم مباشرة
      formData.append('key', 'a2cebbc3daff0b042082a5d5d7a3b80d');
      formData.append('image', base64);

      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      return data?.data?.url || null;
    } catch (error) {
      console.error('Error uploading image to ImgBB:', error);
      return null;
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // رفع الصور إلى ImgBB
      let mainImageUrl = productForm.main_image_url;
      let secondImageUrl = productForm.second_image_url;
      let thirdImageUrl = productForm.third_image_url;
      let fourthImageUrl = productForm.fourth_image_url;

      if (productForm.main_image && typeof productForm.main_image !== 'string') {
        mainImageUrl = await handleImageUpload(productForm.main_image);
        if (!mainImageUrl) {
          alert('فشل في رفع الصورة الرئيسية');
          setLoading(false);
          return;
        }
      }

      if (productForm.second_image && typeof productForm.second_image !== 'string') {
        secondImageUrl = await handleImageUpload(productForm.second_image);
      }

      if (productForm.third_image && typeof productForm.third_image !== 'string') {
        thirdImageUrl = await handleImageUpload(productForm.third_image);
      }

      if (productForm.fourth_image && typeof productForm.fourth_image !== 'string') {
        fourthImageUrl = await handleImageUpload(productForm.fourth_image);
      }

      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        category: productForm.category,
        discount: parseFloat(productForm.discount) || 0,
        main_image_url: mainImageUrl,
        second_image_url: secondImageUrl,
        third_image_url: thirdImageUrl,
        fourth_image_url: fourthImageUrl
      };

      if (editingItem) {
        await api.put(`/admin/products/${editingItem.id}/`, productData);
      } else {
        await api.post('/admin/products/', productData);
      }

      fetchProducts();
      setShowModal(false);
      setEditingItem(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        discount: '',
        image: null
      });
    } catch (error) {
      console.error('Error saving product:', error);
      alert('حدث خطأ في حفظ المنتج');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingItem) {
        await api.put(`/admin/categories/${editingItem.id}/`, categoryForm);
      } else {
        await api.post('/admin/categories/', categoryForm);
      }

      fetchCategories();
      setShowModal(false);
      setEditingItem(null);
      setCategoryForm({
        name: '',
        description: ''
      });
    } catch (error) {
      console.error('Error saving category:', error);
      alert('حدث خطأ في حفظ القسم');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;

    try {
      await api.delete(`/admin/${type}/${id}/`);

      if (type === 'products') {
        fetchProducts();
      } else if (type === 'categories') {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('حدث خطأ في الحذف');
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);

    if (type === 'product') {
      if (item) {
        setProductForm({
          name: item.name,
          description: item.description,
          price: item.price.toString(),
          stock: item.stock.toString(),
          category: item.category?.id || '',
          discount: item.discount?.toString() || '',
          main_image: null,
          second_image: null,
          third_image: null,
          fourth_image: null,
          main_image_url: item.main_image_url || '',
          second_image_url: item.second_image_url || '',
          third_image_url: item.third_image_url || '',
          fourth_image_url: item.fourth_image_url || ''
        });
      } else {
        setProductForm({
          name: '',
          description: '',
          price: '',
          stock: '',
          category: '',
          discount: '',
          main_image: null,
          second_image: null,
          third_image: null,
          fourth_image: null,
          main_image_url: '',
          second_image_url: '',
          third_image_url: '',
          fourth_image_url: ''
        });
      }
    } else if (type === 'category') {
      if (item) {
        setCategoryForm({
          name: item.name,
          description: item.description
        });
      } else {
        setCategoryForm({
          name: '',
          description: ''
        });
      }
    }

    setShowModal(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link to="/" className="flex items-center space-x-2 space-x-reverse">
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl">
                  M
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  MIMI STORE - لوحة الإدارة
                </h1>
              </Link>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse">
              <span className="text-gray-700">مرحباً، {user?.phone}</span>
              <Link
                to="/"
                className="text-primary-600 hover:text-primary-700 transition-colors"
              >
                المتجر
              </Link>
              <button
                onClick={() => setActiveTab('notifications')}
                className="relative text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={logout}
                className="text-red-600 hover:text-red-700 transition-colors"
              >
                تسجيل خروج
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 space-x-reverse">
              {[
                { id: 'products', name: 'المنتجات', icon: '📦' },
                { id: 'categories', name: 'الأقسام', icon: '📂' },
                { id: 'orders', name: 'الطلبات', icon: '🛒' },
                { id: 'notifications', name: 'الإشعارات', icon: '🔔' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">إدارة المنتجات</h2>
              <button
                onClick={() => openModal('product')}
                className="btn-primary"
              >
                + إضافة منتج جديد
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المنتج
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        القسم
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        السعر
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        المخزون
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={product.image || '/placeholder-product-thumb.png'}
                              alt={product.name}
                            />
                            <div className="mr-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.description?.substring(0, 50)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.category?.name || 'غير محدد'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.price} د.ع
                          {product.discount > 0 && (
                            <span className="text-red-500 text-xs mr-2">
                              (-{product.discount}%)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.stock > 10
                              ? 'bg-green-100 text-green-800'
                              : product.stock > 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {product.stock} قطعة
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openModal('product', product)}
                            className="text-primary-600 hover:text-primary-900 ml-4"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDelete('products', product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">إدارة الأقسام</h2>
              <button
                onClick={() => openModal('category')}
                className="btn-primary"
              >
                + إضافة قسم جديد
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div key={category.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {category.products_count || 0} منتج
                    </span>
                    <div className="space-x-2 space-x-reverse">
                      <button
                        onClick={() => openModal('category', category)}
                        className="text-primary-600 hover:text-primary-900 text-sm"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete('categories', category.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">إدارة الطلبات</h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-900 text-white">
                    <tr>
                      <th className="px-3 md:px-6 py-3 text-right text-xs md:text-sm font-bold uppercase tracking-wider">
                        رقم الطلب
                      </th>
                      <th className="px-3 md:px-6 py-3 text-right text-xs md:text-sm font-bold uppercase tracking-wider">
                        العميل
                      </th>
                      <th className="px-3 md:px-6 py-3 text-right text-xs md:text-sm font-bold uppercase tracking-wider">
                        المبلغ الإجمالي
                      </th>
                      <th className="px-3 md:px-6 py-3 text-right text-xs md:text-sm font-bold uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-3 md:px-6 py-3 text-right text-xs md:text-sm font-bold uppercase tracking-wider">
                        التاريخ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-3 md:px-6 py-3 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-3 md:px-6 py-3 whitespace-nowrap text-xs md:text-sm text-gray-900 font-medium">
                          {order.user?.phone || 'غير محدد'}
                        </td>
                        <td className="px-3 md:px-6 py-3 whitespace-nowrap text-xs md:text-sm text-gray-900 font-bold">
                          {order.total_amount} د.ع
                        </td>
                        <td className="px-3 md:px-6 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 md:px-3 py-1 text-xs md:text-sm font-bold rounded-lg border-2 ${order.status === 'completed'
                              ? 'bg-green-200 text-green-900 border-green-900'
                              : order.status === 'pending'
                                ? 'bg-yellow-200 text-yellow-900 border-yellow-900'
                                : 'bg-red-200 text-red-900 border-red-900'
                            }`}>
                            {order.status === 'completed' ? 'مكتمل' :
                              order.status === 'pending' ? 'قيد المعالجة' : 'ملغي'}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 whitespace-nowrap text-xs md:text-sm text-gray-700 font-medium">
                          {new Date(order.created_at).toLocaleDateString('ar-SA')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {modalType === 'product'
                  ? (editingItem ? 'تعديل المنتج' : 'إضافة منتج جديد')
                  : (editingItem ? 'تعديل القسم' : 'إضافة قسم جديد')
                }
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {modalType === 'product' ? (
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم المنتج
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف
                  </label>
                  <textarea
                    required
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      السعر (د.ع)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      المخزون
                    </label>
                    <input
                      type="number"
                      required
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      القسم
                    </label>
                    <select
                      required
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">اختر القسم</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الخصم (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={productForm.discount}
                      onChange={(e) => setProductForm({ ...productForm, discount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الصورة الرئيسية
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProductForm({ ...productForm, main_image: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                  {productForm.main_image_url && (
                    <img
                      src={productForm.main_image_url}
                      alt="Preview"
                      className="mt-2 h-20 w-20 object-cover rounded"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الصورة الثانية
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProductForm({ ...productForm, second_image: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                  {productForm.second_image_url && (
                    <img
                      src={productForm.second_image_url}
                      alt="Preview"
                      className="mt-2 h-20 w-20 object-cover rounded"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الصورة الثالثة
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProductForm({ ...productForm, third_image: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                  {productForm.third_image_url && (
                    <img
                      src={productForm.third_image_url}
                      alt="Preview"
                      className="mt-2 h-20 w-20 object-cover rounded"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الصورة الرابعة
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProductForm({ ...productForm, fourth_image: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                  {productForm.fourth_image_url && (
                    <img
                      src={productForm.fourth_image_url}
                      alt="Preview"
                      className="mt-2 h-20 w-20 object-cover rounded"
                    />
                  )}
                </div>

                <div className="flex justify-end space-x-4 space-x-reverse pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'جاري الحفظ...' : 'حفظ'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم القسم
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف
                  </label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end space-x-4 space-x-reverse pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'جاري الحفظ...' : 'حفظ'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">إدارة الإشعارات</h2>
            <div className="flex items-center space-x-4 space-x-reverse">
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {unreadCount} غير مقروء
                </span>
              )}
              <button
                onClick={markAllAsRead}
                className="btn-secondary"
                disabled={unreadCount === 0}
              >
                تعريف الكل كمقروء
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-5xl mb-4">🔔</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">لا توجد إشعارات</h3>
                  <p className="text-gray-500">ستظهر هنا جميع الإشعارات عند توفرها</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <li key={notification.id} className={`p-4 hover:bg-gray-50 ${!notification.is_read ? 'bg-blue-50' : ''}`}>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-1">
                          <span className="text-2xl">
                            {notification.type === 'new_order' ? '🛒' : 
                             notification.type === 'order_status_changed' ? '📦' :
                             notification.type === 'low_stock' ? '⚠️' : '🔔'}
                          </span>
                        </div>
                        <div className="mr-4 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">{notification.title}</h3>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <span className="text-xs text-gray-500">
                                {new Date(notification.created_at).toLocaleDateString('ar-SA')} {new Date(notification.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {!notification.is_read && (
                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                              )}
                            </div>
                          </div>
                          <p className="mt-1 text-gray-600">{notification.message}</p>
                          {notification.type === 'new_order' && notification.data && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-md">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">العميل: {notification.data.customer_name}</span>
                                <span className="text-gray-900 font-medium">المبلغ: {notification.data.total} د.ع</span>
                              </div>
                            </div>
                          )}
                          <div className="mt-3 flex justify-end">
                            {!notification.is_read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-sm text-primary-600 hover:text-primary-800"
                              >
                                تعريف كمقروء
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Include NotificationManager component */}
      <NotificationManager isAdmin={true} />
    </div>
  );
};

export default AdminPanel;
