import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from django.contrib.sessions.models import Session
from django.utils import timezone
from datetime import timedelta
import traceback

print("=" * 60)
print("اختبار حفظ الجلسة")
print("=" * 60)

try:
    # Try to create a new session
    print("\n1️⃣ محاولة إنشاء جلسة جديدة...")
    
    session = Session()
    session.session_key = 'test_session_key_12345'
    session.session_data = 'test_data'
    session.expire_date = timezone.now() + timedelta(days=1)
    
    print(f"   Session Key: {session.session_key}")
    print(f"   Has PK before save: {session.pk is not None}")
    print(f"   PK value: {session.pk}")
    
    # Try to save
    print("\n2️⃣ محاولة حفظ الجلسة...")
    session.save()
    
    print("   ✅ تم حفظ الجلسة بنجاح!")
    print(f"   PK after save: {session.pk}")
    
    # Try to retrieve it
    print("\n3️⃣ محاولة استرجاع الجلسة...")
    retrieved = Session.objects.get(session_key='test_session_key_12345')
    print(f"   ✅ تم استرجاع الجلسة: {retrieved.session_key}")
    
    # Try to update it
    print("\n4️⃣ محاولة تحديث الجلسة...")
    retrieved.session_data = 'updated_data'
    retrieved.save()
    print("   ✅ تم تحديث الجلسة بنجاح!")
    
    # Clean up
    print("\n5️⃣ تنظيف...")
    retrieved.delete()
    print("   ✅ تم حذف الجلسة التجريبية")
    
    print("\n" + "=" * 60)
    print("✅ جميع الاختبارات نجحت!")
    print("=" * 60)
    
except Exception as e:
    print(f"\n❌ خطأ: {e}")
    print("\n📋 تفاصيل الخطأ:")
    traceback.print_exc()
    
    print("\n" + "=" * 60)
    print("فحص نموذج Session")
    print("=" * 60)
    
    # Check Session model
    print(f"\nSession Model: {Session}")
    print(f"Session._meta.pk: {Session._meta.pk}")
    print(f"Session._meta.pk.name: {Session._meta.pk.name}")
    print(f"Session._meta.pk.attname: {Session._meta.pk.attname}")
    
    # Check all fields
    print("\nجميع الحقول:")
    for field in Session._meta.get_fields():
        print(f"  - {field.name}: {field.__class__.__name__}")
        if hasattr(field, 'primary_key'):
            print(f"    Primary Key: {field.primary_key}")