@echo off
chcp 65001 >nul
echo 🚀 إضافة أقسام ومنتجات جديدة لمتجر MIMI STORE
echo ================================================

REM تفعيل البيئة الافتراضية
echo 🔧 تفعيل البيئة الافتراضية...
call venv\Scripts\activate

REM تشغيل سكريبت إضافة البيانات
echo 📦 تشغيل سكريبت إضافة الأقسام والمنتجات...
python add_custom_data.py

echo.
echo 🎉 انتهى تشغيل السكريبت!
pause
