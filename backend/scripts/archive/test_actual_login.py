import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from django.contrib.auth import authenticate, login
from django.contrib.auth import get_user_model
from django.test import RequestFactory
from django.contrib.sessions.middleware import SessionMiddleware
import traceback

User = get_user_model()

print("=" * 60)
print("اختبار تسجيل الدخول الفعلي")
print("=" * 60)

try:
    # Get the admin user
    print("\n1️⃣ البحث عن المستخدم admin...")
    user = User.objects.get(username='admin')
    print(f"   ✅ وجدت المستخدم: {user.username}")
    print(f"   Phone: {user.phone}")
    print(f"   Is Active: {user.is_active}")
    print(f"   Is Staff: {user.is_staff}")
    print(f"   Is Superuser: {user.is_superuser}")
    print(f"   PK: {user.pk}")
    
    # Try to authenticate
    print("\n2️⃣ محاولة المصادقة...")
    authenticated_user = authenticate(username='admin', password='admin123')
    
    if authenticated_user:
        print(f"   ✅ تمت المصادقة بنجاح: {authenticated_user.username}")
    else:
        print("   ❌ فشلت المصادقة!")
        raise Exception("Authentication failed")
    
    # Create a fake request
    print("\n3️⃣ إنشاء طلب وهمي...")
    factory = RequestFactory()
    request = factory.get('/admin/')
    
    # Add session to request
    middleware = SessionMiddleware(lambda x: None)
    middleware.process_request(request)
    request.session.save()
    
    print(f"   ✅ تم إنشاء الطلب")
    print(f"   Session Key: {request.session.session_key}")
    
    # Try to login
    print("\n4️⃣ محاولة تسجيل الدخول...")
    login(request, authenticated_user)
    
    print("   ✅ تم تسجيل الدخول بنجاح!")
    print(f"   User in session: {request.session.get('_auth_user_id')}")
    
    # Save session
    print("\n5️⃣ حفظ الجلسة...")
    request.session.save()
    print("   ✅ تم حفظ الجلسة بنجاح!")
    
    print("\n" + "=" * 60)
    print("✅ جميع الاختبارات نجحت!")
    print("=" * 60)
    
except Exception as e:
    print(f"\n❌ خطأ: {e}")
    print("\n📋 تفاصيل الخطأ:")
    traceback.print_exc()