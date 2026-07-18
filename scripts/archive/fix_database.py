#!/usr/bin/env python
"""
Script to fix database issues with missing tables
"""
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')

# Setup Django
django.setup()

from django.core.management import execute_from_command_line

def fix_database():
    """
    Fix database issues by running migrations
    """
    print("Fixing database issues...")

    # Create migrations for all apps
    print("Creating migrations...")
    execute_from_command_line(['manage.py', 'makemigrations'])

    # Apply migrations
    print("Applying migrations...")
    execute_from_command_line(['manage.py', 'migrate'])

    # Collect static files
    print("Collecting static files...")
    execute_from_command_line(['manage.py', 'collectstatic', '--noinput'])

    print("Database issues fixed successfully!")

if __name__ == '__main__':
    fix_database()
