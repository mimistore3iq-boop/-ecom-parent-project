import sqlite3
import os
import uuid
from datetime import datetime, timedelta

# Path to database
db_path = os.path.join(os.path.dirname(__file__), 'db.sqlite3')

print(f"🎫 Adding sample coupons...")
print(f"📁 Database: {db_path}\n")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Sample coupons data
    coupons = [
        {
            'id': str(uuid.uuid4()),
            'code': 'WELCOME10',
            'description': 'خصم ترحيبي 10% لأول طلب',
            'discount_type': 'percentage',
            'discount_value': 10.00,
            'minimum_order_amount': 100.00,
            'max_discount_amount': 50.00,
            'start_date': datetime.now().isoformat(),
            'end_date': (datetime.now() + timedelta(days=30)).isoformat(),
            'usage_limit': 100,
            'used_count': 0,
            'is_active': 1,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'code': 'SAVE20',
            'description': 'خصم 20 ريال على طلبك',
            'discount_type': 'fixed',
            'discount_value': 20.00,
            'minimum_order_amount': 50.00,
            'max_discount_amount': None,
            'start_date': datetime.now().isoformat(),
            'end_date': (datetime.now() + timedelta(days=15)).isoformat(),
            'usage_limit': 50,
            'used_count': 0,
            'is_active': 1,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'code': 'SPECIAL25',
            'description': 'خصم 25% على المنتجات المميزة',
            'discount_type': 'percentage',
            'discount_value': 25.00,
            'minimum_order_amount': 200.00,
            'max_discount_amount': 100.00,
            'start_date': datetime.now().isoformat(),
            'end_date': (datetime.now() + timedelta(days=7)).isoformat(),
            'usage_limit': 30,
            'used_count': 0,
            'is_active': 1,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'code': 'SUMMER50',
            'description': 'خصم صيفي 50 ريال',
            'discount_type': 'fixed',
            'discount_value': 50.00,
            'minimum_order_amount': 150.00,
            'max_discount_amount': None,
            'start_date': datetime.now().isoformat(),
            'end_date': (datetime.now() + timedelta(days=60)).isoformat(),
            'usage_limit': 200,
            'used_count': 0,
            'is_active': 1,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'code': 'VIP15',
            'description': 'خصم VIP 15% للعملاء المميزين',
            'discount_type': 'percentage',
            'discount_value': 15.00,
            'minimum_order_amount': 300.00,
            'max_discount_amount': 150.00,
            'start_date': datetime.now().isoformat(),
            'end_date': (datetime.now() + timedelta(days=90)).isoformat(),
            'usage_limit': None,
            'used_count': 0,
            'is_active': 1,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
    ]
    
    # Insert coupons
    for coupon in coupons:
        # Check if coupon already exists
        cursor.execute("SELECT id FROM products_coupon WHERE code = ?", (coupon['code'],))
        exists = cursor.fetchone()
        
        if not exists:
            cursor.execute("""
                INSERT INTO products_coupon (
                    id, code, description, discount_type, discount_value,
                    minimum_order_amount, max_discount_amount, start_date, end_date,
                    usage_limit, used_count, is_active, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                coupon['id'], coupon['code'], coupon['description'],
                coupon['discount_type'], coupon['discount_value'],
                coupon['minimum_order_amount'], coupon['max_discount_amount'],
                coupon['start_date'], coupon['end_date'],
                coupon['usage_limit'], coupon['used_count'],
                coupon['is_active'], coupon['created_at'], coupon['updated_at']
            ))
            print(f"✅ Created coupon: {coupon['code']} - {coupon['description']}")
        else:
            print(f"⏭️  Skipped (already exists): {coupon['code']}")
    
    conn.commit()
    
    # Count total coupons
    cursor.execute("SELECT COUNT(*) FROM products_coupon")
    count = cursor.fetchone()[0]
    
    print(f"\n✅ Total coupons in database: {count}")
    print("🎉 Sample coupons added successfully!")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    conn.rollback()
finally:
    conn.close()