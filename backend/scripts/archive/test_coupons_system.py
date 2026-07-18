import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from products.models_coupons import Coupon
from decimal import Decimal

print("🧪 Testing Coupons System...\n")

# Test 1: Check if coupons exist
print("1️⃣ Checking coupons in database...")
coupons = Coupon.objects.all()
print(f"   ✅ Found {coupons.count()} coupons")
for coupon in coupons:
    print(f"   - {coupon.code}: {coupon.description}")

# Test 2: Check active coupons
print("\n2️⃣ Checking active coupons...")
active_coupons = Coupon.objects.filter(is_active=True)
print(f"   ✅ Found {active_coupons.count()} active coupons")

# Test 3: Validate a coupon
print("\n3️⃣ Testing coupon validation...")
try:
    coupon = Coupon.objects.get(code='WELCOME10')
    cart_total = Decimal('150.00')
    is_valid, message = coupon.is_valid(cart_total)
    print(f"   Coupon: {coupon.code}")
    print(f"   Cart Total: {cart_total} ريال")
    print(f"   Valid: {is_valid}")
    print(f"   Message: {message}")
    
    if is_valid:
        # Calculate discount
        if coupon.discount_type == 'percentage':
            discount = cart_total * (coupon.discount_value / Decimal('100'))
            if coupon.max_discount_amount and discount > coupon.max_discount_amount:
                discount = coupon.max_discount_amount
        else:
            discount = min(coupon.discount_value, cart_total)
        
        print(f"   Discount: {discount} ريال")
        print(f"   Final Total: {cart_total - discount} ريال")
except Coupon.DoesNotExist:
    print("   ❌ Coupon WELCOME10 not found")

# Test 4: Check coupon with insufficient cart total
print("\n4️⃣ Testing coupon with insufficient cart total...")
try:
    coupon = Coupon.objects.get(code='WELCOME10')
    cart_total = Decimal('50.00')  # Less than minimum
    is_valid, message = coupon.is_valid(cart_total)
    print(f"   Coupon: {coupon.code}")
    print(f"   Cart Total: {cart_total} ريال")
    print(f"   Minimum Required: {coupon.minimum_order_amount} ريال")
    print(f"   Valid: {is_valid}")
    print(f"   Message: {message}")
except Coupon.DoesNotExist:
    print("   ❌ Coupon not found")

# Test 5: Check fixed discount coupon
print("\n5️⃣ Testing fixed discount coupon...")
try:
    coupon = Coupon.objects.get(code='SAVE20')
    cart_total = Decimal('100.00')
    is_valid, message = coupon.is_valid(cart_total)
    print(f"   Coupon: {coupon.code}")
    print(f"   Type: {coupon.get_discount_type_display()}")
    print(f"   Discount Value: {coupon.discount_value} ريال")
    print(f"   Cart Total: {cart_total} ريال")
    print(f"   Valid: {is_valid}")
    
    if is_valid:
        discount = min(coupon.discount_value, cart_total)
        print(f"   Discount: {discount} ريال")
        print(f"   Final Total: {cart_total - discount} ريال")
except Coupon.DoesNotExist:
    print("   ❌ Coupon not found")

print("\n✅ All tests completed!")
print("\n📋 Summary:")
print(f"   Total Coupons: {Coupon.objects.count()}")
print(f"   Active Coupons: {Coupon.objects.filter(is_active=True).count()}")
print(f"   Percentage Coupons: {Coupon.objects.filter(discount_type='percentage').count()}")
print(f"   Fixed Coupons: {Coupon.objects.filter(discount_type='fixed').count()}")