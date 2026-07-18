#!/usr/bin/env python
"""
Fix admin login issue
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from django.core.management import call_command
from users.models import User

def fix_admin():
    print("🔧 Fixing admin login issue...")

    # Create all tables
    print("📊 Creating database tables...")
    call_command('migrate', verbosity=0, interactive=False)

    # Delete all existing users
    User.objects.all().delete()
    print("🗑️ All existing users deleted")

    # Create admin user
    admin = User.objects.create_superuser(
        phone='admin',
        password='admin123',
        first_name='Admin',
        last_name='User',
        email='admin@example.com'
    )

    print("✅ Admin user created successfully!")
    print(f"📱 Phone: '{admin.phone}'")
    print(f"🔧 Admin: {admin.is_superuser}")
    print(f"⚡ Active: {admin.is_active}")
    print(f"👨‍💼 Staff: {admin.is_staff}")

    print("
🔑 Login details:")
    print("   📱 Phone: admin")
    print("   🔑 Password: admin123")
    print("
🌐 Admin panel: http://localhost:8000/admin")

if __name__ == '__main__':
    fix_admin()
