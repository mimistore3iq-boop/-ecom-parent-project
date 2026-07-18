
import os
import sys
import django

# Set up Django
sys.path.append('./backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from products.models import Product, Category

def check_database_data():
    """Checks and prints data from the database."""
    print("--- Checking Categories ---")
    categories = Category.objects.all()
    if categories.exists():
        for category in categories:
            print(f"- Category: {category.name} (ID: {category.id})")
    else:
        print("No categories found.")

    print("\n--- Checking Products ---")
    products = Product.objects.all()
    if products.exists():
        for product in products:
            print(f"- Product: {product.name} (ID: {product.id}), Category: {product.category.name if product.category else 'None'}")
    else:
        print("No products found.")

if __name__ == "__main__":
    check_database_data()

