import os
import sys
import django
from datetime import datetime

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from products.models_coupons import Coupon
from django.utils import timezone

print("🔍 Checking coupon dates...\n")

now = timezone.now()
print(f"Current time (timezone aware): {now}")
print(f"Current time (naive): {datetime.now()}\n")

coupons = Coupon.objects.all()

for coupon in coupons:
    print(f"Coupon: {coupon.code}")
    print(f"  Start Date: {coupon.start_date}")
    print(f"  Start Date Type: {type(coupon.start_date)}")
    print(f"  End Date: {coupon.end_date}")
    print(f"  End Date Type: {type(coupon.end_date)}")
    print(f"  Is Active: {coupon.is_active}")
    
    # Check comparison
    print(f"  now < start_date: {now < coupon.start_date}")
    print(f"  now > end_date: {now > coupon.end_date}")
    
    is_valid, message = coupon.is_valid()
    print(f"  Valid: {is_valid} - {message}\n")