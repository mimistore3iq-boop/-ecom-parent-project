#!/usr/bin/env python
"""
Fix orders_orderitem table structure to match the model
"""
import os
import sys
import django
import sqlite3

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')

# Setup Django
django.setup()

from django.conf import settings

print("=" * 60)
print("إصلاح بنية جدول orders_orderitem")
print("=" * 60)
print()

db_path = settings.DATABASES['default']['NAME']
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check current structure
    print("1️⃣ فحص البنية الحالية...")
    cursor.execute("PRAGMA table_info(orders_orderitem)")
    columns = cursor.fetchall()
    column_names = [col[1] for col in columns]
    
    print(f"   الأعمدة الحالية: {', '.join(column_names)}")
    
    # Required columns
    required = ['id', 'order_id', 'product_id', 'product_name', 'price', 'quantity', 'total_price']
    missing = [col for col in required if col not in column_names]
    
    if missing:
        print(f"   ⚠️ أعمدة مفقودة: {', '.join(missing)}")
    else:
        print("   ✅ جميع الأعمدة موجودة")
        conn.close()
        print()
        print("=" * 60)
        print("✅ الجدول بنيته صحيحة، لا حاجة للإصلاح")
        print("=" * 60)
        sys.exit(0)
    
    print()

    # Step 2: Backup existing data
    print("2️⃣ نسخ البيانات الموجودة...")
    cursor.execute("SELECT * FROM orders_orderitem")
    old_data = cursor.fetchall()
    print(f"   عدد العناصر: {len(old_data)}")
    print()

    # Step 3: Drop old table
    print("3️⃣ حذف الجدول القديم...")
    cursor.execute("DROP TABLE IF EXISTS orders_orderitem")
    print("   ✅ تم الحذف")
    print()

    # Step 4: Create new table with correct structure
    print("4️⃣ إنشاء الجدول الجديد...")
    cursor.execute("""
        CREATE TABLE orders_orderitem (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            product_id INTEGER NOT NULL,
            product_name VARCHAR(100) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            quantity INTEGER NOT NULL,
            total_price DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders_order(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products_product(id) ON DELETE CASCADE
        )
    """)
    print("   ✅ تم إنشاء الجدول الجديد")
    print()

    # Commit changes
    conn.commit()
    
    # Verify new structure
    print("5️⃣ التحقق من البنية الجديدة...")
    cursor.execute("PRAGMA table_info(orders_orderitem)")
    columns = cursor.fetchall()
    
    print("   الأعمدة الجديدة:")
    for col in columns:
        pk_marker = " ⭐ PRIMARY KEY" if col[5] else ""
        print(f"     - {col[1]} ({col[2]}){pk_marker}")
    
    print()
    print("=" * 60)
    print("✅ تم إصلاح الجدول بنجاح!")
    print("=" * 60)

except Exception as e:
    print(f"❌ خطأ: {e}")
    import traceback
    traceback.print_exc()
    conn.rollback()
    sys.exit(1)

finally:
    conn.close()