import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const iraqGovernorates = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'السليمانية', 'دهوك', 'كركوك', 'ديالى', 'الأنبار',
  'بابل', 'كربلاء', 'النجف', 'القادسية', 'ميسان', 'واسط', 'ذي قار', 'المثنى', 'صلاح الدين', 'حلبجة'
];

const Login = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    governorate: '',
    address: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    // تحقق من الحقول الأساسية
    if (!formData.phone || !formData.password) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return false;
    }

    // تحقق من رقم الهاتف
    if (formData.phone.length < 10) {
      setError('رقم الهاتف يجب أن يكون 10 أرقام على الأقل');
      return false;
    }

    // تحقق من كلمة المرور
    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }

    // تحقق إضافي لحقول تسجيل المستخدم الجديد
    if (!isLogin) {
      if (!formData.name || formData.name.trim().length < 2) {
        setError('يرجى إدخال الاسم الكامل');
        return false;
      }
      if (!formData.confirmPassword) {
        setError('يرجى تأكيد كلمة المرور');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('كلمة المرور وتأكيد كلمة المرور غير متطابقتين');
        return false;
      }
      if (!formData.governorate) {
        setError('يرجى اختيار المحافظة');
        return false;
      }
      if (!formData.address || formData.address.trim().length < 5) {
        setError('يرجى إدخال عنوان صحيح');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      let response;

      if (isLogin) {
        // Login
        response = await api.post('/users/login/', {
          phone: formData.phone,
          password: formData.password
        });
      } else {
        // Register
        response = await api.post('/users/users/', {
          phone: formData.phone,
          password: formData.password,
          password_confirm: formData.confirmPassword,
          address: formData.address,
          governorate: formData.governorate,
          name: formData.name
        });
      }

      // Save tokens and user
      const tokens = response.data.tokens;
      if (tokens?.access) {
        localStorage.setItem('token', tokens.access);
      }
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        // Save welcome message
        const welcomeMessage = `مرحباً ${response.data.user.name || response.data.user.phone}!`;
        localStorage.setItem('welcome_message', welcomeMessage);
      }
      navigate('/');
    } catch (error) {
      console.error('Authentication error:', error);
      // عدم التوجيه لصفحة أخرى، فقط عرض رسالة الخطأ
      if (error.response?.status === 401) {
        setError('رقم الهاتف أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 404) {
        setError('رقم الهاتف غير مسجل. يرجى إنشاء حساب جديد.');
      } else {
        setError(isLogin ? 'خطأ في تسجيل الدخول. يرجى التحقق من رقم الهاتف وكلمة المرور.' : 'حدث خطأ أثناء إنشاء الحساب. يرجى التأكد من ملء جميع الحقول بشكل صحيح والمحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white w-20 h-20 rounded-full flex items-center justify-center font-bold text-3xl mx-auto mb-4 shadow-xl">
            V
          </div>
          <h2 className="text-3xl font-extrabold gradient-text mb-2">
            voro
          </h2>
          <p className="text-gray-500 font-medium">
            {isLogin ? 'مرحباً بعودتك إلى عالم التسوق!' : 'انضم إلينا وابدأ رحلة التسوق'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Phone Input */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف
              </label>
              <div className="relative">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="05xxxxxxxx"
                  dir="ltr"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Name Input (Register only) */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>
            )}

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Confirm Password Input (Register only) */}
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Governorate Select */}
                <div>
                  <label htmlFor="governorate" className="block text-sm font-medium text-gray-700 mb-2">
                    المحافظة
                  </label>
                  <select
                    id="governorate"
                    name="governorate"
                    value={formData.governorate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-white"
                  >
                    <option value="">اختر المحافظة</option>
                    {iraqGovernorates.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Address Input */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    العنوان
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    placeholder="مثال: منطقة/حي، شارع، رقم منزل"
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 hover:shadow-lg transform hover:scale-105'
                }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  جاري المعالجة...
                </div>
              ) : (
                isLogin ? 'تسجيل دخول' : 'إنشاء حساب'
              )}
            </button>

            {/* Toggle Login/Register */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({
                    phone: '',
                    password: '',
                    confirmPassword: '',
                    governorate: '',
                    address: '',
                    name: ''
                  });
                }}
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                {isLogin ? 'ليس لديك حساب؟ إنشاء حساب جديد' : 'لديك حساب؟ تسجيل دخول'}
              </button>
            </div>
          </form>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            لماذا تختار voro؟
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">جودة عالية</h4>
              <p className="text-sm text-gray-600">منتجات مضمونة الجودة</p>
            </div>
            <div className="text-center">
              <div className="bg-secondary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="h-6 w-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">أسعار مميزة</h4>
              <p className="text-sm text-gray-600">أفضل الأسعار في السوق</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">توصيل سريع</h4>
              <p className="text-sm text-gray-600">توصيل في نفس اليوم</p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            ← العودة للرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
