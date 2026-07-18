import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from django.contrib import admin
from products.models_coupons import Coupon

print("🔍 Verifying Coupons System...\n")

# Check if Coupon model is registered in admin
print("1️⃣ Checking Admin Registration:")
if Coupon in admin.site._registry:
    print("   ✅ Coupon model is registered in admin")
    admin_class = admin.site._registry[Coupon]
    print(f"   Admin Class: {admin_class.__class__.__name__}")
else:
    print("   ❌ Coupon model is NOT registered in admin")

# Check database
print("\n2️⃣ Checking Database:")
try:
    count = Coupon.objects.count()
    print(f"   ✅ Found {count} coupons in database")
    
    active_count = Coupon.objects.filter(is_active=True).count()
    print(f"   ✅ {active_count} active coupons")
except Exception as e:
    print(f"   ❌ Error: {e}")

# List all coupons
print("\n3️⃣ Available Coupons:")
coupons = Coupon.objects.all()
for coupon in coupons:
    status = "🟢 نشط" if coupon.is_active else "🔴 غير نشط"
    print(f"   {status} {coupon.code}: {coupon.description}")

# Check admin URL
print("\n4️⃣ Admin URLs:")
print("   📍 Main Admin: http://127.0.0.1:8000/admin/")
print("   📍 Coupons List: http://127.0.0.1:8000/admin/products/coupon/")
print("   📍 Add Coupon: http://127.0.0.1:8000/admin/products/coupon/add/")

print("\n✅ Verification Complete!")
print("\n💡 Next Steps:")
print("   1. Make sure Django server is running: python manage.py runserver")
print("   2. Open browser and go to: http://127.0.0.1:8000/admin/")
print("   3. Login with admin credentials")
print("   4. Navigate to 'المنتجات' → 'كوبونات الخصم'")