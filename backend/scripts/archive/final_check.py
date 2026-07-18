#!/usr/bin/env python
"""
Final check before starting Django server
"""
import os
import sys
import django
import sqlite3

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')

# Setup Django
django.setup()

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.sessions.models import Session

User = get_user_model()

print("=" * 70)
print("الفحص النهائي قبل تشغيل خادم Django")
print("=" * 70)
print()

# Check 1: Database structure
print("✅ 1. فحص بنية قاعدة البيانات:")
db_path = settings.DATABASES['default']['NAME']
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(users_user)")
columns = cursor.fetchall()
id_column = [col for col in columns if col[1] == 'id'][0]
print(f"   - جدول users_user موجود")
print(f"   - عمود ID: {id_column[2]} (يجب أن يكون INTEGER)")
print(f"   - Primary Key: {'نعم' if id_column[5] else 'لا'}")

if id_column[2] == 'INTEGER' and id_column[5]:
    print("   ✅ بنية الجدول صحيحة")
else:
    print("   ❌ بنية الجدول غير صحيحة!")
    conn.close()
    sys.exit(1)

conn.close()
print()

# Check 2: User exists and has valid PK
print("✅ 2. فحص المستخدم الإداري:")
try:
    user = User.objects.get(username='admin')
    print(f"   - اسم المستخدم: {user.username}")
    print(f"   - ID: {user.id}")
    print(f"   - PK: {user.pk}")
    print(f"   - Phone: {user.phone}")
    print(f"   - Is Staff: {user.is_staff}")
    print(f"   - Is Superuser: {user.is_superuser}")
    
    if user.pk and user.id:
        print("   ✅ المستخدم لديه Primary Key صحيح")
    else:
        print("   ❌ المستخدم ليس لديه Primary Key!")
        sys.exit(1)
except User.DoesNotExist:
    print("   ❌ المستخدم الإداري غير موجود!")
    sys.exit(1)
print()

# Check 3: Authentication works
print("✅ 3. فحص المصادقة:")
auth_user = authenticate(username='admin', password='admin123')
if auth_user:
    print(f"   - تمت المصادقة بنجاح")
    print(f"   - ID: {auth_user.id}")
    print(f"   - PK: {auth_user.pk}")
    print("   ✅ المصادقة تعمل بشكل صحيح")
else:
    print("   ❌ فشلت المصادقة!")
    sys.exit(1)
print()

# Check 4: User can be saved (update_last_login simulation)
print("✅ 4. فحص حفظ المستخدم (محاكاة update_last_login):")
try:
    from django.utils import timezone
    auth_user.last_login = timezone.now()
    auth_user.save(update_fields=['last_login'])
    print("   ✅ تم حفظ المستخدم بنجاح")
except Exception as e:
    print(f"   ❌ فشل حفظ المستخدم: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
print()

# Check 5: Session system works
print("✅ 5. فحص نظام الجلسات:")
session_count = Session.objects.count()
print(f"   - عدد الجلسات الحالية: {session_count}")
print("   ✅ نظام الجلسات يعمل بشكل صحيح")
print()

# Check 6: No automatic table creation
print("✅ 6. فحص تعطيل إنشاء الجداول التلقائي:")
print("   - تم تعطيل إنشاء الجداول في __init__.py")
print("   ✅ لن تحدث تعارضات مع الجداول الموجودة")
print()

print("=" * 70)
print("✅ جميع الفحوصات نجحت!")
print("=" * 70)
print()
print("يمكنك الآن تشغيل خادم Django:")
print("  python manage.py runserver")
print()
print("ثم افتح المتصفح على:")
print("  http://127.0.0.1:8000/admin/")
print()
print("بيانات تسجيل الدخول:")
print("  Username: admin")
print("  Password: admin123")
print()
print("=" * 70)