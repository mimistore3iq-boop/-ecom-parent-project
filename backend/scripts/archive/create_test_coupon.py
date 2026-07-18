import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from products.models_coupons import Coupon
from django.utils import timezone

# Create a test coupon
coupon, created = Coupon.objects.get_or_create(
    code='TEST2024',
    defaults={
        'description': 'كوبون تجريبي للاختبار',
        'discount_type': 'percentage',
        'discount_value': 10,
        'minimum_order_amount': 100,
        'max_discount_amount': 50,
        'start_date': timezone.now(),
        'end_date': timezone.now() + timedelta(days=30),
        'usage_limit': 100,
        'is_active': True
    }
)

if created:
    print(f"✅ تم إنشاء كوبون جديد: {coupon.code}")
else:
    print(f"ℹ️ الكوبون موجود بالفعل: {coupon.code}")

print(f"\nتفاصيل الكوبون:")
print(f"  - الكود: {coupon.code}")
print(f"  - نوع الخصم: {coupon.get_discount_type_display()}")
print(f"  - قيمة الخصم: {coupon.discount_value}")
print(f"  - الحد الأدنى للطلب: {coupon.minimum_order_amount}")
print(f"  - نشط: {coupon.is_active}")

# Count all coupons
total_coupons = Coupon.objects.count()
print(f"\n📊 إجمالي الكوبونات في قاعدة البيانات: {total_coupons}")

# List all coupons
print("\n📋 قائمة جميع الكوبونات:")
for c in Coupon.objects.all():
    print(f"  - {c.code} ({c.get_discount_display()}) - {'نشط' if c.is_active else 'غير نشط'}")