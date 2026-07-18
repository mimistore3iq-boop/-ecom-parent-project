#!/usr/bin/env python
"""
Script to create admin user for MIMI STORE
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from users.models import User

def create_admin_user():
    print("Creating admin user for MIMI STORE...")
    
    try:
        # Try to get existing admin user
        admin_user = User.objects.get(phone='admin')
        # Update existing admin user
        admin_user.set_password('admin123')
        admin_user.first_name = 'Admin'
        admin_user.last_name = 'User'
        admin_user.is_admin = True
        admin_user.is_superuser = True
        admin_user.is_active = True
        admin_user.save()
        print("Admin user updated successfully!")
        
    except User.DoesNotExist:
        # Create new admin user using create_superuser
        admin_user = User.objects.create_superuser(
            phone='admin',
            password='admin123',
            first_name='Admin',
            last_name='User'
        )
        print("Admin user created successfully!")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        return False
    
    print("\nLogin credentials:")
    print("   Phone: admin")
    print("   Password: admin123")
    
    print("\nLinks:")
    print("   - Admin panel: http://localhost:8000/admin")
    print("   - Backend API: http://localhost:8000/api")
    
    return True

if __name__ == '__main__':
    create_admin_user()
