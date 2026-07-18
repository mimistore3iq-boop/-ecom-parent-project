#!/usr/bin/env python
"""
Script to run migrations programmatically
This can be used as an alternative to manage.py migrate
"""
import os
import sys
import django

# Add the backend directory to the Python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from django.core.management import call_command

def run_migrations():
    """Run all pending migrations"""
    print("🗄️ Running database migrations...")
    
    try:
        # Make migrations
        print("📝 Making migrations...")
        call_command('makemigrations', interactive=False)
        
        # Apply migrations
        print("✅ Applying migrations...")
        call_command('migrate', interactive=False)
        
        print("✅ Migrations completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error running migrations: {e}")
        return False

if __name__ == '__main__':
    success = run_migrations()
    sys.exit(0 if success else 1)