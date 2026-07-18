#!/usr/bin/env python
"""
Script to fix admin user for MIMI STORE
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from users.models import User

def fix_admin():
    print("🔧 إصلاح المستخدم الإداري...")
    
    # Delete all existing users first
    User.objects.all().delete()
    print("🗑️ تم حذف جميع المستخدمين الموجودين")
    
    # Create fresh admin user
    admin_user = User.objects.create_user(
        phone='admin',
        password='admin123',
        first_name='مدير',
        last_name='النظام',
        is_admin=True,
        is_superuser=True,
        is_active=True,
    )
    
    print("✅ تم إنشاء المستخدم الإداري بنجاح!")
    print("\n🔑 بيانات تسجيل الدخول:")
    print("   📱 الهاتف: admin")
    print("   🔑 كلمة المرور: admin123")
    print("\n🌐 لوحة الإدارة: http://localhost:8000/admin")

if __name__ == '__main__':
    fix_admin()