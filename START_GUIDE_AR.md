# 🚀 دليل تشغيل MIMI STORE

## 📋 المحتويات
1. [التشغيل السريع](#التشغيل-السريع)
2. [التشغيل المنفصل](#التشغيل-المنفصل)
3. [المتطلبات](#المتطلبات)
4. [حل المشاكل](#حل-المشاكل)

---

## ⚡ التشغيل السريع

### الطريقة الأولى: ملف Batch (موصى به)
```bash
# انقر نقراً مزدوجاً على الملف:
start_all.bat
```

### الطريقة الثانية: PowerShell (متقدم)
```powershell
# انقر بزر الماوس الأيمن على الملف واختر "Run with PowerShell":
start_all.ps1
```

### الطريقة الثالثة: من Terminal
```bash
# في PowerShell أو CMD:
cd c:\Users\a\Desktop\ecom_setup\ecom_project\ecom_project
.\start_all.bat
```

---

## 🔧 التشغيل المنفصل

### تشغيل Backend فقط
```bash
# الطريقة 1: استخدام ملف batch
quick_start.bat

# الطريقة 2: يدوياً
cd backend
env\Scripts\activate
python manage.py runserver 8000
```

### تشغيل Frontend فقط
```bash
# الطريقة 1: استخدام ملف batch
run_frontend.bat

# الطريقة 2: يدوياً
cd frontend
npm start
```

---

## 📦 المتطلبات

### البرامج المطلوبة:
- ✅ **Python 3.8+** - [تحميل](https://www.python.org/downloads/)
- ✅ **Node.js 14+** - [تحميل](https://nodejs.org/)
- ✅ **Git** (اختياري) - [تحميل](https://git-scm.com/)

### التحقق من التثبيت:
```bash
# تحقق من Python
python --version

# تحقق من Node.js
node --version

# تحقق من npm
npm --version
```

---

## 🌐 الروابط المتاحة

بعد التشغيل الناجح، ستكون الروابط التالية متاحة:

| الخدمة | الرابط | الوصف |
|--------|--------|-------|
| 🌐 **الواجهة الأمامية** | http://localhost:3002 | واجهة المتجر الرئيسية |
| 🔧 **Backend API** | http://localhost:8000/api | واجهة برمجة التطبيقات |
| 👤 **لوحة الإدارة** | http://localhost:8000/admin | لوحة تحكم Django |
| 📊 **المنتجات API** | http://localhost:8000/api/products/ | قائمة المنتجات |
| 📁 **الأقسام API** | http://localhost:8000/api/products/categories/ | قائمة الأقسام |
| 🛒 **الطلبات API** | http://localhost:8000/api/orders/ | إدارة الطلبات |
| 🎟️ **الكوبونات API** | http://localhost:8000/api/coupons/ | إدارة الكوبونات |

---

## 👤 بيانات تسجيل الدخول

### حساب المشرف (Admin):
```
📱 الهاتف: admin
🔑 كلمة المرور: admin123
```

### إنشاء حساب مشرف جديد:
```bash
cd backend
env\Scripts\activate
python manage.py createsuperuser
```

---

## 🎯 المميزات المتاحة

### للمستخدمين:
- ✅ تصفح المنتجات والأقسام
- ✅ البحث والفلترة المتقدمة
- ✅ سلة التسوق
- ✅ تطبيق الكوبونات
- ✅ تتبع الطلبات
- ✅ تسجيل الدخول والتسجيل
- ✅ تصميم متجاوب (Mobile-Friendly)

### للمشرفين:
- ✅ إدارة المنتجات
- ✅ إدارة الأقسام
- ✅ إدارة الطلبات
- ✅ إدارة الكوبونات
- ✅ إدارة المستخدمين
- ✅ تقارير المبيعات

---

## 🛠️ حل المشاكل

### المشكلة: Backend لا يعمل

#### الحل 1: تحقق من المنفذ
```bash
# تحقق إذا كان المنفذ 8000 مستخدم
netstat -ano | findstr :8000

# إيقاف العملية (استبدل PID برقم العملية)
taskkill /PID <PID> /F
```

#### الحل 2: إعادة إنشاء البيئة الافتراضية
```bash
cd backend
rmdir /s /q env
python -m venv env
env\Scripts\activate
pip install -r requirements.txt
```

#### الحل 3: تشغيل Migrations
```bash
cd backend
env\Scripts\activate
python manage.py makemigrations
python manage.py migrate
```

---

### المشكلة: Frontend لا يعمل

#### الحل 1: تحقق من المنفذ
```bash
# تحقق إذا كان المنفذ 3002 مستخدم
netstat -ano | findstr :3002

# إيقاف العملية
taskkill /PID <PID> /F
```

#### الحل 2: إعادة تثبيت الحزم
```bash
cd frontend
rmdir /s /q node_modules
del package-lock.json
npm install
```

#### الحل 3: مسح Cache
```bash
cd frontend
npm cache clean --force
npm install
```

---

### المشكلة: خطأ CORS

#### الحل: تحديث إعدادات CORS في Backend
```python
# في backend/ecom_project/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3002",
    "http://127.0.0.1:3002",
]
```

---

### المشكلة: خطأ في الاتصال بقاعدة البيانات

#### الحل: إعادة بناء قاعدة البيانات
```bash
cd backend
env\Scripts\activate

# حذف قاعدة البيانات القديمة
del db.sqlite3

# إنشاء قاعدة بيانات جديدة
python manage.py migrate

# إنشاء مستخدم مشرف
python manage.py createsuperuser

# إضافة بيانات تجريبية (اختياري)
python create_sample_data.py
```

---

### المشكلة: خطأ في تثبيت الحزم

#### الحل 1: تحديث pip
```bash
python -m pip install --upgrade pip
```

#### الحل 2: تثبيت الحزم يدوياً
```bash
cd backend
env\Scripts\activate
pip install django djangorestframework django-cors-headers
pip install pillow requests python-decouple
```

---

## 📱 اختبار التطبيق

### 1. اختبار Backend API
```bash
# في المتصفح أو Postman:
GET http://localhost:8000/api/products/
GET http://localhost:8000/api/products/categories/
GET http://localhost:8000/api/coupons/
```

### 2. اختبار Frontend
```bash
# افتح المتصفح:
http://localhost:3002

# اضغط F12 لفتح Developer Tools
# تحقق من Console للأخطاء
```

### 3. اختبار لوحة الإدارة
```bash
# افتح المتصفح:
http://localhost:8000/admin

# سجل الدخول باستخدام:
# الهاتف: admin
# كلمة المرور: admin123
```

---

## 🔄 إيقاف التطبيق

### إيقاف جميع الخوادم:
1. أغلق نافذة Backend (PowerShell/CMD)
2. أغلق نافذة Frontend (PowerShell/CMD)
3. أو اضغط `Ctrl+C` في كل نافذة

### إيقاف باستخدام Task Manager:
1. افتح Task Manager (`Ctrl+Shift+Esc`)
2. ابحث عن عمليات Python و Node
3. انقر بزر الماوس الأيمن واختر "End Task"

---

## 📚 موارد إضافية

### التوثيق:
- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)
- [Django REST Framework](https://www.django-rest-framework.org/)

### الدعم:
- 📧 البريد الإلكتروني: support@mimistore.com
- 💬 Discord: [رابط الخادم]
- 📱 WhatsApp: [رقم الدعم]

---

## 🎉 نصائح للتطوير

### 1. استخدام VS Code
```bash
# افتح المشروع في VS Code
code .
```

### 2. تفعيل Hot Reload
- Frontend: يعمل تلقائياً مع `npm start`
- Backend: استخدم `python manage.py runserver`

### 3. استخدام Git
```bash
# تهيئة Git
git init
git add .
git commit -m "Initial commit"

# ربط مع GitHub
git remote add origin <repository-url>
git push -u origin main
```

### 4. استخدام Virtual Environment
```bash
# تفعيل البيئة الافتراضية دائماً قبل العمل
cd backend
env\Scripts\activate
```

---

## ✅ قائمة التحقق قبل التشغيل

- [ ] Python 3.8+ مثبت
- [ ] Node.js 14+ مثبت
- [ ] المنفذ 8000 متاح
- [ ] المنفذ 3002 متاح
- [ ] البيئة الافتراضية موجودة في `backend/env`
- [ ] حزم Node.js مثبتة في `frontend/node_modules`
- [ ] ملف `.env` موجود في `backend`
- [ ] قاعدة البيانات موجودة في `backend/db.sqlite3`

---

## 🎊 تم التشغيل بنجاح!

إذا رأيت هذه الرسالة، فقد تم تشغيل التطبيق بنجاح! 🎉

استمتع باستخدام **MIMI STORE**! 🛍️

---

**آخر تحديث:** 2024
**الإصدار:** 1.0.0