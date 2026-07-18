import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from products.models import Product

print("Checking product images...")
print("=" * 80)

products = Product.objects.all()[:5]
for p in products:
    print(f"\nProduct ID: {p.id}")
    print(f"Name: {p.name}")
    print(f"main_image: {p.main_image}")
    print(f"image_2: {p.image_2}")
    print(f"image_3: {p.image_3}")
    print(f"image_4: {p.image_4}")
    print("-" * 80)

# Check products with multiple images
multi_image_products = Product.objects.filter(image_2__isnull=False)
print(f"\n\nProducts with image_2: {multi_image_products.count()}")