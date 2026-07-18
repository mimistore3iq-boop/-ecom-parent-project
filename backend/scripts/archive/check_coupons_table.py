import sqlite3
import os

# Path to database
db_path = os.path.join(os.path.dirname(__file__), 'db.sqlite3')

print(f"🔍 Checking coupons tables...")
print(f"📁 Database: {db_path}\n")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check if coupons tables exist
tables = ['products_coupon', 'products_couponusage']

for table in tables:
    cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
    exists = cursor.fetchone()
    
    if exists:
        cursor.execute(f"PRAGMA table_info({table})")
        columns = cursor.fetchall()
        print(f"✅ {table}:")
        for col in columns:
            print(f"   - {col[1]} ({col[2]})")
        
        # Count records
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"   📊 Records: {count}")
    else:
        print(f"❌ {table}: NOT FOUND")
    print()

conn.close()