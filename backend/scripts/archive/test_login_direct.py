#!/usr/bin/env python
"""
Test login directly without Django server
"""
import os
import sys
import django

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')

# Setup Django
django.setup()

from django.contrib.auth import authenticate, get_user_model
from django.test import RequestFactory
from django.contrib.auth import login
from django.contrib.sessions.backends.db import SessionStore

User = get_user_model()

print("=" * 60)
print("اختبار تسجيل الدخول المباشر")
print("=" * 60)
print()

# Step 1: Get user
print("1️⃣ الحصول على المستخدم...")
try:
    user = User.objects.get(username='admin')
    print(f"   ✅ المستخدم: {user.username}")
    print(f"   ID: {user.id}")
    print(f"   PK: {user.pk}")
    print(f"   Phone: {user.phone}")
    print(f"   _state.adding: {user._state.adding}")
    print(f"   _state.db: {user._state.db}")
except Exception as e:
    print(f"   ❌ خطأ: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print()

# Step 2: Authenticate
print("2️⃣ المصادقة...")
try:
    auth_user = authenticate(username='admin', password='admin123')
    if auth_user:
        print(f"   ✅ تمت المصادقة: {auth_user.username}")
        print(f"   ID: {auth_user.id}")
        print(f"   PK: {auth_user.pk}")
        print(f"   _state.adding: {auth_user._state.adding}")
        print(f"   _state.db: {auth_user._state.db}")
    else:
        print("   ❌ فشلت المصادقة")
        sys.exit(1)
except Exception as e:
    print(f"   ❌ خطأ: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print()

# Step 3: Try to save user (this is what update_last_login does)
print("3️⃣ محاولة حفظ المستخدم (تحديث last_login)...")
try:
    from django.utils import timezone
    auth_user.last_login = timezone.now()
    
    print(f"   قبل الحفظ:")
    print(f"   - PK: {auth_user.pk}")
    print(f"   - ID: {auth_user.id}")
    print(f"   - _state.adding: {auth_user._state.adding}")
    print(f"   - _state.db: {auth_user._state.db}")
    
    auth_user.save(update_fields=['last_login'])
    
    print(f"   ✅ تم الحفظ بنجاح!")
    print(f"   بعد الحفظ:")
    print(f"   - PK: {auth_user.pk}")
    print(f"   - ID: {auth_user.id}")
    
except Exception as e:
    print(f"   ❌ خطأ: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print()

# Step 4: Create request and login
print("4️⃣ إنشاء طلب وتسجيل دخول...")
try:
    factory = RequestFactory()
    request = factory.post('/admin/login/')
    
    # Add session
    request.session = SessionStore()
    request.session.create()
    
    print(f"   Session Key: {request.session.session_key}")
    
    # Login
    login(request, auth_user)
    
    print(f"   ✅ تم تسجيل الدخول!")
    print(f"   User in session: {request.session.get('_auth_user_id')}")
    
    # Save session
    request.session.save()
    print(f"   ✅ تم حفظ الجلسة!")
    
except Exception as e:
    print(f"   ❌ خطأ: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print()
print("=" * 60)
print("✅ جميع الاختبارات نجحت!")
print("=" * 60)