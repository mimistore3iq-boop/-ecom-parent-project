#!/usr/bin/env python
"""
Script to create specific missing tables directly
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

from django.db import connection, models
from django.core.management import execute_from_command_line

def create_missing_tables():
    """
    Create specific missing tables directly
    """
    print("Creating missing database tables...")

    try:
        with connection.cursor() as cursor:
            # Create products_coupon_excluded_products table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS products_coupon_excluded_products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                coupon_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                FOREIGN KEY(coupon_id) REFERENCES products_coupon(id) ON DELETE CASCADE,
                FOREIGN KEY(product_id) REFERENCES products_product(id) ON DELETE CASCADE,
                UNIQUE(coupon_id, product_id)
            )
            """)
            print("Created products_coupon_excluded_products table")

            # Create products_coupon_excluded_categories table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS products_coupon_excluded_categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                coupon_id INTEGER NOT NULL,
                category_id INTEGER NOT NULL,
                FOREIGN KEY(coupon_id) REFERENCES products_coupon(id) ON DELETE CASCADE,
                FOREIGN KEY(category_id) REFERENCES products_category(id) ON DELETE CASCADE,
                UNIQUE(coupon_id, category_id)
            )
            """)
            print("Created products_coupon_excluded_categories table")

            # Create other important tables if they don't exist
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS products_couponusage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                coupon_id INTEGER NOT NULL,
                order_id INTEGER,
                used_at DATETIME NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users_user(id) ON DELETE CASCADE,
                FOREIGN KEY(coupon_id) REFERENCES products_coupon(id) ON DELETE CASCADE,
                FOREIGN KEY(order_id) REFERENCES orders_order(id) ON DELETE SET NULL
            )
            """)
            print("Created products_couponusage table")

            print("All missing tables created successfully!")

    except Exception as e:
        print(f"Error creating tables: {e}")
        # Try with regular SQL if migrations fail
        try:
            print("Attempting to fix with regular migrate command...")
            execute_from_command_line(['manage.py', 'migrate', '--fake'])
            print("Applied fake migrations")
        except Exception as e2:
            print(f"Could not apply fake migrations: {e2}")

if __name__ == '__main__':
    create_missing_tables()
