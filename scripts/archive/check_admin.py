#!/usr/bin/env python
"""
Script to check admin user status
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from users.models import User
from django.contrib.auth import authenticate

def check_admin():
    print("🔍 فحص المستخدم الإداري...")
    
    # Check if admin user exists
    try:
        admin = User.objects.get(phone='admin')
        print(f"✅ المستخدم موجود")
        print(f"📱 الهاتف: '{admin.phone}'")
        print(f"👤 الاسم: {admin.first_name} {admin.last_name}")
        print(f"🔧 مدير: {admin.is_admin}")
        print(f"⚡ نشط: {admin.is_active}")
        print(f"🔑 superuser: {admin.is_superuser}")
        
        # Test authentication
        print("\n🔐 اختبار المصادقة...")
        auth_user = authenticate(phone='admin', password='admin123')
        if auth_user:
            print("✅ المصادقة نجحت!")
        else:
            print("❌ المصادقة فشلت!")
            
    except User.DoesNotExist:
        print("❌ المستخدم الإداري غير موجود!")
        
    # List all users
    print(f"\n📊 إجمالي المستخدمين: {User.objects.count()}")
    for user in User.objects.all():
        print(f"   - الهاتف: '{user.phone}', نشط: {user.is_active}, مدير: {user.is_admin}")

if __name__ == '__main__':
    check_admin()