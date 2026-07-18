import os
import django
import sqlite3

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from django.conf import settings

print("=" * 60)
print("إصلاح جميع الجداول ذات نوع SERIAL")
print("=" * 60)

db_path = settings.DATABASES['default']['NAME']
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Tables to fix
tables_to_fix = [
    'users_customuser',
    'products_category',
    'products_product',
    'orders_order',
    'orders_orderitem',
    'notifications_notification',
    'test_app_testmodel'
]

for table_name in tables_to_fix:
    print(f"\n{'=' * 60}")
    print(f"إصلاح جدول: {table_name}")
    print(f"{'=' * 60}")
    
    try:
        # Check if table exists
        cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}'")
        if not cursor.fetchone():
            print(f"   ⚠️  الجدول {table_name} غير موجود، تخطي...")
            continue
        
        # Get table structure
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        
        # Get table creation SQL
        cursor.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table_name}'")
        original_sql = cursor.fetchone()[0]
        
        # Replace SERIAL with INTEGER PRIMARY KEY AUTOINCREMENT
        new_sql = original_sql.replace('SERIAL PRIMARY KEY', 'INTEGER PRIMARY KEY AUTOINCREMENT')
        new_sql = new_sql.replace('id SERIAL', 'id INTEGER')
        
        print(f"   1️⃣ نسخ البيانات احتياطياً...")
        cursor.execute(f"CREATE TABLE {table_name}_backup AS SELECT * FROM {table_name}")
        
        print(f"   2️⃣ حذف الجدول القديم...")
        cursor.execute(f"DROP TABLE {table_name}")
        
        print(f"   3️⃣ إنشاء الجدول الجديد...")
        cursor.execute(new_sql)
        
        # Get column names (excluding id)
        column_names = [col[1] for col in columns if col[1] != 'id']
        columns_str = ', '.join(column_names)
        
        print(f"   4️⃣ نسخ البيانات...")
        cursor.execute(f"""
            INSERT INTO {table_name} ({columns_str})
            SELECT {columns_str}
            FROM {table_name}_backup
        """)
        
        print(f"   5️⃣ حذف الجدول الاحتياطي...")
        cursor.execute(f"DROP TABLE {table_name}_backup")
        
        # Verify
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"   ✅ تم إصلاح {table_name} ({count} سجل)")
        
    except Exception as e:
        print(f"   ❌ خطأ في إصلاح {table_name}: {e}")
        # Rollback this table
        try:
            cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
            cursor.execute(f"ALTER TABLE {table_name}_backup RENAME TO {table_name}")
        except:
            pass

# Commit all changes
conn.commit()
conn.close()

print("\n" + "=" * 60)
print("✅ تم إصلاح جميع الجداول!")
print("=" * 60)