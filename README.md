# 🛍️ MIMI STORE - متجر إلكتروني متكامل

## 📋 نظرة عامة

MIMI STORE هو متجر إلكتروني متكامل مبني بـ Django REST Framework مع مميزات متقدمة لإدارة المنتجات والطلبات.

## ✨ المميزات

### 👥 إدارة المستخدمين
- تسجيل الدخول برقم الهاتف
- JWT Authentication
- ملفات شخصية مفصلة
- نظام صلاحيات متقدم

### 🛒 إدارة المنتجات
- أقسام وفئات متعددة
- إدارة المخزون التلقائية
- نظام خصومات ذكي
- تقييمات ومراجعات

### 🎫 نظام الكوبونات
- كوبونات خصم بنسب مئوية أو قيم ثابتة
- تحديد شروط الاستخدام (الحد الأدنى للطلب، تاريخ الانتهاء)
- تخصيص الكوبونات لمنتجات أو أقسام معينة
- استثناء منتجات أو أقسام من الخصم
- نظام تتبع استخدامات الكوبونات
- بحث متقدم وفلترة

### 🛍️ سلة التسوق والطلبات
- سلة تسوق تفاعلية
- نظام طلبات متكامل
- تتبع حالة الطلبات
- حساب الشحن والضرائب
- إشعارات تلقائية

### 📊 لوحة الإدارة
- إحصائيات مفصلة
- إدارة الطلبات
- تقارير المبيعات
- إدارة المخزون

## 🚀 التشغيل السريع

### 🎯 التشغيل الكامل (Backend + Frontend):

#### 1. تشغيل Backend:
```bash
# انقر مرتين على الملف
quick_start.bat
```

#### 2. تشغيل Frontend:
```bash
# انقر مرتين على الملف (الأفضل)
start_frontend_server.bat

# أو تشغيل مباشر
python serve_frontend.py
```

### 🔧 الطرق البديلة:

#### Backend فقط:
```bash
# الطريقة الكاملة
start.bat

# الطريقة اليدوية
backend\env\Scripts\activate
python manage.py runserver
```

#### Frontend فقط:
```bash
# خادم HTTP (الأفضل)
python serve_frontend.py

# Live Server في VS Code
# انقر بالزر الأيمن على frontend/index.html
# اختر "Open with Live Server"
```

## 🌐 الروابط

| الخدمة | الرابط | الوصف |
|--------|--------|--------|
| **🎨 واجهة المتجر** | http://localhost:3000 | الواجهة الأمامية الكاملة |
| **📊 API الرئيسي** | http://localhost:8000/api | معلومات شاملة عن API |
| **⚙️ لوحة الإدارة** | http://localhost:8000/admin | إدارة Django |
| **📱 المنتجات** | http://localhost:8000/api/products/ | قائمة المنتجات |
| **📂 الأقسام** | http://localhost:8000/api/products/categories/ | أقسام المنتجات |
| **⭐ المنتجات المميزة** | http://localhost:8000/api/products/featured/ | المنتجات المميزة |
| **🧪 اختبار API** | test_api_endpoints.html | صفحة اختبار شاملة |

## 🔑 بيانات الدخول

### مشرف النظام:
- **الهاتف:** admin
- **كلمة المرور:** admin123

## 📊 البيانات التجريبية

تم إنشاء بيانات تجريبية تشمل:
- **5 أقسام:** الهواتف الذكية، الأجهزة اللوحية، أجهزة الكمبيوتر، الإكسسوارات، الساعات الذكية
- **11 منتج:** بما في ذلك iPhone 15 Pro Max، Samsung Galaxy S24 Ultra، MacBook Pro، وغيرها
- **خصومات متنوعة:** من 5% إلى 25%

## 🔗 API Endpoints

### المستخدمين
```
POST /api/users/register/          # تسجيل مستخدم جديد
POST /api/users/login/             # تسجيل الدخول
GET  /api/users/profile/           # الملف الشخصي
PUT  /api/users/profile/update/    # تحديث الملف الشخصي
```

### المنتجات
```
GET  /api/products/                # قائمة المنتجات
GET  /api/products/{id}/           # تفاصيل المنتج
GET  /api/products/categories/     # قائمة الأقسام
GET  /api/products/featured/       # المنتجات المميزة
GET  /api/products/search/?q=      # البحث
```

### سلة التسوق
```
GET    /api/orders/cart/                    # عرض السلة
POST   /api/orders/cart/add/                # إضافة للسلة
PUT    /api/orders/cart/items/{id}/update/  # تحديث عنصر
DELETE /api/orders/cart/items/{id}/remove/  # حذف عنصر
DELETE /api/orders/cart/clear/              # تفريغ السلة
```

### الطلبات
```
GET  /api/orders/                  # قائمة الطلبات
POST /api/orders/create/           # إنشاء طلب جديد
GET  /api/orders/{id}/             # تفاصيل الطلب
POST /api/orders/{id}/cancel/      # إلغاء الطلب
```

