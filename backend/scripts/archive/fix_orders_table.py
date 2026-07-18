#!/usr/bin/env python
"""
Fix orders_order table structure to match the model
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
print("إصلاح بنية جدول orders_order")
print("=" * 60)
print()

db_path = settings.DATABASES['default']['NAME']
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Step 1: Backup existing data
    print("1️⃣ نسخ البيانات الموجودة...")
    cursor.execute("SELECT * FROM orders_order")
    old_data = cursor.fetchall()
    print(f"   عدد الطلبات: {len(old_data)}")
    print()

    # Step 2: Drop old table
    print("2️⃣ حذف الجدول القديم...")
    cursor.execute("DROP TABLE IF EXISTS orders_order")
    print("   ✅ تم الحذف")
    print()

    # Step 3: Create new table with correct structure
    print("3️⃣ إنشاء الجدول الجديد...")
    cursor.execute("""
        CREATE TABLE orders_order (
            id TEXT PRIMARY KEY,
            customer_name VARCHAR(100) NOT NULL,
            customer_phone VARCHAR(20) NOT NULL,
            customer_email VARCHAR(254),
            customer_address TEXT NOT NULL,
            governorate VARCHAR(50) NOT NULL,
            additional_info TEXT,
            payment_method VARCHAR(20) NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'pending',
            subtotal DECIMAL(10, 2) NOT NULL,
            delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 5.0,
            total DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL
        )
    """)
    print("   ✅ تم إنشاء الجدول الجديد")
    print()

    # Step 4: Restore data (if any)
    if old_data:
        print("4️⃣ استعادة البيانات...")
        print("   ⚠️ البيانات القديمة لها بنية مختلفة، لن يتم استعادتها")
        print("   (يمكنك إنشاء طلبات جديدة من الواجهة)")
    else:
        print("4️⃣ لا توجد بيانات قديمة للاستعادة")
    print()

    # Commit changes
    conn.commit()
    
    # Verify new structure
    print("5️⃣ التحقق من البنية الجديدة...")
    cursor.execute("PRAGMA table_info(orders_order)")
    columns = cursor.fetchall()
    
    print("   الأعمدة الجديدة:")
    for col in columns:
        pk_marker = " ⭐ PRIMARY KEY" if col[5] else ""
        print(f"     - {col[1]} ({col[2]}){pk_marker}")
    
    # Check for required columns
    column_names = [col[1] for col in columns]
    required_columns = ['id', 'customer_name', 'customer_phone', 'customer_address', 
                       'governorate', 'payment_method', 'status', 'subtotal', 
                       'delivery_fee', 'total', 'created_at', 'updated_at']
    
    missing = [col for col in required_columns if col not in column_names]
    
    if missing:
        print(f"   ❌ أعمدة مفقودة: {', '.join(missing)}")
    else:
        print("   ✅ جميع الأعمدة المطلوبة موجودة")
    
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