#!/usr/bin/env python
"""
Add sample image URLs to products for testing
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from products.models import Product

# Sample image URLs from Unsplash (real working URLs)
sample_images = [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop",
]

# Update first 5 products with images
products = Product.objects.all()[:5]
for idx, product in enumerate(products):
    product.main_image = sample_images[idx % len(sample_images)]
    product.image_2 = sample_images[(idx + 1) % len(sample_images)]
    product.save()
    print(f"✅ Updated product: {product.name}")
    print(f"   Main image: {product.main_image[:60]}...")

print(f"\n✅ تم إضافة صور لـ {len(products)} منتجات بنجاح!")
print("🔄 الآن قم بـ:")
print("   1. إعادة تحميل صفحة Admin panel")
print("   2. مسح الـ cache (Ctrl + Shift + Delete)")
print("   3. تحميل الصفحة مجدداً (Ctrl + Shift + R)")