import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import SiteHeader from '../components/SiteHeader';
import BottomTabBar from '../components/BottomTabBar';
import { Phone, User, Lock, Eye, EyeOff, MapPin, Loader2, ChevronDown } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const switchMode = (login) => {
    if (login === isLogin) return;
    setIsLogin(login);
    setError('');
    setShowPassword(false);
    setShowConfirm(false);
    setFormData({ phone: '', password: '', confirmPassword: '', governorate: '', address: '', name: '' });
  };

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

  const fieldClass = "w-full pr-11 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-200";
  const labelClass = "block text-[13px] font-medium text-gray-700 mb-1.5";
  const iconWrap = "absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 pointer-events-none";

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <SiteHeader user={null} setUser={setUser} />
      <div className="flex items-start justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 p-6 sm:p-8">
            {/* مبدّل الوضع — تسجيل دخول / إنشاء حساب */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => switchMode(true)}
                className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                onClick={() => switchMode(false)}
                className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${!isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
              >
                إنشاء حساب
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-3 mb-6">
              {isLogin ? 'أدخل رقم هاتفك وكلمة المرور للمتابعة' : 'املأ بياناتك لإنشاء حسابك والبدء بالتسوّق'}
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* الاسم (للتسجيل فقط) */}
              {!isLogin && (
                <div>
                  <label htmlFor="name" className={labelClass}>الاسم الكامل</label>
                  <div className="relative">
                    <span className={iconWrap}><User className="h-5 w-5" strokeWidth={1.75} /></span>
                    <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className={fieldClass} placeholder="أدخل اسمك الكامل" />
                  </div>
                </div>
              )}

              {/* رقم الهاتف */}
              <div>
                <label htmlFor="phone" className={labelClass}>رقم الهاتف</label>
                <div className="relative">
                  <span className={iconWrap}><Phone className="h-5 w-5" strokeWidth={1.75} /></span>
                  <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required value={formData.phone} onChange={handleChange} className={`${fieldClass} text-left`} placeholder="07XXXXXXXXX" dir="ltr" />
                </div>
              </div>

              {/* كلمة المرور */}
              <div>
                <label htmlFor="password" className={labelClass}>كلمة المرور</label>
                <div className="relative">
                  <span className={iconWrap}><Lock className="h-5 w-5" strokeWidth={1.75} /></span>
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange} className={`${fieldClass} pl-11`} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'} className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 hover:text-gray-700 transition-colors">
                    {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={1.75} /> : <Eye className="h-5 w-5" strokeWidth={1.75} />}
                  </button>
                </div>
              </div>

              {/* تأكيد كلمة المرور + المحافظة + العنوان (للتسجيل فقط) */}
              {!isLogin && (
                <>
                  <div>
                    <label htmlFor="confirmPassword" className={labelClass}>تأكيد كلمة المرور</label>
                    <div className="relative">
                      <span className={iconWrap}><Lock className="h-5 w-5" strokeWidth={1.75} /></span>
                      <input id="confirmPassword" name="confirmPassword" type={showConfirm ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleChange} className={`${fieldClass} pl-11`} placeholder="••••••••" />
                      <button type="button" onClick={() => setShowConfirm((v) => !v)} aria-label={showConfirm ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'} className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 hover:text-gray-700 transition-colors">
                        {showConfirm ? <EyeOff className="h-5 w-5" strokeWidth={1.75} /> : <Eye className="h-5 w-5" strokeWidth={1.75} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="governorate" className={labelClass}>المحافظة</label>
                    <div className="relative">
                      <span className={iconWrap}><MapPin className="h-5 w-5" strokeWidth={1.75} /></span>
                      <select id="governorate" name="governorate" value={formData.governorate} onChange={handleChange} required className={`${fieldClass} pl-11 appearance-none bg-gray-50 cursor-pointer`}>
                        <option value="">اختر المحافظة</option>
                        {iraqGovernorates.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                        <ChevronDown className="h-4 w-4" strokeWidth={2} />
                      </span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className={labelClass}>العنوان</label>
                    <div className="relative">
                      <span className={iconWrap}><MapPin className="h-5 w-5" strokeWidth={1.75} /></span>
                      <input id="address" name="address" type="text" required value={formData.address} onChange={handleChange} className={fieldClass} placeholder="منطقة/حي، شارع، رقم منزل" />
                    </div>
                  </div>
                </>
              )}

              {/* زر الإرسال */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl font-bold text-white bg-primary-900 hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      <BottomTabBar />
    </div>
  );
};

export default Login;
