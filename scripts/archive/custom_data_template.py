#!/usr/bin/env python3
"""
قالب لإضافة أقسام ومنتجات مخصصة
يمكنك تعديل هذا الملف لإضافة البيانات التي تريدها
"""

import os
import sys
import django
from decimal import Decimal

# إعداد Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from products.models import Category, Product

def create_my_custom_categories():
    """
    أضف أقسامك المخصصة هنا
    """
    
    # 🔧 عدّل هذه القائمة لإضافة أقسامك
    my_categories = [
        {
            'name': 'اسم القسم الأول',           # غيّر هذا
            'description': 'وصف القسم الأول'    # غيّر هذا
        },
        {
            'name': 'اسم القسم الثاني',          # غيّر هذا
            'description': 'وصف القسم الثاني'   # غيّر هذا
        },
        # أضف المزيد من الأقسام هنا...
    ]
    
    created_categories = []
    
    for cat_data in my_categories:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={
                'description': cat_data['description'],
                'is_active': True
            }
        )
        
        if created:
            print(f"✅ تم إنشاء قسم: {category.name}")
        else:
            print(f"📂 القسم موجود مسبقاً: {category.name}")
        
        created_categories.append(category)
    
    return created_categories

def create_my_custom_products():
    """
    أضف منتجاتك المخصصة هنا
    """
    
    # 🔧 عدّل هذه القائمة لإضافة منتجاتك
    # تأكد من أن اسم القسم موجود في قاعدة البيانات
    
    my_products = [
        {
            'category_name': 'اسم القسم الأول',    # يجب أن يطابق اسم قسم موجود
            'products': [
                {
                    'name': 'اسم المنتج الأول',
                    'description': 'وصف المنتج الأول',
                    'price': Decimal('100.00'),        # السعر
                    'brand': 'العلامة التجارية',
                    'stock_quantity': 50,              # الكمية المتوفرة
                    'is_featured': True,               # هل المنتج مميز؟
                    'discount_percentage': 10          # نسبة الخصم (اختياري)
                },
                {
                    'name': 'اسم المنتج الثاني',
                    'description': 'وصف المنتج الثاني',
                    'price': Decimal('200.00'),
                    'brand': 'علامة تجارية أخرى',
                    'stock_quantity': 30,
                    'is_featured': False,
                    'discount_percentage': 15
                },
                # أضف المزيد من المنتجات هنا...
            ]
        },
        {
            'category_name': 'اسم القسم الثاني',
            'products': [
                {
                    'name': 'منتج القسم الثاني',
                    'description': 'وصف منتج القسم الثاني',
                    'price': Decimal('300.00'),
                    'brand': 'علامة تجارية',
                    'stock_quantity': 25,
                    'is_featured': True,
                    'discount_percentage': 20
                },
                # أضف المزيد من المنتجات هنا...
            ]
        },
        # أضف المزيد من الأقسام والمنتجات هنا...
    ]
    
    created_count = 0
    
    for category_data in my_products:
        try:
            category = Category.objects.get(name=category_data['category_name'])
            print(f"\n📂 إضافة منتجات لقسم: {category.name}")
            
            for product_data in category_data['products']:
                # حساب السعر بعد الخصم
                original_price = product_data['price']
                discount = product_data.get('discount_percentage', 0)
                discounted_price = original_price * (1 - Decimal(discount) / 100) if discount > 0 else None
                
                product, created = Product.objects.get_or_create(
                    name=product_data['name'],
                    defaults={
                        'category': category,
                        'description': product_data['description'],
                        'price': original_price,
                        'discounted_price': discounted_price,
                        'discount_percentage': discount if discount > 0 else None,
                        'brand': product_data['brand'],
                        'stock_quantity': product_data['stock_quantity'],
                        'is_active': True,
                        'is_featured': product_data['is_featured']
                    }
                )
                
                if created:
                    print(f"  ✅ {product.name} - {original_price} ريال")
                    if discount > 0:
                        print(f"     💰 خصم {discount}% - السعر بعد الخصم: {discounted_price:.2f} ريال")
                    created_count += 1
                else:
                    print(f"  📦 {product.name} - موجود مسبقاً")
        
        except Category.DoesNotExist:
            print(f"❌ القسم '{category_data['category_name']}' غير موجود!")
            print("   يرجى إنشاء القسم أولاً أو التأكد من الاسم")
    
    return created_count

def main():
    """الدالة الرئيسية"""
    print("🚀 إضافة البيانات المخصصة لمتجر MIMI STORE...")
    print("=" * 50)
    
    try:
        # إنشاء الأقسام المخصصة
        print("📂 إنشاء الأقسام المخصصة...")
        categories = create_my_custom_categories()
        
        # إنشاء المنتجات المخصصة
        print("\n📦 إنشاء المنتجات المخصصة...")
        products_count = create_my_custom_products()
        
        print(f"\n🎉 تم الانتهاء!")
        print(f"📊 الإحصائيات:")
        print(f"   - إجمالي الأقسام: {Category.objects.count()}")
        print(f"   - إجمالي المنتجات: {Product.objects.count()}")
        print(f"   - المنتجات المضافة: {products_count}")
        
    except Exception as e:
        print(f"❌ حدث خطأ: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("📝 تعليمات:")
    print("1. عدّل البيانات في هذا الملف حسب احتياجاتك")
    print("2. احفظ الملف")
    print("3. شغّل الملف مرة أخرى")
    print()
    
    response = input("هل تريد المتابعة؟ (y/n): ")
    if response.lower() in ['y', 'yes', 'نعم']:
        success = main()
        if success:
            print("\n✨ تم إضافة البيانات بنجاح!")
        else:
            print("\n💥 فشل في إضافة البيانات!")
    else:
        print("تم الإلغاء.")
    
    input("\nاضغط Enter للخروج...")