### الإدارة (للمشرفين فقط)
```
GET /api/orders/admin/all/         # جميع الطلبات
GET /api/orders/admin/stats/       # إحصائيات الطلبات
PUT /api/orders/admin/{id}/status/ # تحديث حالة الطلب
```

## 🛠️ التقنيات المستخدمة

- **Backend:** Django 5.2.6 + Django REST Framework
- **Database:** SQLite (للتطوير)
- **Authentication:** JWT
- **File Storage:** Cloudinary (اختياري)
- **Push Notifications:** Firebase (اختياري)

## 📁 هيكل المشروع

```
ecom_project/
├── backend/
│   └── env/                    # البيئة الافتراضية
├── users/                      # تطبيق المستخدمين
├── products/                   # تطبيق المنتجات
├── orders/                     # تطبيق الطلبات
├── ecom_project/              # إعدادات Django
├── static/                    # الملفات الثابتة
├── media/                     # ملفات الوسائط
├── logs/                      # سجلات النظام
├── manage.py                  # إدارة Django
├── requirements.txt           # المتطلبات
├── .env                       # متغيرات البيئة
└── start.bat                  # ملف التشغيل
```

## 🔧 التخصيص

### إضافة منتجات جديدة:
1. ادخل لوحة الإدارة: http://localhost:8000/admin
2. اذهب إلى Products → Products
3. اضغط "Add Product"

### تخصيص الإعدادات:
عدّل ملف `.env` لتغيير:
- إعدادات قاعدة البيانات
- مفاتيح Cloudinary
- إعدادات Firebase

## 🐛 استكشاف الأخطاء

### ❌ مشكلة "HTTP 404: Not Found" عند الضغط على الأقسام:
**✅ تم حلها!** راجع ملف `FIX_CATEGORIES_ISSUE.md`

### خطأ في قاعدة البيانات:
```bash
python manage.py makemigrations
python manage.py migrate
```

### خطأ في المتطلبات:
```bash
backend\env\Scripts\activate
pip install -r requirements.txt
```

### مشاكل CORS:
```bash
# تأكد من تشغيل Frontend مع خادم HTTP
python serve_frontend.py
# بدلاً من فتح الملف مباشرة
```

### إعادة إنشاء البيانات:
```bash
python create_sample_data.py
```

### اختبار API:
```bash
# فتح صفحة الاختبار
test_api_endpoints.html
```

## 🌐 النشر على Render

### المتطلبات
- حساب على Render
- مستودع (Repository) على GitHub يحتوي على الكود المصدري للمشروع

### خطوات النشر

#### 1. إعداد الواجهة الخلفية (Backend)

1. اذهب إلى لوحة تحكم Render
2. أنشئ "New Web Service"
3. ربط مستودع GitHub الخاص بالمشروع
4. اختر الدليل الجذر للواجهة الخلفية (`backend`)
5. حدد بيئة Python
6. اضبط Build Command:
   ```
   pip install -r requirements.txt
   python manage.py collectstatic --no-input
   ```
7. اضبط Start Command:
   ```
   gunicorn ecom_project.wsgi:application --bind 0.0.0.0:$PORT
   ```
8. أضف متغيرات البيئة التالية:
   - `SECRET_KEY`: مفتاح سري عشوائي
   - `DEBUG`: False
   - `DATABASE_URL`: رابط قاعدة بيانات PostgreSQL
   - `ALLOWED_HOSTS`: اسم النطاق الخاص بالواجهة الخلفية
   - `RENDER_FRONTEND_URL`: رابط الواجهة الأمامية

#### 2. إعداد الواجهة الأمامية (Frontend)

1. أنشئ "New Static Site"
2. ربط نفس مستودع GitHub
3. اختر الدليل الجذر للواجهة الأمامية (`frontend`)
4. اضبط Build Command:
   ```
   npm run build
   ```
5. اضبط Publish Directory:
   ```
   build
   ```
6. أضف متغيرات البيئة إذا لزم الأمر

#### 3. تحديث الروابط

بعد نشر الواجهة الخلفية والواجهة الأمامية:
1. احصل على رابط الواجهة الخلفية من Render
2. عدل ملف `package.json` في الواجهة الأمامية:
   ```json
   "proxy": "https://your-backend-url.onrender.com"
   ```
3. أضف رابط الواجهة الأمامية إلى متغيرات البيئة في الواجهة الخلفية:
   ```
   RENDER_FRONTEND_URL=https://your-frontend-url.onrender.com
   ```

## 📞 الدعم

للحصول على المساعدة:
1. تحقق من ملف `SETUP_COMPLETE.md`
2. راجع سجلات الأخطاء في Terminal
3. تأكد من تفعيل البيئة الافتراضية

## 📄 الترخيص

هذا المشروع مفتوح المصدر ومتاح للاستخدام والتطوير.

---

**🎉 مبروك! متجر MIMI STORE جاهز للاستخدام!**

**صُنع بـ ❤️ للمطورين العرب**