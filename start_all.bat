@echo off
chcp 65001 >nul
echo ╔════════════════════════════════════════════════════════════╗
echo ║          🚀 تشغيل MIMI STORE - كامل المشروع 🚀           ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

REM ═══════════════════════════════════════════════════════════
REM  1. تشغيل Backend (Django)
REM ═══════════════════════════════════════════════════════════
echo [1/2] 🔧 تشغيل Backend Server...
echo.

REM Check if virtual environment exists
if not exist "backend\env" (
    echo ⚠️  البيئة الافتراضية غير موجودة!
    echo 📦 إنشاء البيئة الافتراضية...
    cd backend
    python -m venv env
    cd ..
    echo ✅ تم إنشاء البيئة الافتراضية
    echo.
)

REM Start Backend in a new window
start "MIMI STORE - Backend Server" cmd /k "cd /d "%~dp0backend" && env\Scripts\activate && python manage.py runserver 8000"

echo ✅ تم تشغيل Backend Server على المنفذ 8000
echo.

REM Wait for backend to start
echo ⏳ انتظار تشغيل Backend...
timeout /t 5 /nobreak >nul

REM ═══════════════════════════════════════════════════════════
REM  2. تشغيل Frontend (React)
REM ═══════════════════════════════════════════════════════════
echo [2/2] 🎨 تشغيل Frontend Server...
echo.

REM Check if node_modules exists
if not exist "frontend\node_modules" (
    echo ⚠️  حزم Node.js غير مثبتة!
    echo 📦 تثبيت الحزم... (قد يستغرق بضع دقائق)
    cd frontend
    call npm install
    cd ..
    echo ✅ تم تثبيت الحزم
    echo.
)

REM Start Frontend in a new window
start "MIMI STORE - Frontend Server" cmd /k "cd /d "%~dp0frontend" && npm start"

echo ✅ تم تشغيل Frontend Server على المنفذ 3002
echo.

REM ═══════════════════════════════════════════════════════════
REM  معلومات التشغيل
REM ═══════════════════════════════════════════════════════════
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║              ✅ تم تشغيل المشروع بنجاح! ✅               ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 🔗 الروابط المتاحة:
echo    ┌─────────────────────────────────────────────────────────
echo    │ 🌐 الواجهة الأمامية:  http://localhost:3002
echo    │ 🔧 Backend API:        http://localhost:8000/api
echo    │ 👤 لوحة الإدارة:       http://localhost:8000/admin
echo    └─────────────────────────────────────────────────────────
echo.
echo 👤 بيانات تسجيل الدخول للإدارة:
echo    ┌─────────────────────────────────────────────────────────
echo    │ 📱 الهاتف:           admin
echo    │ 🔑 كلمة المرور:      admin123
echo    └─────────────────────────────────────────────────────────
echo.
echo 📊 اختبار API:
echo    ┌─────────────────────────────────────────────────────────
echo    │ المنتجات:    http://localhost:8000/api/products/
echo    │ الأقسام:     http://localhost:8000/api/products/categories/
echo    │ الطلبات:     http://localhost:8000/api/orders/
echo    │ الكوبونات:   http://localhost:8000/api/coupons/
echo    └─────────────────────────────────────────────────────────
echo.
echo 💡 ملاحظات مهمة:
echo    • سيتم فتح المتصفح تلقائياً بعد قليل
echo    • لإيقاف الخوادم، أغلق نوافذ Backend و Frontend
echo    • استخدم F12 في المتصفح لفتح Developer Tools
echo    • تأكد من تشغيل كلا الخادمين قبل استخدام التطبيق
echo.
echo 🎯 المميزات المتاحة:
echo    ✅ عرض المنتجات والأقسام
echo    ✅ البحث والفلترة
echo    ✅ سلة التسوق
echo    ✅ نظام الكوبونات
echo    ✅ إدارة الطلبات
echo    ✅ تسجيل الدخول والتسجيل
echo    ✅ تصميم متجاوب (Mobile-Friendly)
echo.
echo ═══════════════════════════════════════════════════════════
echo  اضغط أي زر لإغلاق هذه النافذة...
echo  (الخوادم ستستمر في العمل في النوافذ الأخرى)
echo ═══════════════════════════════════════════════════════════
pause >nul