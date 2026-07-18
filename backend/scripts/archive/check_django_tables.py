import sqlite3
import os

# Path to database
db_path = os.path.join(os.path.dirname(__file__), 'db.sqlite3')

print(f"🔍 Checking Django system tables...")
print(f"📁 Database: {db_path}\n")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# List of Django system tables to check
django_tables = [
    'django_migrations',
    'django_content_type',
    'django_session',
    'auth_permission',
    'auth_group',
    'auth_group_permissions',
    'users_user_groups',
    'users_user_user_permissions'
]

for table in django_tables:
    try:
        cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
        exists = cursor.fetchone()
        
        if exists:
            cursor.execute(f"PRAGMA table_info({table})")
            columns = cursor.fetchall()
            print(f"✅ {table}:")
            for col in columns:
                print(f"   - {col[1]} ({col[2]})")
        else:
            print(f"❌ {table}: NOT FOUND")
        print()
    except Exception as e:
        print(f"❌ Error checking {table}: {e}\n")

conn.close()