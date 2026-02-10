
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from products.models import Product, Category

print(f"Total Products: {Product.objects.count()}")
print(f"Total Categories: {Category.objects.count()}")

for cat in Category.objects.all():
    print(f"Category: {cat.name} (ID: {cat.id}) - Products: {Product.objects.filter(category=cat).count()}")
