#!/usr/bin/env python
"""
Complete database fix for admin login
"""
import os
import sys
import django
import shutil
import time

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from django.core.management import call_command
from users.models import User

def fix_database():
    print("🔧 إصلاح شامل لقاعدة البيانات...")

    # Backup current database if it exists
    db_path = 'db.sqlite3'
    if os.path.exists(db_path):
        backup_path = f'db.sqlite3.backup_{int(time.time())}'
        shutil.copy2(db_path, backup_path)
        print(f"📦 تم نسخ قاعدة البيانات الحالية إلى {backup_path}")

    # Delete current database
    if os.path.exists(db_path):
        os.remove(db_path)
        print("🗑️ تم حذف قاعدة البيانات الحالية")

    # Delete all migration files except __init__.py
    apps = ['users', 'products', 'orders', 'notifications', 'test_app']
    for app in apps:
        migrations_dir = os.path.join(app, 'migrations')
        if os.path.exists(migrations_dir):
            for file in os.listdir(migrations_dir):
                if file.startswith('0') and file.endswith('.py'):
                    os.remove(os.path.join(migrations_dir, file))
                    print(f"🗑️ تم حذف ملف الترحيل: {file}")

    # Create new migrations
    print("📊 إنشاء ترحيلات جديدة...")
    call_command('makemigrations', verbosity=0, interactive=False)

    # Apply migrations
    print("🔄 تطبيق الترحيلات...")
    call_command('migrate', verbosity=0, interactive=False)

    # Create superuser
    print("👤 إنشاء مستخدم مدير...")
    admin = User.objects.create_superuser(
        phone='admin',
        password='admin123',
        first_name='Admin',
        last_name='User',
        email='admin@example.com'
    )

    print("✅ تم إصلاح قاعدة البيانات بنجاح!")
    print(f"📱 هاتف المدير: {admin.phone}")
    print(f"🔧 مدير: {admin.is_superuser}")
    print(f"⚡ نشط: {admin.is_active}")
    print(f"👨‍💼 موظف: {admin.is_staff}")

    print("\n🔑 بيانات تسجيل الدخول:")
    print("   📱 الهاتف: admin")
    print("   🔑 كلمة المرور: admin123")
    print("\n🌐 لوحة الإدارة: http://localhost:8000/admin")

if __name__ == '__main__':
    fix_database()
