import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
os.environ.setdefault('DEBUG', 'False')  # Force PostgreSQL path in settings.py
# The DATABASE_URL is already in .env, and decoupling/settings.py will pick it up
# But we ensure it's loaded if not picked up automatically
from decouple import config
print(f"DATABASE_URL from env: {config('DATABASE_URL', default='NOT FOUND')[:20]}...")

import django
django.setup()

from products.models import Product
from products.serializers import ProductSerializer
import traceback
import sys

# Force UTF-8 for printing on Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def debug_products():
    print("--- Diagnostic Script Started ---")
    try:
        products = Product.objects.all()
        print(f"Total products in DB: {products.count()}")
        
        for p in products:
            print(f"\nChecking Product ID: {p.id}, Name: {p.name}")
            print(f"  Price: {p.price}")
            print(f"  Discount Price: {p.discount_price}")
            print(f"  Discount Amount: {p.discount_amount}")
            print(f"  Category: {p.category}")
            
            try:
                # Test model properties
                print(f"  is_on_sale: {p.is_on_sale}")
                print(f"  discounted_price: {p.discounted_price}")
                print(f"  discount_percentage: {p.discount_percentage}")
                print(f"  time_left: {p.time_left}")
            except Exception as prop_e:
                print(f"  ❌ Error in model property: {prop_e}")
                traceback.print_exc()
            
            try:
                # Test serialization for this specific product
                serializer = ProductSerializer(p)
                data = serializer.data
                print(f"  ✅ Serialized successfully")
            except Exception as ser_e:
                print(f"  ❌ Serialization FAILED for this product: {ser_e}")
                traceback.print_exc()

        print("\n--- Final Bulk Serialization Test ---")
        try:
            serializer = ProductSerializer(products, many=True)
            data = serializer.data
            print(f"Bulk serialization successful! Count: {len(data)}")
        except Exception as bulk_e:
            print(f"❌ Bulk serialization FAILED: {bulk_e}")
            traceback.print_exc()

    except Exception as e:
        print(f"❌ General Error: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    debug_products()
