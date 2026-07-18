import os
import django
import sqlite3

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from django.conf import settings

print("=" * 60)
print("فحص وإصلاح جميع الجداول ذات نوع SERIAL")
print("=" * 60)

db_path = settings.DATABASES['default']['NAME']
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
tables = cursor.fetchall()

print(f"\nوجدت {len(tables)} جدول:")

tables_with_serial = []

for table in tables:
    table_name = table[0]
    
    # Get table structure
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    
    # Check for SERIAL type
    has_serial = False
    for col in columns:
        if 'SERIAL' in col[2].upper():
            has_serial = True
            tables_with_serial.append((table_name, col[1], col[2]))
            print(f"  ⚠️  {table_name}.{col[1]} ({col[2]})")
            break
    
    if not has_serial:
        print(f"  ✅ {table_name}")

if tables_with_serial:
    print(f"\n⚠️  وجدت {len(tables_with_serial)} جدول يحتوي على نوع SERIAL:")
    for table_info in tables_with_serial:
        print(f"  - {table_info[0]}.{table_info[1]} ({table_info[2]})")
    
    print("\n❌ هذه الجداول تحتاج إلى إصلاح!")
    print("⚠️  يجب إعادة إنشاء قاعدة البيانات بالكامل أو إصلاح كل جدول على حدة.")
else:
    print("\n✅ جميع الجداول بنية صحيحة!")

conn.close()

print("\n" + "=" * 60)
print("انتهى الفحص")
print("=" * 60)