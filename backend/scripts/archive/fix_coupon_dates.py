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

print("🔧 Fixing coupon dates using direct SQL...\n")

# Get database path
db_path = settings.DATABASES['default']['NAME']
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all coupons
cursor.execute("SELECT id, code, start_date, end_date FROM products_coupon")
coupons = cursor.fetchall()

now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

for coupon_id, code, start_date, end_date in coupons:
    # Parse dates (handle ISO format)
    start_dt = datetime.fromisoformat(start_date.replace('T', ' '))
    end_dt = datetime.fromisoformat(end_date.replace('T', ' '))
    
    # Calculate duration
    duration = end_dt - start_dt
    
    # Set new dates
    new_start = datetime.now()
    new_end = new_start + duration
    
    # Update in database (use ISO format)
    cursor.execute("""
        UPDATE products_coupon 
        SET start_date = ?, end_date = ?
        WHERE id = ?
    """, (new_start.isoformat(), 
          new_end.isoformat(), 
          coupon_id))
    
    print(f"✅ Updated {code}:")
    print(f"   Old: {start_date} → {end_date}")
    print(f"   New: {new_start} → {new_end}\n")

conn.commit()
conn.close()

print("✅ All coupon dates updated successfully!")