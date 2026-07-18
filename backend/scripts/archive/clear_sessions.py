#!/usr/bin/env python
"""
Clear all sessions
"""
import os
import sys
import django

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')

# Setup Django
django.setup()

from django.contrib.sessions.models import Session

print("=" * 60)
print("تنظيف جميع الجلسات")
print("=" * 60)
print()

# Get all sessions
sessions = Session.objects.all()
count = sessions.count()

print(f"عدد الجلسات الحالية: {count}")

if count > 0:
    # Delete all sessions
    sessions.delete()
    print(f"✅ تم حذف {count} جلسة")
else:
    print("✅ لا توجد جلسات للحذف")

print()
print("=" * 60)
print("انتهى التنظيف")
print("=" * 60)