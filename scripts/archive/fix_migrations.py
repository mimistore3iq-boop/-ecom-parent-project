#!/usr/bin/env python
"""
Advanced script to fix migration issues
"""
import os
import sys
import django
import shutil
from pathlib import Path

# Add the project directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, 'backend')
sys.path.append(backend_dir)

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')

# Setup Django
django.setup()

from django.core.management import execute_from_command_line
from django.db.migrations.recorder import MigrationRecorder

def fix_migrations():
    """
    Fix migration issues by resetting migrations and rebuilding them
    """
    print("Fixing database migration issues...")

    # Backup database (if it exists)
    db_path = os.path.join(backend_dir, 'db.sqlite3')
    if os.path.exists(db_path):
        backup_path = f"{db_path}.backup"
        shutil.copy2(db_path, backup_path)
        print(f"Database backed up to {backup_path}")

    # Reset migrations by removing migration history from database
    try:
        print("Resetting migration history...")
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM django_migrations")
        print("Migration history reset successfully")
    except Exception as e:
        print(f"Could not reset migration history: {e}")

    # Create fresh migrations for all apps
    print("Creating fresh migrations for all apps...")
    execute_from_command_line(['manage.py', 'makemigrations', 'users'])
    execute_from_command_line(['manage.py', 'makemigrations', 'products'])
    execute_from_command_line(['manage.py', 'makemigrations', 'orders'])
    execute_from_command_line(['manage.py', 'makemigrations', 'notifications'])
    execute_from_command_line(['manage.py', 'makemigrations'])

    # Apply migrations with fake initial to avoid conflicts
    print("Applying migrations...")
    try:
        execute_from_command_line(['manage.py', 'migrate', '--fake-initial'])
    except Exception as e:
        print(f"Error with fake initial, trying regular migrate: {e}")
        execute_from_command_line(['manage.py', 'migrate'])

    # Collect static files
    print("Collecting static files...")
    execute_from_command_line(['manage.py', 'collectstatic', '--noinput'])

    print("Migration issues fixed successfully!")

if __name__ == '__main__':
    fix_migrations()
