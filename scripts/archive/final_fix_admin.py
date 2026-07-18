#!/usr/bin/env python
"""
Final fix for admin user
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from users.models import User

def final_fix():
    print("🔧 الإصلاح النهائي للمستخدم الإداري...")
    
    # Delete all users
    User.objects.all().delete()
    print("🗑️ تم حذف جميع المستخدمين")
    
    # Create admin user using create method directly
    admin = User(
        phone='admin',
        first_name='مدير',
        last_name='النظام',
        is_admin=True,
        is_superuser=True,
        is_active=True,
        is_staff=True,  # Important for Django admin access
    )
    admin.set_password('admin123')
    admin.save()
    
    print("✅ تم إنشاء المستخدم الإداري!")
    
    # Verify
    check_admin = User.objects.get(phone='admin')
    print(f"📱 الهاتف: '{check_admin.phone}'")
    print(f"🔧 مدير: {check_admin.is_admin}")
    print(f"⚡ نشط: {check_admin.is_active}")
    print(f"👨‍💼 staff: {check_admin.is_staff}")
    print(f"🔑 superuser: {check_admin.is_superuser}")
    
    print("\n🔑 بيانات تسجيل الدخول:")
    print("   📱 الهاتف: admin")
    print("   🔑 كلمة المرور: admin123")
    print("\n🌐 لوحة الإدارة: http://localhost:8000/admin")

if __name__ == '__main__':
    final_fix()