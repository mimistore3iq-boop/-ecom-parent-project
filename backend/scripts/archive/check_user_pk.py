import os
import django
import sqlite3

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

print("=" * 60)
print("فحص Primary Key للمستخدم")
print("=" * 60)

# Check User model
print("\n📋 معلومات نموذج User:")
print(f"Model: {User}")
print(f"PK Field Name: {User._meta.pk.name}")
print(f"PK Field Type: {User._meta.pk.__class__.__name__}")
print(f"PK Attname: {User._meta.pk.attname}")

# Get user from database
print("\n📋 معلومات المستخدم من Django ORM:")
user = User.objects.get(username='admin')
print(f"Username: {user.username}")
print(f"user.pk: {user.pk}")
print(f"user.id: {user.id}")
print(f"Has PK: {user.pk is not None}")

# Check database directly
print("\n📋 معلومات المستخدم من قاعدة البيانات مباشرة:")
db_path = settings.DATABASES['default']['NAME']
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get table structure
cursor.execute("PRAGMA table_info(users_user)")
columns = cursor.fetchall()

print("\nبنية جدول users_user:")
for col in columns:
    pk_marker = " ⭐ PRIMARY KEY" if col[5] else ""
    print(f"  {col[0]}: {col[1]} ({col[2]}){pk_marker}")

# Get user data
cursor.execute("SELECT id, username, phone, is_active, is_staff FROM users_user WHERE username='admin'")
user_data = cursor.fetchone()

if user_data:
    print(f"\nبيانات المستخدم admin:")
    print(f"  ID: {user_data[0]}")
    print(f"  Username: {user_data[1]}")
    print(f"  Phone: {user_data[2]}")
    print(f"  Is Active: {user_data[3]}")
    print(f"  Is Staff: {user_data[4]}")
else:
    print("\n❌ لم يتم العثور على المستخدم في قاعدة البيانات!")

conn.close()

# Try to get all fields
print("\n📋 جميع حقول النموذج:")
for field in User._meta.get_fields():
    if hasattr(field, 'primary_key'):
        pk_marker = " ⭐ PRIMARY KEY" if field.primary_key else ""
        print(f"  {field.name}: {field.__class__.__name__}{pk_marker}")