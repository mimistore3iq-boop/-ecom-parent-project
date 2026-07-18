import os
import django
import sqlite3

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from django.conf import settings

# Connect to database
db_path = settings.DATABASES['default']['NAME']
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("=" * 60)
print("فحص جدول django_session")
print("=" * 60)

# Check if table exists
cursor.execute("""
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='django_session'
""")
table_exists = cursor.fetchone()

if table_exists:
    print("✅ جدول django_session موجود")
    
    # Get table structure
    cursor.execute("PRAGMA table_info(django_session)")
    columns = cursor.fetchall()
    
    print("\n📋 بنية الجدول:")
    for col in columns:
        print(f"  - {col[1]} ({col[2]}) {'PRIMARY KEY' if col[5] else ''}")
    
    # Check for primary key
    has_pk = any(col[5] for col in columns)
    if has_pk:
        print("\n✅ الجدول يحتوي على Primary Key")
    else:
        print("\n❌ الجدول لا يحتوي على Primary Key!")
    
    # Count records
    cursor.execute("SELECT COUNT(*) FROM django_session")
    count = cursor.fetchone()[0]
    print(f"\n📊 عدد السجلات: {count}")
    
else:
    print("❌ جدول django_session غير موجود!")

# Check migrations table
print("\n" + "=" * 60)
print("فحص migrations للـ sessions")
print("=" * 60)

cursor.execute("""
    SELECT id, app, name, applied 
    FROM django_migrations 
    WHERE app = 'sessions'
    ORDER BY id
""")
migrations = cursor.fetchall()

if migrations:
    print(f"\n✅ وجدت {len(migrations)} migration(s):")
    for mig in migrations:
        print(f"  ID: {mig[0]} | App: {mig[1]} | Name: {mig[2]}")
        print(f"  Applied: {mig[3]}")
else:
    print("\n❌ لا توجد migrations للـ sessions!")

conn.close()

print("\n" + "=" * 60)
print("انتهى الفحص")
print("=" * 60)