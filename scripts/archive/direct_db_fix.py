#!/usr/bin/env python
"""
Direct database fix script that works without Django
"""
import os
import sys
import sqlite3
import subprocess

def fix_database():
    """
    Fix database by creating missing tables directly with SQLite
    """
    print("Fixing database with direct SQLite commands...")

    # Path to database
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend', 'db.sqlite3')

    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return False

    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Create products_coupon_excluded_products table if it doesn't exist
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS products_coupon_excluded_products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            coupon_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            UNIQUE(coupon_id, product_id)
        )
        """)
        print("Created products_coupon_excluded_products table")

        # Create products_coupon_excluded_categories table if it doesn't exist
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS products_coupon_excluded_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            coupon_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            UNIQUE(coupon_id, category_id)
        )
        """)
        print("Created products_coupon_excluded_categories table")

        # Create products_coupon table if it doesn't exist
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS products_coupon (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code VARCHAR(50) NOT NULL UNIQUE,
            description TEXT,
            discount_type VARCHAR(20) NOT NULL,
            discount_value DECIMAL(10, 2) NOT NULL,
            minimum_amount DECIMAL(10, 2) DEFAULT 0,
            is_active BOOLEAN DEFAULT 1,
            usage_limit INTEGER,
            used_count INTEGER DEFAULT 0,
            valid_from DATETIME,
            valid_until DATETIME,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL
        )
        """)
        print("Created products_coupon table")

        # Create products_couponusage table if it doesn't exist
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS products_couponusage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            coupon_id INTEGER NOT NULL,
            order_id INTEGER,
            used_at DATETIME NOT NULL
        )
        """)
        print("Created products_couponusage table")

        # Commit changes
        conn.commit()
        conn.close()

        print("Database fixed successfully!")
        return True

    except Exception as e:
        print(f"Error fixing database: {e}")
        return False

def run_django_migrations():
    """
    Run Django migrations
    """
    try:
        backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
        os.chdir(backend_dir)

        print("Running Django migrations...")
        subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)
        print("Migrations completed successfully!")

        return True
    except Exception as e:
        print(f"Error running migrations: {e}")
        return False

def collect_static_files():
    """
    Collect static files
    """
    try:
        backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
        os.chdir(backend_dir)

        print("Collecting static files...")
        subprocess.run([sys.executable, 'manage.py', 'collectstatic', '--noinput'], check=True)
        print("Static files collected successfully!")

        return True
    except Exception as e:
        print(f"Error collecting static files: {e}")
        return False

if __name__ == '__main__':
    # Fix database
    db_fix_success = fix_database()

    # Run migrations if database fix was successful
    if db_fix_success:
        migrations_success = run_django_migrations()

        # Collect static files if migrations were successful
        if migrations_success:
            collect_static_files()
            print("All tasks completed successfully!")
        else:
            print("Failed to run migrations")
    else:
        print("Failed to fix database")
