#!/usr/bin/env python
"""
Create admin user bypassing phone normalization
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from users.models import User

def create_admin_final():
    print("🔧 إنشاء المستخدم الإداري (الإصدار النهائي)...")
    
    # Delete all users
    User.objects.all().delete()
    print("🗑️ تم حذف جميع المستخدمين")
    
    # Create admin user using the manager's create_superuser method
    # but bypass phone normalization by setting phone directly after creation
    admin = User.objects.create_superuser(
        phone='9660000000000',  # Temporary phone that won't be normalized
        password='admin123',
        first_name='مدير',
        last_name='النظام'
    )
    
    # Now manually set the phone to 'admin' and save
    admin.phone = 'admin'
    admin.save(update_fields=['phone'])
    
    print("✅ تم إنشاء المستخدم الإداري!")
    
    # Verify
    check_admin = User.objects.get(phone='admin')
    print(f"📱 الهاتف: '{check_admin.phone}'")
    print(f"🔧 مدير: {check_admin.is_admin}")
    print(f"⚡ نشط: {check_admin.is_active}")
    print(f"👨‍💼 staff: {check_admin.is_staff}")
    print(f"🔑 superuser: {check_admin.is_superuser}")
    
    # Test authentication
    from django.contrib.auth import authenticate
    auth_user = authenticate(phone='admin', password='admin123')
    print(f"🔐 المصادقة: {'✅ نجحت' if auth_user else '❌ فشلت'}")
    
    print("\n🔑 بيانات تسجيل الدخول:")
    print("   📱 الهاتف: admin")
    print("   🔑 كلمة المرور: admin123")
    print("\n🌐 لوحة الإدارة: http://localhost:8000/admin")

if __name__ == '__main__':
    create_admin_final()