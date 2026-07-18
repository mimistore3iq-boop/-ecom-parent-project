import os
import sys
import django
import sqlite3
from datetime import datetime, timedelta

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from django.conf import settings
from django.utils import timezone

print("🔧 Fixing coupon dates with timezone awareness...\n")

# Get database path
db_path = settings.DATABASES['default']['NAME']
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all coupons
cursor.execute("SELECT id, code, start_date, end_date FROM products_coupon")
coupons = cursor.fetchall()

# Set start date to 1 hour ago to ensure it's in the past
now = timezone.now()
start_time = now - timedelta(hours=1)

print(f"Current time: {now}")
print(f"Setting start time to: {start_time}\n")

for coupon_id, code, old_start_date, old_end_date in coupons:
    # Parse dates
    old_start_dt = datetime.fromisoformat(old_start_date.replace('T', ' '))
    old_end_dt = datetime.fromisoformat(old_end_date.replace('T', ' '))
    
    # Calculate duration
    duration = old_end_dt - old_start_dt
    
    # Set new dates (start 1 hour ago)
    new_start = start_time
    new_end = new_start + duration
    
    # Update in database
    cursor.execute("""
        UPDATE products_coupon 
        SET start_date = ?, end_date = ?
        WHERE id = ?
    """, (new_start.isoformat(), 
          new_end.isoformat(), 
          coupon_id))
    
    print(f"✅ Updated {code}:")
    print(f"   Duration: {duration.days} days")
    print(f"   New Start: {new_start}")
    print(f"   New End: {new_end}\n")

conn.commit()
conn.close()

print("✅ All coupon dates updated successfully!")
print("\n🧪 Testing validation...")

# Test validation
from products.models_coupons import Coupon
from decimal import Decimal

test_coupon = Coupon.objects.get(code='WELCOME10')
is_valid, message = test_coupon.is_valid(Decimal('150.00'))
print(f"\nWELCOME10 validation: {is_valid} - {message}")