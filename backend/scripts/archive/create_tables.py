#!/usr/bin/env python
"""
Create tables directly using Django ORM
"""
import os
import sys
import django
from django.conf import settings

def create_tables():
    """
    Create tables directly using Django ORM
    """
    print("Creating tables using Django ORM...")

    try:
        # Import models
        from django.contrib.auth.models import User
        from users.models import CustomUser
        from products.models import Category, Product
        from orders.models import Order, OrderItem
        from notifications.models import Notification
        from test_app.models import TestModel

        # Create tables
        from django.core.management import call_command
        call_command('sqlmigrate', 'users', '0001', stdout=open(os.devnull, 'w'))
        call_command('sqlmigrate', 'products', '0001', stdout=open(os.devnull, 'w'))
        call_command('sqlmigrate', 'orders', '0001', stdout=open(os.devnull, 'w'))
        call_command('sqlmigrate', 'notifications', '0001', stdout=open(os.devnull, 'w'))
        call_command('sqlmigrate', 'test_app', '0001', stdout=open(os.devnull, 'w'))

        # Execute SQL
        from django.db import connection
        cursor = connection.cursor()

        # Read migration files
        apps = ['users', 'products', 'orders', 'notifications', 'test_app']
        for app in apps:
            migration_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), app, 'migrations', '0001_initial.py')
            if os.path.exists(migration_path):
                with open(migration_path, 'r') as f:
                    migration_content = f.read()

                # Extract SQL from migration
                lines = migration_content.split('\n')
                sql_lines = []
                in_sql = False

                for line in lines:
                    if 'migrations.RunSQL' in line:
                        in_sql = True
                        continue
                    elif in_sql:
                        if line.strip() == ')' or line.strip() == '],':
                            in_sql = False
                        else:
                            sql_lines.append(line.strip().strip('"').strip("'"))

                # Execute SQL
                for sql in sql_lines:
                    if sql and not sql.startswith('#'):
                        print(f"Executing: {sql[:50]}...")
                        cursor.execute(sql)

        # Commit changes
        connection.commit()

        # Create superuser
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if not User.objects.filter(phone='01234567890').exists():
            User.objects.create_superuser(
                phone='01234567890',
                email='admin@example.com',
                password='admin123',
                first_name='Admin',
                last_name='User'
            )
            print("Superuser created successfully!")

        print("Tables created successfully!")
        return True

    except Exception as e:
        print(f"Error creating tables: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    # Configure Django settings
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')

    try:
        django.setup()
        create_tables()
    except Exception as e:
        print(f"Error setting up Django: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
