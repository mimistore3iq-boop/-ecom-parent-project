
import os
import sys
import django
from datetime import datetime, timedelta

# إضافة مسار المشروع إلى مسار بايثون
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# إعدادات Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from products.models import Product, Category, Banner
from products.models_coupons import Coupon
from django.conf import settings

def fix_all_issues():
    """إصلاح جميع المشاكل المذكورة"""

    print("بدء إصلاح المشاكل...")

    # 1. إنشاء كوبونات نموذجية
    print("
1. إنشاء كوبونات نموذجية...")
    create_sample_coupons()

    # 2. إنشاء بانرات نموذجية
    print("
2. إنشاء بانرات نموذجية...")
    create_sample_banners()

    # 3. التحقق من تكوين imgBB
    print("
3. التحقق من تكوين imgBB...")
    check_imgbb_config()

    print("
اكتمل إصلاح جميع المشاكل!")

def create_sample_coupons():
    """إنشاء كوبونات نموذجية"""

    # كوبون نسبة مئوية
    coupon1, created = Coupon.objects.get_or_create(
        code='WELCOME10',
        defaults={
            'description': 'خصم ترحيبي 10% لأول طلب',
            'discount_type': 'percentage',
            'discount_value': 10,
            'minimum_order_amount': 100,
            'max_discount_amount': 50,
            'start_date': datetime.now(),
            'end_date': datetime.now() + timedelta(days=30),
            'usage_limit': 100,
            'is_active': True
        }
    )
    if created:
        print(f"تم إنشاء كوبون: {coupon1.code}")
    else:
        print(f"الكوبون موجود بالفعل: {coupon1.code}")

    # كوبون قيمة ثابتة
    coupon2, created = Coupon.objects.get_or_create(
        code='SAVE20',
        defaults={
            'description': 'خصم 20 ريال على طلبك',
            'discount_type': 'fixed',
            'discount_value': 20,
            'minimum_order_amount': 50,
            'start_date': datetime.now(),
            'end_date': datetime.now() + timedelta(days=15),
            'usage_limit': 50,
            'is_active': True
        }
    )
    if created:
        print(f"تم إنشاء كوبون: {coupon2.code}")
    else:
        print(f"الكوبون موجود بالفعل: {coupon2.code}")

    # كوبون نسبة مئوية عالي
    coupon3, created = Coupon.objects.get_or_create(
        code='SPECIAL25',
        defaults={
            'description': 'خصم 25% على المنتجات المميزة',
            'discount_type': 'percentage',
            'discount_value': 25,
            'minimum_order_amount': 200,
            'max_discount_amount': 100,
            'start_date': datetime.now(),
            'end_date': datetime.now() + timedelta(days=7),
            'usage_limit': 30,
            'is_active': True
        }
    )
    if created:
        print(f"تم إنشاء كوبون: {coupon3.code}")
    else:
        print(f"الكوبون موجود بالفعل: {coupon3.code}")

def create_sample_banners():
    """إنشاء بانرات نموذجية"""

    # إنشاء بانرات نموذجية
    banner_data = [
        {
            'title': 'تخفيضات الصيف',
            'description': 'خصم يصل إلى 50% على جميع منتجات الصيف',
            'image_url': 'https://i.ibb.co/8X0Q2vN/summer-sale.jpg',
            'link_url': '/products/?featured=true',
            'is_active': True,
            'display_order': 1
        },
        {
            'title': 'منتجات جديدة',
            'description': 'استكشف أحدث منتجاتنا المضافة',
            'image_url': 'https://i.ibb.co/3dX0qQJ/new-products.jpg',
            'link_url': '/products/',
            'is_active': True,
            'display_order': 2
        },
        {
            'title': 'عروض الأسبوع',
            'description': 'عروض خاصة لهذا الأسبوع فقط',
            'image_url': 'https://i.ibb.co/2Z7QfVf/weekly-offers.jpg',
            'link_url': '/products/?discount=true',
            'is_active': True,
            'display_order': 3
        },
        {
            'title': 'توصيل مجاني',
            'description': 'توصيل مجاني لجميع الطلبات فوق 100 ريال',
            'image_url': 'https://i.ibb.co/6WZqQ0T/free-shipping.jpg',
            'link_url': '/products/',
            'is_active': True,
            'display_order': 4
        }
    ]

    for data in banner_data:
        banner, created = Banner.objects.get_or_create(
            title=data['title'],
            defaults=data
        )
        if created:
            print(f"تم إنشاء بانر: {banner.title}")
        else:
            # تحديث البانر الموجود
            for key, value in data.items():
                setattr(banner, key, value)
            banner.save()
            print(f"تم تحديث بانر: {banner.title}")

def check_imgbb_config():
    """التحقق من تكوين imgBB"""

    api_key = getattr(settings, 'IMGBB_API_KEY', None)
    if api_key:
        print(f"تم تكوين مفتاح API الخاص بـ imgBB: {api_key[:10]}...")
    else:
        print("لم يتم تكوين مفتاح API الخاص بـ imgBB")

    # التحقق من البانرات الحالية وتحديثها
    banners = Banner.objects.all()
    for banner in banners:
        if not banner.image_url:
            print(f"البانر '{banner.title}' لا يحتوي على رابط صورة")
        else:
            print(f"البانر '{banner.title}' يحتوي على رابط صورة: {banner.image_url}")

if __name__ == '__main__':
    fix_all_issues()
