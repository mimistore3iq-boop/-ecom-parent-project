#!/usr/bin/env python
"""
Comprehensive script to fix all database issues
"""
import os
import sys
import django

# Add the project directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, 'backend')
sys.path.append(backend_dir)

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')

# Setup Django
django.setup()

from django.core.management import execute_from_command_line

def fix_database():
    """
    Fix all database issues by running comprehensive migrations
    """
    print("Fixing all database issues...")

    # Create migrations for all apps
    print("Creating migrations for all apps...")
    execute_from_command_line(['manage.py', 'makemigrations', 'users'])
    execute_from_command_line(['manage.py', 'makemigrations', 'products'])
    execute_from_command_line(['manage.py', 'makemigrations', 'orders'])
    execute_from_command_line(['manage.py', 'makemigrations', 'notifications'])
    execute_from_command_line(['manage.py', 'makemigrations'])

    # Apply migrations
    print("Applying migrations...")
    execute_from_command_line(['manage.py', 'migrate'])

    # Create a superuser if needed
    try:
        from django.contrib.auth.models import User
        if not User.objects.filter(is_superuser=True).exists():
            print("Creating superuser...")
            execute_from_command_line(['manage.py', 'createsuperuser', '--noinput', '--username', 'admin', '--email', 'admin@example.com'])
    except Exception as e:
        print(f"Could not create superuser: {e}")

    # Collect static files
    print("Collecting static files...")
    execute_from_command_line(['manage.py', 'collectstatic', '--noinput'])

    print("All database issues fixed successfully!")

if __name__ == '__main__':
    fix_database()
