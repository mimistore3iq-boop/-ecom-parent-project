
import os
import sys
import django
from datetime import datetime, timedelta

# إضافة مسار المشروع إلى مسار بايثون
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# إعدادات Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from products.models_coupons import Coupon
from products.models import Product, Category

def create_sample_coupons():
    """إنشاء كوبونات نموذجية"""

    # كوبون نسبة مئوية
    coupon1 = Coupon.objects.create(
        code='WELCOME10',
        description='خصم ترحيبي 10% لأول طلب',
        discount_type='percentage',
        discount_value=10,
        minimum_order_amount=100,
        max_discount_amount=50,
        start_date=datetime.now(),
        end_date=datetime.now() + timedelta(days=30),
        usage_limit=100,
        is_active=True
    )
    print(f"تم إنشاء كوبون: {coupon1.code}")

    # كوبون قيمة ثابتة
    coupon2 = Coupon.objects.create(
        code='SAVE20',
        description='خصم 20 ريال على طلبك',
        discount_type='fixed',
        discount_value=20,
        minimum_order_amount=50,
        start_date=datetime.now(),
        end_date=datetime.now() + timedelta(days=15),
        usage_limit=50,
        is_active=True
    )
    print(f"تم إنشاء كوبون: {coupon2.code}")

    # كوبون نسبة مئوية عالي
    coupon3 = Coupon.objects.create(
        code='SPECIAL25',
        description='خصم 25% على المنتجات المميزة',
        discount_type='percentage',
        discount_value=25,
        minimum_order_amount=200,
        max_discount_amount=100,
        start_date=datetime.now(),
        end_date=datetime.now() + timedelta(days=7),
        usage_limit=30,
        is_active=True
    )
    print(f"تم إنشاء كوبون: {coupon3.code}")

    # كوبون لقسم معين
    try:
        # الحصول على قسم الهواتف الذكية (إذا كان موجودًا)
        phones_category = Category.objects.filter(name__icontains='هواتف').first()
        if phones_category:
            coupon4 = Coupon.objects.create(
                code='PHONES15',
                description='خصم 15% على جميع الهواتف الذكية',
                discount_type='percentage',
                discount_value=15,
                minimum_order_amount=300,
                start_date=datetime.now(),
                end_date=datetime.now() + timedelta(days=20),
                usage_limit=40,
                is_active=True
            )
            coupon4.applicable_categories.add(phones_category)
            print(f"تم إنشاء كوبون: {coupon4.code} لقسم {phones_category.name}")
        else:
            print("لم يتم العثور على قسم الهواتف الذكية")
    except Exception as e:
        print(f"حدث خطأ أثناء إنشاء كوبون القسم: {e}")

    # كوبون باستثناء منتجات معينة
    try:
        # الحصول على منتجات للاستثناء
        expensive_products = Product.objects.filter(price__gte=1000)[:3]
        if expensive_products:
            coupon5 = Coupon.objects.create(
                code='EXCLUDE30',
                description='خصم 30% (لا يشمل المنتجات باهظة الثمن)',
                discount_type='percentage',
                discount_value=30,
                minimum_order_amount=150,
                start_date=datetime.now(),
                end_date=datetime.now() + timedelta(days=10),
                usage_limit=25,
                is_active=True
            )
            for product in expensive_products:
                coupon5.excluded_products.add(product)
            print(f"تم إنشاء كوبون: {coupon5.code} مع استثناء {len(expensive_products)} منتجات")
        else:
            print("لم يتم العثور على منتجات باهظة الثمن")
    except Exception as e:
        print(f"حدث خطأ أثناء إنشاء كوبون الاستثناء: {e}")

    # كوبون غير نشط (للاختبار)
    coupon6 = Coupon.objects.create(
        code='INACTIVE5',
        description='كوبون غير نشط للاختبار',
        discount_type='percentage',
        discount_value=5,
        minimum_order_amount=50,
        start_date=datetime.now(),
        end_date=datetime.now() + timedelta(days=5),
        usage_limit=10,
        is_active=False
    )
    print(f"تم إنشاء كوبون غير نشط: {coupon6.code}")

    # كوبون منتهي الصلاحية (للاختبار)
    coupon7 = Coupon.objects.create(
        code='EXPIRED15',
        description='كوبون منتهي الصلاحية للاختبار',
        discount_type='percentage',
        discount_value=15,
        minimum_order_amount=100,
        start_date=datetime.now() - timedelta(days=10),
        end_date=datetime.now() - timedelta(days=1),
        usage_limit=20,
        is_active=True
    )
    print(f"تم إنشاء كوبون منتهي الصلاحية: {coupon7.code}")

if __name__ == '__main__':
    print("بدء إنشاء كوبونات نموذجية...")
    create_sample_coupons()
    print("اكتمل إنشاء الكوبونات النموذجية!")
