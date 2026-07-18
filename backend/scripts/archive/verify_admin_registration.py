#!/usr/bin/env python
"""
سكريبت للتحقق من تسجيل الكوبونات في Admin Site المخصص
"""
import os
import sys
import django

# إعداد Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from ecom_project.admin import admin_site
from products.models_coupons import Coupon, CouponUsage

def verify_admin_registration():
    """التحقق من تسجيل النماذج في Admin Site المخصص"""
    
    print("=" * 60)
    print("🔍 التحقق من تسجيل الكوبونات في Admin Site المخصص")
    print("=" * 60)
    print()
    
    # الحصول على جميع النماذج المسجلة
    registered_models = admin_site._registry
    
    print(f"📊 عدد النماذج المسجلة: {len(registered_models)}")
    print()
    
    # التحقق من تسجيل Coupon
    if Coupon in registered_models:
        print("✅ Coupon مسجل في admin_site")
        admin_class = registered_models[Coupon]
        print(f"   - Admin Class: {admin_class.__class__.__name__}")
        print(f"   - List Display: {admin_class.list_display}")
    else:
        print("❌ Coupon غير مسجل في admin_site")
    
    print()
    
    # التحقق من تسجيل CouponUsage
    if CouponUsage in registered_models:
        print("✅ CouponUsage مسجل في admin_site")
        admin_class = registered_models[CouponUsage]
        print(f"   - Admin Class: {admin_class.__class__.__name__}")
        print(f"   - List Display: {admin_class.list_display}")
    else:
        print("❌ CouponUsage غير مسجل في admin_site")
    
    print()
    print("=" * 60)
    print("📋 جميع النماذج المسجلة:")
    print("=" * 60)
    
    for model, admin_class in registered_models.items():
        app_label = model._meta.app_label
        model_name = model._meta.model_name
        print(f"  • {app_label}.{model_name} -> {admin_class.__class__.__name__}")
    
    print()
    print("=" * 60)
    print("🔗 روابط الوصول:")
    print("=" * 60)
    print("  📍 لوحة الإدارة: http://localhost:8000/admin/")
    print("  🎟️ الكوبونات: http://localhost:8000/admin/products/coupon/")
    print("  📊 استخدامات الكوبونات: http://localhost:8000/admin/products/couponusage/")
    print("=" * 60)

if __name__ == '__main__':
    verify_admin_registration()