#!/usr/bin/env python
"""
Script to completely rebuild the database from scratch
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
from django.conf import settings

def rebuild_database():
    """
    Rebuild database from scratch
    """
    print("Rebuilding database from scratch...")

    # Backup database (if it exists)
    db_path = os.path.join(backend_dir, 'db.sqlite3')
    if os.path.exists(db_path):
        backup_path = f"{db_path}.backup_{int(time.time())}"
        shutil.copy2(db_path, backup_path)
        print(f"Database backed up to {backup_path}")

        # Remove database
        os.remove(db_path)
        print("Old database removed")

    # Remove all migration files
    print("Removing all migration files...")
    for app_dir in ['users', 'products', 'orders', 'notifications']:
        migrations_dir = os.path.join(backend_dir, app_dir, 'migrations')
        if os.path.exists(migrations_dir):
            for file in os.listdir(migrations_dir):
                if file.endswith('.py') and file != '__init__.py':
                    file_path = os.path.join(migrations_dir, file)
                    os.remove(file_path)
                    print(f"Removed migration file: {file_path}")

    # Create fresh migrations for all apps
    print("Creating fresh migrations for all apps...")
    execute_from_command_line(['manage.py', 'makemigrations', 'users'])
    execute_from_command_line(['manage.py', 'makemigrations', 'products'])
    execute_from_command_line(['manage.py', 'makemigrations', 'orders'])
    execute_from_command_line(['manage.py', 'makemigrations', 'notifications'])
    execute_from_command_line(['manage.py', 'makemigrations'])

    # Apply migrations
    print("Applying migrations...")
    execute_from_command_line(['manage.py', 'migrate'])

    # Create superuser
    try:
        from django.contrib.auth.models import User
        if not User.objects.filter(is_superuser=True).exists():
            print("Creating superuser...")
            execute_from_command_line(['manage.py', 'createsuperuser', '--noinput', '--username', 'admin', '--email', 'admin@example.com'])
            print("Superuser created with username: admin")
    except Exception as e:
        print(f"Could not create superuser: {e}")

    # Collect static files
    print("Collecting static files...")
    execute_from_command_line(['manage.py', 'collectstatic', '--noinput'])

    print("Database rebuilt successfully!")

if __name__ == '__main__':
    import time
    rebuild_database()
