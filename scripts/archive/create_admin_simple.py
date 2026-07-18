#!/usr/bin/env python
"""
Simple admin user creation
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from users.models import User

def create_admin_simple():
    print("Creating admin user...")
    
    # Delete all users
    User.objects.all().delete()
    print("All users deleted.")
    
    # Create admin user
    admin = User.objects.create_superuser(
        phone='admin',
        password='admin123',
        first_name='Admin',
        last_name='User'
    )
    
    print("Admin user created!")
    print(f"Phone: '{admin.phone}'")
    print(f"Admin: {admin.is_admin}")
    print(f"Active: {admin.is_active}")
    print(f"Superuser: {admin.is_superuser}")
    
    # Test authentication
    from django.contrib.auth import authenticate
    auth_user = authenticate(phone='admin', password='admin123')
    print(f"Authentication: {'Success' if auth_user else 'Failed'}")
    
    print("\nLogin details:")
    print("   Phone: admin")
    print("   Password: admin123")
    print("\nAdmin panel: http://localhost:8000/admin")

if __name__ == '__main__':
    create_admin_simple()