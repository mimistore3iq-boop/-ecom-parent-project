import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, FolderTree, ShoppingCart, Image, Bell, Store, LogOut, LayoutGrid,
  Home, Tag, Plus, Pencil, Trash2, AlertTriangle, PackageCheck, X, GripVertical,
  RefreshCw, ArrowLeft,
} from 'lucide-react';

import { api } from '../api';
import NotificationManager from '../components/NotificationManager';

// وقت نسبي مقروء ("قبل ٥ دقائق") — أوضح من طابع زمني كامل في قائمة إشعارات
const timeAgo = (iso) => {
  const ts = new Date(iso).getTime();
  if (!ts) return '';
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return 'الآن';
  if (diff < 3600) return `قبل ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `قبل ${Math.floor(diff / 3600)} ساعة`;
  if (diff < 604800) return `قبل ${Math.floor(diff / 86400)} يوم`;
  return new Date(ts).toLocaleDateString('ar-IQ');
};

// أقسام لوحة التحكم — أيقونات lucide احترافية موحّدة
const ADMIN_TABS = [
  { id: 'products', name: 'المنتجات', Icon: Package },
  { id: 'categories', name: 'الأقسام', Icon: FolderTree },
  { id: 'orders', name: 'الطلبات', Icon: ShoppingCart },
  { id: 'banners', name: 'البنرات', Icon: Image },
  { id: 'notifications', name: 'الإشعارات', Icon: Bell },
];

// حالات الطلب — مطابقة تمامًا لـ Order.STATUS_CHOICES في الباكند
const ORDER_STATUSES = [
  { value: 'pending', label: 'قيد الانتظار', tint: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'confirmed', label: 'مؤكد', tint: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'preparing', label: 'قيد التحضير', tint: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'shipped', label: 'قيد الشحن', tint: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'delivered', label: 'تم التسليم', tint: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'cancelled', label: 'ملغي', tint: 'bg-red-50 text-red-700 border-red-200' },
];

const getOrderStatusMeta = (status) =>
  ORDER_STATUSES.find((s) => s.value === status) ||
  // توافق مع بيانات قديمة قد تحمل 'completed'
  (status === 'completed'
    ? ORDER_STATUSES.find((s) => s.value === 'delivered')
    : { value: status, label: status || 'غير معروف', tint: 'bg-gray-100 text-gray-600 border-gray-200' });

// خريطة أيقونات ونبرة ألوان أنواع الإشعارات
const NOTIF_META = {
  new_order: { Icon: ShoppingCart, tint: 'bg-emerald-50 text-emerald-600' },
  order_status_changed: { Icon: PackageCheck, tint: 'bg-blue-50 text-blue-600' },
  low_stock: { Icon: AlertTriangle, tint: 'bg-amber-50 text-amber-600' },
  default: { Icon: Bell, tint: 'bg-gray-100 text-gray-500' },
};

const AdminPanel = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [banners, setBanners] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifRefreshing, setNotifRefreshing] = useState(false);
  const [notifTotal, setNotifTotal] = useState(0);
  const [notifNext, setNotifNext] = useState(null);
  const [notifLoadingMore, setNotifLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'product', 'category'
  const [editingItem, setEditingItem] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [homepageAction, setHomepageAction] = useState('show'); // 'show' or 'hide'
  const [activeFormTab, setActiveFormTab] = useState('basic'); // 'basic', 'pricing', 'inventory', 'images'
  const navigate = useNavigate();

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    discount: '',
    brand: '',
    show_on_homepage: true,
    discount_price: '',
    discount_start: '',
    discount_end: '',
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
    description: '',
    image_url: ''
  });
  const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false);

  // Banner Modal States
  const emptyBannerForm = {
    id: null,
    title: '',
    image_url: '',
    placement: 'home',
    link_url: '',
    display_order: 0,
    is_active: true,
  };
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerForm, setBannerForm] = useState(emptyBannerForm);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState('');
  const [bannerImageInputKey, setBannerImageInputKey] = useState(0);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerSaving, setBannerSaving] = useState(false);

  // Order Details Modal States
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // منع أي تمرير أفقي عرضي على مستوى الصفحة أثناء وجود لوحة التحكم
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflowX;
    const prevBody = document.body.style.overflowX;
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';
    return () => {
      document.documentElement.style.overflowX = prevHtml;
      document.body.style.overflowX = prevBody;
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
      fetchCategories();
    } else if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'banners') {
      fetchBanners();
    } else if (activeTab === 'notifications') {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [activeTab]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products/admin/banners/');
      setBanners(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const openBannerModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setBannerForm({
        id: banner.id ?? null,
        title: banner.title || '',
        image_url: banner.image_url || banner.image || '',
        placement: banner.placement || 'home',
        link_url: banner.link_url || '',
        display_order: banner.display_order ?? 0,
        is_active: banner.is_active ?? true,
      });
      setBannerPreviewUrl(banner.image_url || banner.image || '');
    } else {
      setEditingBanner(null);
      setBannerForm(emptyBannerForm);
      setBannerPreviewUrl('');
    }
    setBannerImageInputKey((value) => value + 1);
    setShowBannerModal(true);
  };

  const closeBannerModal = () => {
    if (bannerPreviewUrl && bannerPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(bannerPreviewUrl);
    }
    setShowBannerModal(false);
    setEditingBanner(null);
    setBannerForm(emptyBannerForm);
    setBannerPreviewUrl('');
    setBannerImageInputKey((value) => value + 1);
  };

  const handleBannerRemoveImage = () => {
    if (bannerPreviewUrl && bannerPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(bannerPreviewUrl);
    }
    setBannerPreviewUrl('');
    setBannerForm((prev) => ({ ...prev, image_url: '' }));
    setBannerImageInputKey((value) => value + 1);
  };

  // رفع صورة البنر إلى ImgBB (نفس آلية المنتجات) ثم تخزين الرابط في النموذج
  const handleBannerImageUpload = async (file) => {
    if (!file) return;
    setBannerUploading(true);
    setBannerPreviewUrl((current) => {
      if (current && current.startsWith('blob:')) {
        URL.revokeObjectURL(current);
      }
      return URL.createObjectURL(file);
    });
    try {
      const url = await handleImageUpload(file);
      if (url) {
        setBannerForm((prev) => ({ ...prev, image_url: url }));
      } else {
        alert('تعذّر رفع الصورة. حاول مرة أخرى.');
      }
    } finally {
      setBannerUploading(false);
    }
  };

  const handleBannerDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا البنر؟')) return;
    try {
      await api.delete(`/products/admin/banners/${id}/`);
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('تعذّر حذف البنر.');
    }
  };

  // حفظ البنر: إنشاء جديد (POST) أو تعديل قائم (PUT). يتطلب صورة مرفوعة أولاً.
  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    if (!bannerForm.image_url && !editingBanner) {
      alert('يرجى رفع صورة للبنر أولاً.');
      return;
    }
    setBannerSaving(true);
    try {
      const bannerId = editingBanner?.id ?? bannerForm.id;
      if (bannerId) {
        await api.put(`/products/admin/banners/${bannerId}/`, bannerForm);
      } else {
        await api.post('/products/admin/banners/', bannerForm);
      }
      await fetchBanners();
      closeBannerModal();
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('تعذّر حفظ البنر. تأكّد من صلاحياتك وحاول مجدداً.');
    } finally {
      setBannerSaving(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products/admin/products/');
      console.log('📦 Admin Products API Response (full):', response.data);
      
      // Ensure each product has normalized image data
      const normalizedProducts = response.data.map((product, idx) => {
        const normalized = {
          ...product,
          stock: product.stock_quantity || product.stock || 0,
          discount: product.discount_amount || 0,
          image: product.image || product.main_image_url || product.main_image,
        };
        
        // تسجيل بيانات الصور للمنتجات الثلاثة الأولى فقط
        if (idx < 3) {
          console.log(`📸 Product ${idx + 1}: ${product.name}`, {
            image: product.image,
            main_image: product.main_image,
            main_image_url: product.main_image_url,
            image_2: product.image_2,
            image_3: product.image_3,
            image_4: product.image_4,
            normalized_image: normalized.image
          });
        }
        
        return normalized;
      });
      
      console.log(`✅ Normalized ${normalizedProducts.length} products`);
      setProducts(normalizedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('خطأ في تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/');
      // الاستجابة قد تكون مصفوفة مباشرة أو مقسّمة صفحات ({results}) — نطبّعها لمصفوفة دائماً
      const data = response.data;
      setOrders(Array.isArray(data) ? data : (data?.results || []));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // تحديث حالة الطلب — تحديث تفاؤلي فوري مع تراجع تلقائي إن فشل الطلب
  const updateOrderStatus = async (orderId, newStatus) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target || target.status === newStatus) return;

    if (newStatus === 'cancelled' && !window.confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) return;

    const previousStatus = target.status;
    setUpdatingOrderId(orderId);
    // تحديث فوري بالواجهة قبل ردّ الخادم
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status: newStatus } : prev));

    try {
      await api.patch(`/orders/${orderId}/`, { status: newStatus });
    } catch (error) {
      console.error('Error updating order status:', error);
      // تراجع عن التحديث التفاؤلي
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: previousStatus } : o)));
      setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status: previousStatus } : prev));
      alert('تعذّر تحديث حالة الطلب. تأكّد من صلاحياتك وحاول مجدداً.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // silent = تحديث بدون إخفاء القائمة (يُستخدم لزر التحديث)
  const fetchNotifications = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const response = await api.get('/notifications/notifications/?all=true');
      // الاستجابة قد تكون مصفوفة أو مقسّمة صفحات ({results}) — نطبّعها لمصفوفة دائماً
      const data = response.data;
      const list = Array.isArray(data) ? data : (data?.results || []);
      setNotifications(list);
      setNotifTotal(Array.isArray(data) ? list.length : (data?.count ?? list.length));
      setNotifNext(Array.isArray(data) ? null : (data?.next || null));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (!silent) setNotifications([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // تحميل الصفحة التالية وإلحاقها بالقائمة (الإشعارات مقسّمة ٢٠ لكل صفحة)
  const loadMoreNotifications = async () => {
    if (!notifNext) return;
    setNotifLoadingMore(true);
    try {
      const response = await api.get(notifNext);
      const data = response.data;
      const list = Array.isArray(data) ? data : (data?.results || []);
      setNotifications((prev) => [...prev, ...list]);
      setNotifNext(Array.isArray(data) ? null : (data?.next || null));
    } catch (error) {
      console.error('Error loading more notifications:', error);
    } finally {
      setNotifLoadingMore(false);
    }
  };

  const refreshNotifications = async () => {
    setNotifRefreshing(true);
    try {
      await Promise.all([fetchNotifications({ silent: true }), fetchUnreadCount()]);
    } finally {
      setNotifRefreshing(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      console.log('Fetching unread count...');
      const response = await api.get('/notifications/notifications/unread_count/?all=true');
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

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`تم نسخ ${label} بنجاح: ${text}`);
    }).catch(err => {
      console.error('خطأ في النسخ:', err);
    });
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/notifications/${id}/mark_as_read/`);
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
      console.log('🖼️ بدء رفع الصورة...', file.name);
      const base64 = await toBase64(file);
      const formData = new FormData();
      // استخدام مفتاح API المقدم مباشرة
      formData.append('key', 'a2cebbc3daff0b042082a5d5d7a3b80d');
      formData.append('image', base64);

      const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        console.error('❌ ImgBB API Error:', response.status, response.statusText);
        throw new Error(`ImgBB API returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ نجح رفع الصورة:', data?.data?.url);
      
      if (data?.success === false) {
        console.error('❌ ImgBB Error Response:', data?.error);
        throw new Error(data?.error?.message || 'فشل رفع الصورة');
      }
      
      return data?.data?.url || null;
    } catch (error) {
      console.error('❌ خطأ في رفع الصورة لـ ImgBB:', error);
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

      console.log('📸 بدء عملية رفع الصور...', {
        mainImage: !!productForm.main_image,
        secondImage: !!productForm.second_image,
        thirdImage: !!productForm.third_image,
        fourthImage: !!productForm.fourth_image
      });

      if (productForm.main_image && typeof productForm.main_image !== 'string') {
        mainImageUrl = await handleImageUpload(productForm.main_image);
        console.log('✅ الصورة الرئيسية:', mainImageUrl);
        if (!mainImageUrl) {
          console.warn('⚠️ فشل في رفع الصورة الرئيسية، سيتم المتابعة بدونها');
          // نسمح بـ null أو استخدام placeholder - لا نرفض العملية كلياً
          mainImageUrl = null;
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
        stock_quantity: parseInt(productForm.stock),
        category: productForm.category,
        discount_amount: parseFloat(productForm.discount) || 0,
        brand: productForm.brand,
        show_on_homepage: productForm.show_on_homepage,
        discount_price: parseFloat(productForm.discount_price) || null,
        discount_start: productForm.discount_start || null,
        discount_end: productForm.discount_end || null,
        main_image: mainImageUrl,
        image_2: secondImageUrl,
        image_3: thirdImageUrl,
        image_4: fourthImageUrl
      };

      console.log('📤 بيانات المنتج المرسلة للـ API:', productData);

      let response;
      if (editingItem) {
        console.log('✏️ تعديل المنتج...');
        response = await api.put(`/products/admin/products/${editingItem.id}/`, productData);
      } else {
        console.log('➕ إضافة منتج جديد...');
        response = await api.post('/products/admin/products/', productData);
      }
      
      console.log('✅ نجح! الـ API Response:', response.data);

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
        brand: '',
        show_on_homepage: true,
        discount_price: '',
        discount_start: '',
        discount_end: '',
        main_image: null,
        second_image: null,
        third_image: null,
        fourth_image: null,
        main_image_url: '',
        second_image_url: '',
        third_image_url: '',
        fourth_image_url: ''
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
        await api.put(`/products/categories/${editingItem.id}/`, categoryForm);
      } else {
        await api.post('/products/categories/', categoryForm);
      }

      fetchCategories();
      setShowModal(false);
      setEditingItem(null);
      setCategoryForm({
        name: '',
        description: '',
        image_url: ''
      });
    } catch (error) {
      console.error('Error saving category:', error);
      alert('حدث خطأ في حفظ القسم');
    } finally {
      setLoading(false);
    }
  };

  // Handle product selection
  const toggleProductSelection = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  // Toggle all products selection
  const toggleAllProducts = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  // Execute homepage action (show/hide) for selected products
  const handleExecuteHomepageAction = async () => {
    if (selectedProducts.size === 0) {
      alert('يرجى تحديد منتجات أولاً');
      return;
    }

    const action = homepageAction === 'show' ? 'إظهار' : 'إخفاء';
    if (!window.confirm(`هل تريد ${action} ${selectedProducts.size} منتج في الصفحة الرئيسية؟`)) {
      return;
    }

    try {
      setLoading(true);
      const updatePromises = Array.from(selectedProducts).map(productId => {
        const product = products.find(p => p.id === productId);
        return api.put(`/products/admin/products/${productId}/`, {
          ...product,
          show_on_homepage: homepageAction === 'show'
        });
      });

      await Promise.all(updatePromises);
      
      setSelectedProducts(new Set());
      fetchProducts();
      alert(`تم ${action} المنتجات بنجاح`);
    } catch (error) {
      console.error('Error executing homepage action:', error);
      alert('حدث خطأ في تنفيذ الإجراء');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;

    try {
      if (type === 'products') {
        await api.delete(`/products/admin/products/${id}/`);
        fetchProducts();
      } else if (type === 'categories') {
        await api.delete(`/products/categories/${id}/`);
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
          brand: item.brand || '',
          show_on_homepage: item.show_on_homepage !== undefined ? item.show_on_homepage : true,
          discount_price: item.discount_price?.toString() || '',
          discount_start: item.discount_start ? new Date(item.discount_start).toISOString().slice(0, 16) : '',
          discount_end: item.discount_end ? new Date(item.discount_end).toISOString().slice(0, 16) : '',
          main_image: null,
          second_image: null,
          third_image: null,
          fourth_image: null,
          main_image_url: item.main_image || item.main_image_url || '',
          second_image_url: item.image_2 || item.second_image_url || '',
          third_image_url: item.image_3 || item.third_image_url || '',
          fourth_image_url: item.image_4 || item.fourth_image_url || ''
        });
      } else {
        setProductForm({
          name: '',
          description: '',
          price: '',
          stock: '',
          category: '',
          discount: '',
          brand: '',
          show_on_homepage: true,
          discount_price: '',
          discount_start: '',
          discount_end: '',
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
          description: item.description || '',
          image_url: item.image_url || item.image || ''
        });
      } else {
        setCategoryForm({
          name: '',
          description: '',
          image_url: ''
        });
      }
    }

    setShowModal(true);
  };

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailsModal(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const activeTabMeta = ADMIN_TABS.find((t) => t.id === activeTab) || ADMIN_TABS[0];

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden max-w-full" dir="rtl">
      {/* ===== Sidebar (سطح المكتب فقط) — عمود التنقّل الثابت يمينًا ===== */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-white border-l border-gray-200 sticky top-0 h-screen">
        {/* هوية اللوحة */}
        <Link to="/" className="flex items-center gap-2.5 h-16 px-5 border-b border-gray-100 cursor-pointer">
          <div className="bg-gray-900 text-white w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
            <LayoutGrid className="h-[18px] w-[18px]" strokeWidth={2} />
          </div>
          <div className="leading-tight">
            <div className="text-base font-extrabold tracking-[0.16em] text-gray-900">VORO</div>
            <div className="text-[11px] text-gray-400 -mt-0.5">لوحة الإدارة</div>
          </div>
        </Link>

        {/* أقسام التنقّل */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {ADMIN_TABS.map(({ id, name, Icon }) => {
            const active = activeTab === id;
            const showBadge = id === 'notifications' && unreadCount > 0;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                aria-current={active ? 'page' : undefined}
                className={`group relative w-full flex items-center gap-3 h-11 px-3.5 rounded-xl text-[15px] font-medium transition-all duration-200 cursor-pointer ${
                  active ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-[19px] w-[19px] shrink-0" strokeWidth={active ? 2 : 1.75} />
                <span className="flex-1 text-right">{name}</span>
                {showBadge && (
                  <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-[11px] leading-none font-bold flex items-center justify-center ${active ? 'bg-white text-gray-900' : 'bg-red-500 text-white'}`}>
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* أسفل الشريط: المتجر + خروج */}
        <div className="p-3 border-t border-gray-100 space-y-1">
          <Link to="/" className="w-full flex items-center gap-3 h-10 px-3.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer">
            <Store className="h-[18px] w-[18px]" strokeWidth={1.75} />
            عرض المتجر
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 h-10 px-3.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* ===== منطقة المحتوى ===== */}
      <div className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
        {/* الشريط العلوي: عنوان القسم الحالي يمينًا، الحساب يسارًا */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 min-w-0 overflow-x-hidden">
          <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* يمين: هوية الموبايل + عنوان القسم */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="lg:hidden bg-gray-900 text-white w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
                <LayoutGrid className="h-[18px] w-[18px]" strokeWidth={2} />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <activeTabMeta.Icon className="h-5 w-5 text-gray-400 shrink-0 hidden lg:block" strokeWidth={1.75} />
                <h1 className="text-lg font-bold text-gray-900 truncate">{activeTabMeta.name}</h1>
              </div>
            </div>

            {/* يسار: تحديث الإشعارات (عند فتح تبويبها) + بيانات المستخدم */}
            <div className="flex items-center gap-3 shrink-0">
              {activeTab === 'notifications' && (
                <button
                  onClick={refreshNotifications}
                  disabled={notifRefreshing}
                  title="تحديث"
                  aria-label="تحديث الإشعارات"
                  className="inline-flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <RefreshCw className={`h-4 w-4 ${notifRefreshing ? 'animate-spin' : ''}`} strokeWidth={1.75} />
                  <span className="hidden sm:inline">تحديث</span>
                </button>
              )}
              <div className="text-left leading-tight hidden sm:block">
                <div className="text-[13px] font-semibold text-gray-800">{user?.phone}</div>
                <div className="text-[11px] text-gray-400">مشرف</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm shrink-0">
                {user?.phone?.slice(-2) || 'م'}
              </div>
            </div>
          </div>

          {/* شريط الأقسام الأفقي — الموبايل فقط (بديل الـ sidebar) */}
          <div className="lg:hidden border-t border-gray-100 bg-gray-50/60 w-full min-w-0 overflow-hidden">
            <nav className="flex gap-1 overflow-x-auto scrollbar-hide px-4 py-2 w-full">
              {ADMIN_TABS.map(({ id, name, Icon }) => {
                const active = activeTab === id;
                const showBadge = id === 'notifications' && unreadCount > 0;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    aria-current={active ? 'page' : undefined}
                    className={`relative inline-flex items-center gap-2 h-9 px-3.5 rounded-lg text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer ${
                      active ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2 : 1.75} />
                    {name}
                    {showBadge && (
                      <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] leading-none font-bold flex items-center justify-center ${active ? 'bg-white text-gray-900' : 'bg-red-500 text-white'}`}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </header>

        {/* تبويب الإشعارات يُعرض خارج هذه الحاوية، فنلغي حشوتها الرأسية عندها
            حتى لا تترك فراغاً فارغاً فوق البطاقات */}
        <div className={`w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 overflow-x-clip ${activeTab === 'notifications' ? '' : 'py-6 md:py-8'}`}>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900">إدارة المنتجات</h2>
              <button
                onClick={() => openModal('product')}
                className="w-full sm:w-auto btn-primary"
              >
                + إضافة منتج جديد
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <>
                {/* Action buttons for selected items */}
                {selectedProducts.size > 0 && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <span className="text-blue-900 font-semibold">
                      تم تحديد {selectedProducts.size} منتج
                    </span>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <select
                        value={homepageAction}
                        onChange={(e) => setHomepageAction(e.target.value)}
                        className="flex-1 md:flex-none px-3 py-2 border border-blue-300 rounded-md text-sm bg-white"
                      >
                        <option value="show">إظهار في الرئيسية</option>
                        <option value="hide">إخفاء من الرئيسية</option>
                      </select>
                      <button
                        onClick={handleExecuteHomepageAction}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-bold"
                      >
                        نفذ
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full min-w-0">
                  {/* Table view for desktop */}
                  <div className="hidden md:block overflow-x-auto w-full">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-900 text-white">
                        <tr>
                          <th className="px-6 py-3 text-center text-sm font-medium uppercase tracking-wider w-12">
                            <input
                              type="checkbox"
                              checked={selectedProducts.size === products.length && products.length > 0}
                              onChange={toggleAllProducts}
                              className="w-4 h-4 cursor-pointer"
                            />
                          </th>
                          <th className="px-6 py-3 text-right text-sm font-medium uppercase tracking-wider">
                            الصورة
                          </th>
                        <th className="px-6 py-3 text-right text-sm font-medium uppercase tracking-wider">
                          المنتج
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-medium uppercase tracking-wider">
                          القسم
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-medium uppercase tracking-wider">
                          السعر
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-medium uppercase tracking-wider">
                          المخزون
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-medium uppercase tracking-wider">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              checked={selectedProducts.has(product.id)}
                              onChange={() => toggleProductSelection(product.id)}
                              className="w-4 h-4 cursor-pointer"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <img
                              className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                              src={product.image || product.main_image || product.main_image_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect fill="%23f3f4f6" width="80" height="80"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="10" dy="2.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3Eلا توجد صورة%3C/text%3E%3C/svg%3E'}
                              alt={product.name}
                              title={product.name}
                              onError={(e) => {
                                console.warn(`❌ Failed to load image for product: ${product.name}`, e.target.src);
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect fill="%23f3f4f6" width="80" height="80"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="10" dy="2.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3Eلا توجد صورة%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-base font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-2">
                                {product.description?.substring(0, 60)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {product.category?.name || 'غير محدد'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                            {product.price} د.ع
                            {product.discount > 0 && (
                              <span className="text-red-500 text-xs mr-1">
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => openModal('product', product)}
                                aria-label="تعديل"
                                title="تعديل"
                                className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                              >
                                <Pencil className="h-4 w-4" strokeWidth={1.75} />
                              </button>
                              <button
                                onClick={() => handleDelete('products', product.id)}
                                aria-label="حذف"
                                title="حذف"
                                className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>

                  {/* Card view for mobile */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {products.map((product) => (
                      <div key={product.id} className="p-4 flex flex-col space-y-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                            className="w-5 h-5 shrink-0 cursor-pointer"
                          />
                          <img
                            className="h-16 w-16 shrink-0 rounded-lg object-cover border border-gray-200"
                            src={product.image || product.main_image || product.main_image_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect fill="%23f3f4f6" width="80" height="80"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="10" dy="2.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3Eلا توجد صورة%3C/text%3E%3C/svg%3E'}
                            alt={product.name}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-gray-900 break-words">{product.name}</div>
                            <div className="text-xs text-gray-500 truncate">{product.category?.name || 'غير محدد'}</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <div className="font-bold text-primary-600">{product.price} د.ع</div>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${product.stock > 10
                                ? 'bg-green-100 text-green-800'
                                : product.stock > 0
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                            المخزون: {product.stock}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal('product', product)}
                            className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-xs"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDelete('products', product.id)}
                            className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-xs"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-900 text-white">
                      <tr>
                        <th className="px-6 py-3 text-right text-sm font-bold uppercase tracking-wider">
                          رقم الطلب
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-bold uppercase tracking-wider">
                          العميل
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-bold uppercase tracking-wider">
                          رقم الهاتف
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-bold uppercase tracking-wider">
                          المبلغ الإجمالي
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-bold uppercase tracking-wider">
                          الحالة
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-bold uppercase tracking-wider">
                          التاريخ
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-bold uppercase tracking-wider">
                          التفاصيل
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order.id?.toString().substring(0, 8)}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                            <div className="flex items-center gap-2">
                              <span>{order.customer_name || 'غير محدد'}</span>
                              {order.customer_name && (
                                <button 
                                  onClick={() => copyToClipboard(order.customer_name, 'اسم الزبون')}
                                  className="text-primary-600 hover:text-primary-800 p-1"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                            <div className="flex items-center gap-2">
                              <span>{order.customer_phone || order.user?.phone || 'غير محدد'}</span>
                              {(order.customer_phone || order.user?.phone) && (
                                <button 
                                  onClick={() => copyToClipboard(order.customer_phone || order.user?.phone, 'رقم الهاتف')}
                                  className="text-primary-600 hover:text-primary-800 p-1"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 font-bold">
                            {order.total_amount || order.total} د.ع
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            <select
                              value={order.status || 'pending'}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              disabled={updatingOrderId === order.id}
                              aria-label="حالة الطلب"
                              className={`text-sm font-bold rounded-lg border px-3 py-1.5 pl-8 cursor-pointer outline-none transition-colors disabled:opacity-50 disabled:cursor-wait focus:ring-2 focus:ring-gray-900/10 ${getOrderStatusMeta(order.status).tint}`}
                            >
                              {ORDER_STATUSES.map((s) => (
                                <option key={s.value} value={s.value} className="bg-white text-gray-900 font-medium">
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700 font-medium">
                            {new Date(order.created_at).toLocaleDateString('ar-SA')}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm">
                            <button 
                              onClick={() => showOrderDetails(order)}
                              className="text-primary-600 hover:text-primary-800 font-bold underline"
                            >
                              عرض
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden divide-y divide-gray-200">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 flex flex-col space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500">#{order.id?.toString().substring(0, 8)}</span>
                        <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('ar-SA')}</span>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <div className="text-sm font-bold text-gray-900">{order.customer_name || 'غير محدد'}</div>
                        <div className="text-xs text-gray-600">{order.customer_phone || order.user?.phone || 'غير محدد'}</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="font-bold text-gray-900">{order.total_amount || order.total} د.ع</div>
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${getOrderStatusMeta(order.status).tint}`}>
                          {getOrderStatusMeta(order.status).label}
                        </span>
                      </div>
                      {/* تغيير الحالة مباشرة من البطاقة */}
                      <select
                        value={order.status || 'pending'}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        disabled={updatingOrderId === order.id}
                        aria-label="تغيير حالة الطلب"
                        className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-800 cursor-pointer outline-none focus:ring-2 focus:ring-gray-900/10 disabled:opacity-50 disabled:cursor-wait"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => showOrderDetails(order)}
                        className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-xs hover:bg-gray-200 transition-colors"
                      >
                        عرض التفاصيل
                      </button>
                    </div>
                  ))}
                </div>
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
                {/* Form Tabs */}
                <div className="flex border-b border-gray-200 mb-4 overflow-x-auto hide-scrollbar">
                  <button
                    type="button"
                    onClick={() => setActiveFormTab('basic')}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeFormTab === 'basic' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    المعلومات الأساسية
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFormTab('pricing')}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeFormTab === 'pricing' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    التسعير والخصومات
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFormTab('inventory')}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeFormTab === 'inventory' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    إدارة المخزون
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFormTab('images')}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeFormTab === 'images' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    صور المنتج
                  </button>
                </div>

                {/* Tab Content: Basic Info */}
                {activeFormTab === 'basic' && (
                  <div className="space-y-4">
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
                          العلامة التجارية (اختياري)
                        </label>
                        <input
                          type="text"
                          value={productForm.brand}
                          onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                          placeholder="Samsung, Apple..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        إظهار في الواجهة الرئيسية
                      </label>
                      <select
                        value={productForm.show_on_homepage ? 'true' : 'false'}
                        onChange={(e) => setProductForm({ ...productForm, show_on_homepage: e.target.value === 'true' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="true">نعم - إظهار في الواجهة الرئيسية</option>
                        <option value="false">لا - إخفاء من الواجهة الرئيسية</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Tab Content: Pricing & Discounts */}
                {activeFormTab === 'pricing' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg mb-4">
                      <p className="text-sm text-blue-700">يمكنك تحديد سعر ثابت أو تفعيل نظام الخصومات الموقوتة من هنا.</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        السعر الأصلي (د.ع)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 font-bold text-lg"
                      />
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="font-bold text-red-600 mb-4 flex items-center gap-2">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        نظام الخصومات الموقوتة
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            السعر بعد الخصم (د.ع)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={productForm.discount_price}
                            onChange={(e) => setProductForm({ ...productForm, discount_price: e.target.value })}
                            className="w-full px-3 py-2 border border-red-300 rounded-md focus:ring-red-500 focus:border-red-500 text-red-600 font-bold"
                            placeholder="مثلاً: 15000"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            قيمة الخصم المباشر (د.ع)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={productForm.discount}
                            onChange={(e) => setProductForm({ ...productForm, discount: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            تاريخ ووقت بدء الخصم
                          </label>
                          <input
                            type="datetime-local"
                            value={productForm.discount_start}
                            onChange={(e) => setProductForm({ ...productForm, discount_start: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            تاريخ ووقت انتهاء الخصم
                          </label>
                          <input
                            type="datetime-local"
                            value={productForm.discount_end}
                            onChange={(e) => setProductForm({ ...productForm, discount_end: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content: Inventory */}
                {activeFormTab === 'inventory' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 rounded-lg mb-4 text-orange-800 text-sm">
                      تحكم في كمية المنتج المتاحة للبيع. سيظهر وسم "نفد المخزون" تلقائياً عندما تصل الكمية لـ 0.
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الكمية المتوفرة في المخزن
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 font-bold text-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Tab Content: Images */}
                {activeFormTab === 'images' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Main Image */}
                      <div className="border p-4 rounded-lg bg-gray-50">
                        <label className="block text-sm font-bold text-gray-700 mb-2">الصورة الرئيسية (غلاف المنتج)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setProductForm({ ...productForm, main_image: e.target.files[0] })}
                          className="w-full text-xs"
                        />
                        {(productForm.main_image_url || productForm.main_image) && (
                          <div className="mt-2 relative group">
                            <img
                              src={productForm.main_image instanceof File ? URL.createObjectURL(productForm.main_image) : productForm.main_image_url}
                              alt="Preview"
                              className="h-32 w-full object-contain rounded border bg-white"
                            />
                            <div className="absolute top-1 right-1 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">رئيسية</div>
                          </div>
                        )}
                      </div>

                      {/* Second Image */}
                      <div className="border p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">الصورة الثانية</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setProductForm({ ...productForm, second_image: e.target.files[0] })}
                          className="w-full text-xs"
                        />
                        {(productForm.second_image_url || productForm.second_image) && (
                          <img
                            src={productForm.second_image instanceof File ? URL.createObjectURL(productForm.second_image) : productForm.second_image_url}
                            alt="Preview"
                            className="mt-2 h-32 w-full object-contain rounded border bg-white"
                          />
                        )}
                      </div>

                      {/* Third Image */}
                      <div className="border p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">الصورة الثالثة</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setProductForm({ ...productForm, third_image: e.target.files[0] })}
                          className="w-full text-xs"
                        />
                        {(productForm.third_image_url || productForm.third_image) && (
                          <img
                            src={productForm.third_image instanceof File ? URL.createObjectURL(productForm.third_image) : productForm.third_image_url}
                            alt="Preview"
                            className="mt-2 h-32 w-full object-contain rounded border bg-white"
                          />
                        )}
                      </div>

                      {/* Fourth Image */}
                      <div className="border p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">الصورة الرابعة</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setProductForm({ ...productForm, fourth_image: e.target.files[0] })}
                          className="w-full text-xs"
                        />
                        {(productForm.fourth_image_url || productForm.fourth_image) && (
                          <img
                            src={productForm.fourth_image instanceof File ? URL.createObjectURL(productForm.fourth_image) : productForm.fourth_image_url}
                            alt="Preview"
                            className="mt-2 h-32 w-full object-contain rounded border bg-white"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4 space-x-reverse pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'جاري الحفظ...' : 'حفظ المنتج النهائي'}
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

                {/* صورة القسم — تظهر في بطاقة القسم بالمتجر */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    صورة القسم
                  </label>
                  <div className="flex items-center gap-4">
                    {categoryForm.image_url ? (
                      <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                        <img src={categoryForm.image_url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setCategoryForm({ ...categoryForm, image_url: '' })}
                          className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black"
                          aria-label="إزالة الصورة"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 shrink-0 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-xs">
                        لا صورة
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingCategoryImage(true);
                          const url = await handleImageUpload(file);
                          setUploadingCategoryImage(false);
                          if (url) {
                            setCategoryForm((prev) => ({ ...prev, image_url: url }));
                          } else {
                            alert('فشل رفع الصورة، حاول مرة أخرى');
                          }
                          e.target.value = '';
                        }}
                        className="block w-full text-sm text-gray-600 file:ml-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary-900 file:text-white file:cursor-pointer hover:file:bg-black"
                      />
                      {uploadingCategoryImage && (
                        <p className="text-xs text-gray-500 mt-1">جاري رفع الصورة...</p>
                      )}
                      <input
                        type="url"
                        placeholder="أو الصق رابط صورة مباشر"
                        value={categoryForm.image_url}
                        onChange={(e) => setCategoryForm({ ...categoryForm, image_url: e.target.value })}
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
                        dir="ltr"
                      />
                    </div>
                  </div>
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

      {/* Banners Tab */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-gray-900">إدارة البنرات</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  رتّب البنرات حسب مكان الظهور، راقب الحالة والترتيب، وأضف بنرًا جديدًا بسرعة من نفس الصفحة.
                </p>
              </div>
              <button onClick={() => openBannerModal()} className="w-full sm:w-auto btn-primary">
                + إضافة بنر جديد
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: 'إجمالي البنرات', value: banners.length },
                { label: 'البنرات الفعّالة', value: banners.filter((banner) => banner.is_active).length },
                { label: 'أماكن العرض', value: new Set(banners.map((banner) => banner.placement || 'home')).size },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                  <div className="text-xs font-medium text-gray-400">{stat.label}</div>
                  <div className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {[
                { key: 'home', label: 'بنرات الصفحة الرئيسية', GroupIcon: Home },
                { key: 'offers', label: 'بنرات صفحة العروض', GroupIcon: Tag },
              ].map(({ key, label, GroupIcon }) => {
                const group = banners
                  .filter((b) => (b.placement || 'home') === key)
                  .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
                return (
                  <section key={key} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                          <GroupIcon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                        </div>
                        <div>
                          <h3 className="text-[15px] font-bold text-gray-900">{label}</h3>
                          <p className="mt-0.5 text-xs text-gray-500">رتّب البنرات داخل هذا المكان، وراجِع الحالة والظهور بسرعة.</p>
                        </div>
                      </div>
                      <span className="self-start text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2.5 py-1">{group.length} بنر</span>
                    </div>

                    {group.length === 0 ? (
                      <button
                        onClick={openBannerModal}
                        className="mt-4 w-full flex flex-col items-center justify-center gap-2 py-11 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-900 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <Plus className="h-6 w-6" strokeWidth={1.75} />
                        <span className="text-sm font-medium">أضف أول بنر لهذا المكان</span>
                        <span className="text-xs text-gray-400">سيظهر هنا بعد حفظه مباشرة</span>
                      </button>
                    ) : (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                        {group.map((banner) => (
                          <div key={banner.id} className="group overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm transition-all hover:border-gray-300 hover:shadow-md">
                            <div className="relative aspect-[16/9] bg-gray-100">
                              {(banner.image || banner.image_url) ? (
                                <img
                                  src={banner.image || banner.image_url}
                                  alt={banner.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <Image className="h-9 w-9" strokeWidth={1.5} />
                                </div>
                              )}
                              <span className="absolute top-2.5 left-2.5 inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-700 backdrop-blur-sm">
                                {key === 'home' ? 'الرئيسية' : 'العروض'}
                              </span>
                              <span className={`absolute top-2.5 right-2.5 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full backdrop-blur-sm ${
                                banner.is_active ? 'bg-white/90 text-emerald-600' : 'bg-gray-900/80 text-white'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${banner.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                                {banner.is_active ? 'ظاهر' : 'مخفي'}
                              </span>
                            </div>
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h4 className="font-bold text-sm text-gray-900 truncate">{banner.title || 'بدون عنوان'}</h4>
                                  {banner.link_url && (
                                    <p className="mt-1 truncate text-xs text-gray-500">{banner.link_url}</p>
                                  )}
                                </div>
                                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-medium text-gray-500 border border-gray-200">
                                  <GripVertical className="h-3.5 w-3.5" strokeWidth={2} />
                                  {banner.display_order ?? 0}
                                </span>
                              </div>
                              <div className="mt-4 grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => openBannerModal(banner)}
                                  className="inline-flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                  <Pencil className="h-4 w-4" strokeWidth={1.75} />
                                  تعديل
                                </button>
                                <button
                                  onClick={() => handleBannerDelete(banner.id)}
                                  aria-label="حذف البنر"
                                  className="inline-flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm font-medium text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                                  حذف
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Banner Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeBannerModal}>
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editingBanner ? 'تعديل البنر' : 'بنر جديد'}</h3>
              <button onClick={closeBannerModal} aria-label="إغلاق" className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer">
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <div className="grid gap-0 md:grid-cols-[1.15fr_0.85fr]">
              <form onSubmit={handleBannerSubmit} className="p-5 space-y-4 border-b md:border-b-0 md:border-r border-gray-100">
                {/* الصورة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">صورة البنر</label>
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4">
                    <input
                      key={bannerImageInputKey}
                      id="banner-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleBannerImageUpload(e.target.files?.[0])}
                      className="sr-only"
                    />
                    <label
                      htmlFor="banner-image-upload"
                      className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-6 text-center transition-colors hover:border-gray-300 hover:bg-gray-50"
                    >
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-gray-900 text-white shadow-sm">
                        <Plus className="h-5 w-5" strokeWidth={2} />
                      </span>
                      <span className="text-sm font-medium text-gray-900">اختيار صورة من اللابتوب</span>
                      <span className="text-xs text-gray-500">PNG أو JPG أو WEBP. اضغط هنا لفتح مستعرض الملفات.</span>
                    </label>
                    {(bannerPreviewUrl || bannerForm.image_url) && (
                      <div className="mt-3 space-y-2">
                        <img
                          src={bannerPreviewUrl || bannerForm.image_url}
                          alt="معاينة البنر"
                          className="w-full h-40 object-cover rounded-2xl border border-gray-100"
                        />
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleBannerRemoveImage}
                            className="text-xs font-medium text-red-600 hover:text-red-700"
                          >
                            إزالة الصورة
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {bannerUploading && <p className="text-xs text-gray-600 mt-1.5">جارٍ رفع الصورة…</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* المكان */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">مكان الظهور</label>
                    <select
                      value={bannerForm.placement}
                      onChange={(e) => setBannerForm({ ...bannerForm, placement: e.target.value })}
                      className="input-field"
                    >
                      <option value="home">الصفحة الرئيسية</option>
                      <option value="offers">صفحة العروض</option>
                    </select>
                  </div>
                  {/* الترتيب */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ترتيب العرض</label>
                    <input type="number" value={bannerForm.display_order} onChange={(e) => setBannerForm({ ...bannerForm, display_order: Number(e.target.value) })} className="input-field" />
                  </div>
                </div>

                {/* العنوان */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
                  <input type="text" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} className="input-field" placeholder="عنوان البنر" />
                </div>

                {/* رابط التوجيه */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رابط التوجيه (اختياري)</label>
                  <input type="text" value={bannerForm.link_url} onChange={(e) => setBannerForm({ ...bannerForm, link_url: e.target.value })} className="input-field" placeholder="/offers أو https://…" />
                </div>

                {/* التفعيل */}
                <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-gray-200 px-3 py-3 bg-gray-50">
                  <input type="checkbox" checked={bannerForm.is_active} onChange={(e) => setBannerForm({ ...bannerForm, is_active: e.target.checked })} className="w-5 h-5" />
                  <span className="text-sm text-gray-700">مفعّل</span>
                </label>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button type="submit" disabled={bannerSaving || bannerUploading} className="flex-1 btn-primary disabled:opacity-50">
                    {bannerSaving ? 'جارٍ الحفظ…' : (editingBanner ? 'حفظ التعديلات' : 'إضافة البنر')}
                  </button>
                  <button type="button" onClick={closeBannerModal} className="px-5 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">إلغاء</button>
                </div>
              </form>

              <aside className="p-5 bg-gray-50/80">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-bold text-gray-900">معاينة سريعة</h4>
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-white border border-gray-200 text-gray-600">
                    {bannerForm.placement === 'home' ? 'الرئيسية' : 'العروض'}
                  </span>
                </div>

                <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-white overflow-hidden">
                  {(bannerPreviewUrl || bannerForm.image_url) ? (
                    <div className="space-y-2 p-2">
                      <img src={bannerPreviewUrl || bannerForm.image_url} alt="معاينة البنر" className="w-full h-44 object-cover rounded-xl" />
                      <div className="flex justify-end px-1 pb-1">
                        <button
                          type="button"
                          onClick={handleBannerRemoveImage}
                          className="text-xs font-medium text-red-600 hover:text-red-700"
                        >
                          إزالة الصورة
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-44 flex flex-col items-center justify-center text-gray-400 gap-2">
                      <Image className="h-8 w-8" strokeWidth={1.5} />
                      <span className="text-sm">أضف صورة لتظهر هنا</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-2 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-400">العنوان</span>
                    <span className="font-medium text-gray-900 truncate text-left">{bannerForm.title || 'بدون عنوان'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-400">الترتيب</span>
                    <span className="font-medium text-gray-900">{bannerForm.display_order ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-gray-400">الحالة</span>
                    <span className={`font-medium ${bannerForm.is_active ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {bannerForm.is_active ? 'مفعّل' : 'مخفي'}
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-6 text-gray-500">
                  نصيحة: ابدأ بالصورة، ثم اضبط المكان والترتيب، وبعدها تأكد من ظهور عنوان واضح ورابط صحيح قبل الحفظ.
                </p>
              </aside>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-gray-900"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-center py-16 px-6">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                <Bell className="h-7 w-7" strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">لا توجد إشعارات</h3>
              <p className="text-sm text-gray-500">ستظهر هنا الطلبات الجديدة والتنبيهات عند وصولها</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {notifications.map((notification) => {
                const meta = NOTIF_META[notification.type] || NOTIF_META.default;
                const NotifIcon = meta.Icon;
                return (
                  <div
                    key={notification.id}
                    onClick={() => { if (!notification.is_read) markAsRead(notification.id); }}
                    className={`relative bg-white rounded-2xl border transition-colors p-4 ${
                      notification.is_read
                        ? 'border-gray-200'
                        : 'border-gray-300 bg-gray-50/60 cursor-pointer hover:bg-gray-50'
                    }`}
                  >
                    {!notification.is_read && (
                      <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500" aria-label="غير مقروء"></span>
                    )}
                    <div className="flex items-start gap-3.5">
                      {/* أيقونة النوع */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.tint}`}>
                        <NotifIcon className="h-5 w-5" strokeWidth={1.75} />
                      </div>

                      <div className="flex-1 min-w-0 pl-3">
                        <div className="flex items-baseline justify-between gap-3">
                          <h4 className={`text-sm truncate ${notification.is_read ? 'font-semibold text-gray-800' : 'font-bold text-gray-900'}`}>
                            {notification.title}
                          </h4>
                          <span
                            className="shrink-0 text-[11px] text-gray-400"
                            title={new Date(notification.created_at).toLocaleString('ar-IQ')}
                          >
                            {timeAgo(notification.created_at)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 leading-relaxed">{notification.message}</p>

                        {notification.type === 'new_order' && notification.data && (
                          <div className="mt-2.5 inline-flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                            <span className="text-gray-500">العميل: <span className="text-gray-800 font-medium">{notification.data.customer_name || '—'}</span></span>
                            <span className="text-gray-500">المبلغ: <span className="text-gray-900 font-bold tabular-nums">{Number(notification.data.total || 0).toLocaleString('en-US')} د.ع</span></span>
                            {notification.data.order_id && (
                              <span className="text-gray-400 font-mono" dir="ltr">#{String(notification.data.order_id).slice(0, 8)}</span>
                            )}
                          </div>
                        )}

                        {notification.type === 'new_order' && (
                          <div className="mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!notification.is_read) markAsRead(notification.id);
                                setActiveTab('orders');
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-900 hover:text-black transition-colors cursor-pointer"
                            >
                              عرض الطلبات
                              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* تحميل المزيد — الإشعارات تُجلب ٢٠ لكل صفحة */}
              {notifNext && (
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={loadMoreNotifications}
                    disabled={notifLoadingMore}
                    className="inline-flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    {notifLoadingMore ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                        جاري التحميل…
                      </>
                    ) : (
                      <>عرض المزيد ({notifications.length} من {notifTotal})</>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">تفاصيل الطلب #{selectedOrder.id}</h3>
              <button
                onClick={() => setShowOrderDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">اسم العميل</p>
                <p className="font-semibold text-gray-900">{selectedOrder.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">رقم الهاتف</p>
                <p className="font-semibold text-gray-900">{selectedOrder.customer_phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">المحافظة</p>
                <p className="font-semibold text-gray-900">{selectedOrder.governorate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">طريقة الدفع</p>
                <p className="font-semibold text-gray-900">
                  {selectedOrder.payment_method === 'cash_on_delivery' ? 'الدفع عند الاستلام' : 'تحويل بنكي'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">الحالة</p>
                <select
                  value={selectedOrder.status || 'pending'}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  disabled={updatingOrderId === selectedOrder.id}
                  aria-label="تغيير حالة الطلب"
                  className={`w-full h-10 px-3 rounded-lg border text-sm font-bold cursor-pointer outline-none focus:ring-2 focus:ring-gray-900/10 disabled:opacity-50 disabled:cursor-wait ${getOrderStatusMeta(selectedOrder.status).tint}`}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s.value} value={s.value} className="bg-white text-gray-900 font-medium">
                      {s.label}
                    </option>
                  ))}
                </select>
                {updatingOrderId === selectedOrder.id && (
                  <p className="text-xs text-gray-500 mt-1">جارٍ الحفظ…</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">التاريخ</p>
                <p className="font-semibold text-gray-900">{new Date(selectedOrder.created_at).toLocaleDateString('ar-IQ')}</p>
              </div>

              {/* العنوان — يمتد على العمودين لأنه نص طويل */}
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">العنوان</p>
                <p className="font-semibold text-gray-900 break-words whitespace-pre-wrap">
                  {selectedOrder.customer_address || '—'}
                </p>
              </div>

              {selectedOrder.additional_info && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">ملاحظات إضافية</p>
                  <p className="font-semibold text-gray-900 break-words whitespace-pre-wrap">
                    {selectedOrder.additional_info}
                  </p>
                </div>
              )}
            </div>

            {/* Order Items with Images */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">المنتجات</h4>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {/* Product Image */}
                      {item.product_image && (
                        <div className="flex-shrink-0 flex justify-center">
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-24 h-24 sm:w-20 sm:h-20 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"%3E%3Crect fill="%23f3f4f6" width="96" height="96"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="12" dy="3.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3Eلا توجد صورة%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Product Info */}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm md:text-base text-center sm:text-right">{item.product_name}</p>
                        <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-gray-600">
                          <div className="text-center sm:text-right">
                            <p className="text-gray-500">السعر</p>
                            <p className="font-bold text-gray-900">{item.price}</p>
                          </div>
                          <div className="text-center sm:text-right">
                            <p className="text-gray-500">الكمية</p>
                            <p className="font-bold text-gray-900">{item.quantity}</p>
                          </div>
                          <div className="text-center sm:text-right">
                            <p className="text-gray-500">الإجمالي</p>
                            <p className="font-bold text-gray-900">{item.total_price}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">لا توجد منتجات في هذا الطلب</p>
              )}
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>المجموع الفرعي:</span>
                <span className="font-semibold">{selectedOrder.subtotal} د.ع</span>
              </div>
              {selectedOrder.coupon_discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>خصم الكوبون:</span>
                  <span className="font-semibold">-{selectedOrder.coupon_discount} د.ع</span>
                </div>
              )}
              <div className="flex justify-between text-gray-700">
                <span>رسوم التوصيل:</span>
                <span className="font-semibold">{selectedOrder.delivery_fee} د.ع</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-primary-600 bg-gray-50 p-2 rounded">
                <span>الإجمالي:</span>
                <span>{selectedOrder.total} د.ع</span>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowOrderDetailsModal(false)}
                className="px-6 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Include NotificationManager component */}
      <NotificationManager isAdmin={true} />
      </div>
    </div>
  );
};

export default AdminPanel;
