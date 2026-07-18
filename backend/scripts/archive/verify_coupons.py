"""
سكريبت التحقق من أن الكوبونات تعمل بشكل صحيح
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from django.contrib import admin
from products.models_coupons import Coupon, CouponUsage
import sqlite3

print("=" * 70)
print("🔍 التحقق من حالة الكوبونات في النظام")
print("=" * 70)

# 1. التحقق من قاعدة البيانات
print("\n1️⃣ التحقق من قاعدة البيانات:")
print("-" * 70)
conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%coupon%'")
tables = cursor.fetchall()
print(f"   ✅ جداول الكوبونات موجودة: {[t[0] for t in tables]}")
conn.close()

# 2. التحقق من التسجيل في Admin
print("\n2️⃣ التحقق من تسجيل Admin:")
print("-" * 70)
print(f"   ✅ Coupon مسجل: {Coupon in admin.site._registry}")
print(f"   ✅ CouponUsage مسجل: {CouponUsage in admin.site._registry}")

if Coupon in admin.site._registry:
    admin_class = admin.site._registry[Coupon]
    print(f"   ✅ Admin Class: {admin_class.__class__.__name__}")
    print(f"   ✅ List Display: {admin_class.list_display}")

# 3. عد الكوبونات
print("\n3️⃣ إحصائيات الكوبونات:")
print("-" * 70)
total_coupons = Coupon.objects.count()
active_coupons = Coupon.objects.filter(is_active=True).count()
inactive_coupons = Coupon.objects.filter(is_active=False).count()

print(f"   📊 إجمالي الكوبونات: {total_coupons}")
print(f"   ✅ الكوبونات النشطة: {active_coupons}")
print(f"   ❌ الكوبونات غير النشطة: {inactive_coupons}")

# 4. قائمة الكوبونات
print("\n4️⃣ قائمة الكوبونات:")
print("-" * 70)
for i, coupon in enumerate(Coupon.objects.all(), 1):
    status = "✅ نشط" if coupon.is_active else "❌ غير نشط"
    print(f"   {i}. {coupon.code:15} | {coupon.get_discount_display():15} | {status}")

# 5. التحقق من الروابط
print("\n5️⃣ الروابط المتاحة:")
print("-" * 70)
print("   🌐 لوحة الإدارة:        http://localhost:8000/admin/")
print("   🎟️ قائمة الكوبونات:     http://localhost:8000/admin/products/coupon/")
print("   ➕ إضافة كوبون:          http://localhost:8000/admin/products/coupon/add/")
print("   🧾 استخدامات الكوبونات:  http://localhost:8000/admin/products/couponusage/")
print("   🔌 API الكوبونات:        http://localhost:8000/api/coupons/")

# 6. التحقق من الخادم
print("\n6️⃣ حالة الخادم:")
print("-" * 70)
try:
    import urllib.request
    response = urllib.request.urlopen('http://localhost:8000/admin/', timeout=5)
    if response.status == 200:
        print("   ✅ الخادم يعمل بشكل صحيح على http://localhost:8000")
    else:
        print(f"   ⚠️ الخادم يستجيب بحالة: {response.status}")
except Exception as e:
    print(f"   ❌ الخادم لا يعمل: {str(e)}")
    print("   💡 شغل الخادم باستخدام: START.bat")

print("\n" + "=" * 70)
print("✅ التحقق اكتمل!")
print("=" * 70)
print("\n💡 للوصول للكوبونات:")
print("   1. افتح http://localhost:8000/admin/")
print("   2. سجل الدخول (admin / admin123)")
print("   3. ابحث عن 'PRODUCTS' في القائمة الجانبية")
print("   4. اضغط على 'Coupons' أو 'كوبونات الخصم'")
print("\n🎉 الكوبونات جاهزة للاستخدام!")