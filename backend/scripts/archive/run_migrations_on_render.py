#!/usr/bin/env python
"""
Script to run migrations on Render PostgreSQL database
Run this script locally to apply migrations to the production database
"""

import os
import django
import sys

# Set the database URL from Render
DATABASE_URL = "postgresql://ecom_postgres_db_za4r_user:elNITLRgmSTvJ2mZG3MG3YcDkqD1q51E@dpg-d3khj849c44c73agblb0-a/ecom_postgres_db_za4r"

# Update settings to use the production database
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
os.environ['DATABASE_URL'] = DATABASE_URL

# Setup Django
django.setup()

from django.core.management import call_command

print("=" * 60)
print("🚀 Running migrations on Render PostgreSQL database")
print("=" * 60)

try:
    # Show current migration status
    print("\n📋 Current migration status:")
    call_command('showmigrations')
    
    # Run migrations
    print("\n🔄 Applying migrations...")
    call_command('migrate', '--noinput')
    
    print("\n✅ Migrations completed successfully!")
    
    # Create superuser if needed
    print("\n👤 Creating superuser...")
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    if not User.objects.filter(phone='01234567890').exists():
        User.objects.create_superuser(
            phone='01234567890',
            password='admin123',
            first_name='Admin',
            last_name='User'
        )
        print("✅ Superuser created: 01234567890 / admin123")
    else:
        print("ℹ️  Superuser already exists")
    
    # Create coupons
    print("\n🎫 Creating coupons...")
    exec(open('create_coupons.py').read())
    
    print("\n" + "=" * 60)
    print("✅ All done! Database is ready.")
    print("=" * 60)
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    sys.exit(1)