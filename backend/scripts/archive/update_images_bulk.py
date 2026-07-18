"""
سكريبت لتحديث روابط الصور بشكل جماعي
يمكن استخدامه لتحديث صور المنتجات والإعلانات
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from products.models import Product, Banner

def update_product_images():
    """
    تحديث صور المنتجات
    استبدل الروابط القديمة بالجديدة
    """
    print("=" * 80)
    print("تحديث صور المنتجات")
    print("=" * 80)
    
    # مثال: تحديث منتج معين
    # product_id = 1
    # new_main_image = "https://i.ibb.co/xxxxx/image1.jpg"
    # new_image_2 = "https://i.ibb.co/xxxxx/image2.jpg"
    # new_image_3 = "https://i.ibb.co/xxxxx/image3.jpg"
    # new_image_4 = "https://i.ibb.co/xxxxx/image4.jpg"
    
    # product = Product.objects.get(id=product_id)
    # product.main_image = new_main_image
    # product.image_2 = new_image_2
    # product.image_3 = new_image_3
    # product.image_4 = new_image_4
    # product.save()
    # print(f"✅ تم تحديث صور المنتج: {product.name}")
    
    # أو: تحديث جميع المنتجات
    products = Product.objects.all()
    print(f"\nعدد المنتجات: {products.count()}\n")
    
    for product in products:
        print(f"المنتج #{product.id}: {product.name}")
        print(f"  الصورة الرئيسية: {product.main_image or 'لا توجد'}")
        print(f"  الصورة الثانية: {product.image_2 or 'لا توجد'}")
        print(f"  الصورة الثالثة: {product.image_3 or 'لا توجد'}")
        print(f"  الصورة الرابعة: {product.image_4 or 'لا توجد'}")
        print("-" * 80)

def update_banner_images():
    """
    تحديث صور الإعلانات
    """
    print("\n" + "=" * 80)
    print("تحديث صور الإعلانات")
    print("=" * 80)
    
    banners = Banner.objects.all()
    print(f"\nعدد الإعلانات: {banners.count()}\n")
    
    for banner in banners:
        print(f"الإعلان #{banner.id}: {banner.title}")
        print(f"  الصورة: {banner.image_url or 'لا توجد'}")
        print(f"  نشط: {'نعم' if banner.is_active else 'لا'}")
        print("-" * 80)

def add_multiple_images_to_product(product_id, images_dict):
    """
    إضافة صور متعددة لمنتج معين
    
    مثال الاستخدام:
    add_multiple_images_to_product(1, {
        'main_image': 'https://i.ibb.co/xxxxx/image1.jpg',
        'image_2': 'https://i.ibb.co/xxxxx/image2.jpg',
        'image_3': 'https://i.ibb.co/xxxxx/image3.jpg',
        'image_4': 'https://i.ibb.co/xxxxx/image4.jpg',
    })
    """
    try:
        product = Product.objects.get(id=product_id)
        
        if 'main_image' in images_dict:
            product.main_image = images_dict['main_image']
        if 'image_2' in images_dict:
            product.image_2 = images_dict['image_2']
        if 'image_3' in images_dict:
            product.image_3 = images_dict['image_3']
        if 'image_4' in images_dict:
            product.image_4 = images_dict['image_4']
        
        product.save()
        print(f"✅ تم تحديث صور المنتج: {product.name}")
        print(f"   عدد الصور: {len(product.all_images)}")
        return True
    except Product.DoesNotExist:
        print(f"❌ المنتج #{product_id} غير موجود")
        return False

def check_broken_images():
    """
    فحص الصور المفقودة أو الروابط المعطلة
    """
    print("\n" + "=" * 80)
    print("فحص الصور المفقودة")
    print("=" * 80)
    
    # فحص المنتجات
    products_without_main_image = Product.objects.filter(main_image__isnull=True) | Product.objects.filter(main_image='')
    print(f"\n⚠️ منتجات بدون صورة رئيسية: {products_without_main_image.count()}")
    for p in products_without_main_image:
        print(f"   - {p.name} (ID: {p.id})")
    
    # فحص الإعلانات
    banners_without_image = Banner.objects.filter(image_url__isnull=True) | Banner.objects.filter(image_url='')
    print(f"\n⚠️ إعلانات بدون صورة: {banners_without_image.count()}")
    for b in banners_without_image:
        print(f"   - {b.title} (ID: {b.id})")

def main():
    """
    الدالة الرئيسية
    """
    print("\n🔧 سكريبت تحديث الصور - MIMI STORE")
    print("=" * 80)
    
    # عرض المعلومات الحالية
    update_product_images()
    update_banner_images()
    check_broken_images()
    
    print("\n" + "=" * 80)
    print("✅ انتهى الفحص")
    print("=" * 80)
    
    print("\n📝 لتحديث صور منتج معين، استخدم:")
    print("   add_multiple_images_to_product(product_id, images_dict)")
    print("\nمثال:")
    print("""
    add_multiple_images_to_product(1, {
        'main_image': 'https://i.ibb.co/xxxxx/image1.jpg',
        'image_2': 'https://i.ibb.co/xxxxx/image2.jpg',
        'image_3': 'https://i.ibb.co/xxxxx/image3.jpg',
        'image_4': 'https://i.ibb.co/xxxxx/image4.jpg',
    })
    """)

if __name__ == '__main__':
    main()