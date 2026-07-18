#!/usr/bin/env python
"""
Check all tables structure against models
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
print("فحص بنية جميع الجداول")
print("=" * 70)
print()

db_path = settings.DATABASES['default']['NAME']
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'django_%' AND name NOT LIKE 'auth_%'")
tables = [row[0] for row in cursor.fetchall()]

print(f"الجداول المخصصة ({len(tables)}):")
print()

for table_name in sorted(tables):
    print(f"📊 {table_name}:")
    
    # Get table structure
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    
    # Get row count
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    count = cursor.fetchone()[0]
    
    print(f"   عدد الأعمدة: {len(columns)}")
    print(f"   عدد السجلات: {count}")
    print(f"   الأعمدة:")
    
    for col in columns:
        pk_marker = " ⭐ PK" if col[5] else ""
        notnull_marker = " 🔒 NOT NULL" if col[3] else ""
        print(f"     - {col[1]}: {col[2]}{pk_marker}{notnull_marker}")
    
    print()

conn.close()

print("=" * 70)
print("انتهى الفحص")
print("=" * 70)