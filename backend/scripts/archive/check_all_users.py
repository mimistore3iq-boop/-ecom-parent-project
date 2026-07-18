#!/usr/bin/env python
"""
Check all user tables
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
from django.contrib.auth import get_user_model

User = get_user_model()

print("=" * 60)
print("فحص جميع جداول المستخدمين")
print("=" * 60)
print()

# Check Django ORM
print("📋 من Django ORM:")
print(f"User Model: {User}")
print(f"User Model Table: {User._meta.db_table}")
print()

users = User.objects.all()
print(f"عدد المستخدمين: {users.count()}")
for user in users:
    print(f"  - {user.username} (ID: {user.pk}, Phone: {getattr(user, 'phone', 'N/A')})")
print()

# Check database directly
db_path = settings.DATABASES['default']['NAME']
print(f"📋 من قاعدة البيانات مباشرة:")
print(f"Database: {db_path}")
print()

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%user%'")
tables = cursor.fetchall()

print(f"الجداول المتعلقة بالمستخدمين:")
for table in tables:
    table_name = table[0]
    print(f"\n  📊 {table_name}:")
    
    # Get table structure
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    
    # Check if has id column
    has_id = any(col[1] == 'id' for col in columns)
    
    if has_id:
        # Get data
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        print(f"     عدد السجلات: {len(rows)}")
        
        if rows:
            # Get column names
            col_names = [col[1] for col in columns]
            print(f"     الأعمدة: {', '.join(col_names[:5])}...")
            
            # Show first few rows
            for i, row in enumerate(rows[:3]):
                print(f"     السجل {i+1}: {row[:5]}...")

conn.close()

print()
print("=" * 60)
print("انتهى الفحص")
print("=" * 60)