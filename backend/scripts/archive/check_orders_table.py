#!/usr/bin/env python
"""
Check orders_order table structure
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
print("فحص بنية جدول orders_order")
print("=" * 60)
print()

db_path = settings.DATABASES['default']['NAME']
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check table structure
cursor.execute("PRAGMA table_info(orders_order)")
columns = cursor.fetchall()

print("أعمدة جدول orders_order:")
print()
for col in columns:
    pk_marker = " ⭐ PRIMARY KEY" if col[5] else ""
    print(f"  {col[0]}: {col[1]} ({col[2]}){pk_marker}")

print()

# Check if subtotal exists
has_subtotal = any(col[1] == 'subtotal' for col in columns)
print(f"هل يوجد عمود subtotal؟ {'✅ نعم' if has_subtotal else '❌ لا'}")

if not has_subtotal:
    print()
    print("⚠️ العمود subtotal مفقود!")
    print("يجب إضافته إلى الجدول.")

conn.close()

print()
print("=" * 60)
print("انتهى الفحص")
print("=" * 60)