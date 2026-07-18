#!/usr/bin/env python
"""
Fix notifications_notification table structure to match the model
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

print("=" * 70)
print("إصلاح بنية جدول notifications_notification")
print("=" * 70)
print()

db_path = settings.DATABASES['default']['NAME']
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check current structure
    print("1️⃣ فحص البنية الحالية...")
    cursor.execute("PRAGMA table_info(notifications_notification)")
    columns = cursor.fetchall()
    column_names = [col[1] for col in columns]
    
    print(f"   الأعمدة الحالية: {', '.join(column_names)}")
    
    # Required columns
    required = ['id', 'recipient_id', 'type', 'title', 'message', 'data', 'is_read', 'created_at', 'order_id']
    missing = [col for col in required if col not in column_names]
    
    if missing:
        print(f"   ⚠️ أعمدة مفقودة: {', '.join(missing)}")
    else:
        print("   ✅ جميع الأعمدة موجودة")
        conn.close()
        print()
        print("=" * 70)
        print("✅ الجدول بنيته صحيحة، لا حاجة للإصلاح")
        print("=" * 70)
        sys.exit(0)
    
    print()

    # Step 2: Backup existing data
    print("2️⃣ نسخ البيانات الموجودة...")
    cursor.execute("SELECT * FROM notifications_notification")
    old_data = cursor.fetchall()
    print(f"   عدد الإشعارات: {len(old_data)}")
    print()

    # Step 3: Drop old table
    print("3️⃣ حذف الجدول القديم...")
    cursor.execute("DROP TABLE IF EXISTS notifications_notification")
    print("   ✅ تم الحذف")
    print()

    # Step 4: Create new table with correct structure
    print("4️⃣ إنشاء الجدول الجديد...")
    cursor.execute("""
        CREATE TABLE notifications_notification (
            id TEXT PRIMARY KEY,
            recipient_id INTEGER,
            type VARCHAR(30),
            title VARCHAR(100) NOT NULL,
            message TEXT NOT NULL,
            data TEXT NOT NULL DEFAULT '{}',
            is_read BOOLEAN NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL,
            order_id TEXT,
            FOREIGN KEY (recipient_id) REFERENCES users_user(id) ON DELETE CASCADE,
            FOREIGN KEY (order_id) REFERENCES orders_order(id) ON DELETE CASCADE
        )
    """)
    print("   ✅ تم إنشاء الجدول الجديد")
    print()

    # Step 5: Create DeviceToken table
    print("5️⃣ إنشاء جدول notifications_devicetoken...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications_devicetoken (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token VARCHAR(255) NOT NULL UNIQUE,
            device_type VARCHAR(10) NOT NULL DEFAULT 'web',
            is_active BOOLEAN NOT NULL DEFAULT 1,
            created_at TIMESTAMP NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users_user(id) ON DELETE CASCADE
        )
    """)
    print("   ✅ تم إنشاء الجدول")
    print()

    # Commit changes
    conn.commit()
    
    # Verify new structure
    print("6️⃣ التحقق من البنية الجديدة...")
    cursor.execute("PRAGMA table_info(notifications_notification)")
    columns = cursor.fetchall()
    
    print("   الأعمدة الجديدة:")
    for col in columns:
        pk_marker = " ⭐ PRIMARY KEY" if col[5] else ""
        print(f"     - {col[1]} ({col[2]}){pk_marker}")
    
    print()
    print("=" * 70)
    print("✅ تم إصلاح الجدول بنجاح!")
    print("=" * 70)

except Exception as e:
    print(f"❌ خطأ: {e}")
    import traceback
    traceback.print_exc()
    conn.rollback()
    sys.exit(1)

finally:
    conn.close()