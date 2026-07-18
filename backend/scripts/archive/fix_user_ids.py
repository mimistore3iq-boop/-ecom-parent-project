import os
import django
import sqlite3

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from django.conf import settings

print("=" * 60)
print("إصلاح IDs للمستخدمين")
print("=" * 60)

db_path = settings.DATABASES['default']['NAME']
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check current users
print("\n1️⃣ فحص المستخدمين الحاليين...")
cursor.execute("SELECT id, username, phone FROM users_user")
users = cursor.fetchall()

print(f"   وجدت {len(users)} مستخدم(ين):")
for user in users:
    print(f"   - ID: {user[0]}, Username: {user[1]}, Phone: {user[2]}")

# Check table structure
print("\n2️⃣ فحص بنية الجدول...")
cursor.execute("PRAGMA table_info(users_user)")
columns = cursor.fetchall()

id_column = None
for col in columns:
    if col[1] == 'id':
        id_column = col
        break

if id_column:
    print(f"   حقل ID: {id_column[1]} ({id_column[2]})")
    print(f"   Primary Key: {id_column[5]}")
else:
    print("   ❌ لم يتم العثور على حقل ID!")

# Get table creation SQL
print("\n3️⃣ فحص SQL لإنشاء الجدول...")
cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='users_user'")
table_sql = cursor.fetchone()
if table_sql:
    print(f"   {table_sql[0][:200]}...")

# The problem is that the table was created with SERIAL (PostgreSQL type)
# We need to recreate the table with proper SQLite INTEGER PRIMARY KEY AUTOINCREMENT

print("\n4️⃣ إنشاء جدول جديد بالبنية الصحيحة...")

# Backup current data
cursor.execute("""
    CREATE TABLE users_user_backup AS 
    SELECT * FROM users_user
""")
print("   ✅ تم نسخ البيانات احتياطياً")

# Drop old table
cursor.execute("DROP TABLE users_user")
print("   ✅ تم حذف الجدول القديم")

# Create new table with correct structure
cursor.execute("""
    CREATE TABLE users_user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        password VARCHAR(128) NOT NULL,
        last_login TIMESTAMP WITH TIME ZONE,
        is_superuser BOOLEAN NOT NULL,
        username VARCHAR(150) NOT NULL UNIQUE,
        first_name VARCHAR(150) NOT NULL,
        last_name VARCHAR(150) NOT NULL,
        email VARCHAR(254),
        is_staff BOOLEAN NOT NULL,
        is_active BOOLEAN NOT NULL,
        date_joined TIMESTAMP WITH TIME ZONE NOT NULL,
        is_customer BOOLEAN NOT NULL,
        is_staff_member BOOLEAN NOT NULL,
        phone VARCHAR(20) NOT NULL UNIQUE,
        address TEXT
    )
""")
print("   ✅ تم إنشاء الجدول الجديد")

# Copy data back (excluding id to let it auto-generate)
cursor.execute("""
    INSERT INTO users_user (
        password, last_login, is_superuser, username, first_name, last_name,
        email, is_staff, is_active, date_joined, is_customer, is_staff_member,
        phone, address
    )
    SELECT 
        password, last_login, is_superuser, username, first_name, last_name,
        email, is_staff, is_active, date_joined, is_customer, is_staff_member,
        phone, address
    FROM users_user_backup
""")
print("   ✅ تم نسخ البيانات إلى الجدول الجديد")

# Drop backup table
cursor.execute("DROP TABLE users_user_backup")
print("   ✅ تم حذف الجدول الاحتياطي")

# Commit changes
conn.commit()

# Verify
print("\n5️⃣ التحقق من النتيجة...")
cursor.execute("SELECT id, username, phone FROM users_user")
users = cursor.fetchall()

print(f"   وجدت {len(users)} مستخدم(ين):")
for user in users:
    print(f"   - ID: {user[0]}, Username: {user[1]}, Phone: {user[2]}")

conn.close()

print("\n" + "=" * 60)
print("✅ تم إصلاح IDs بنجاح!")
print("=" * 60)