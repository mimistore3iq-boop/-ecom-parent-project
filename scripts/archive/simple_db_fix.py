#!/usr/bin/env python
"""
Simple script to fix database issues without Django REST Framework
"""
import os
import sys
import sqlite3

def fix_database():
    """
    Fix database by creating missing tables directly with SQLite
    """
    print("Fixing database with direct SQLite commands...")

    # Path to database
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend', 'db.sqlite3')

    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

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

    except Exception as e:
        print(f"Error fixing database: {e}")

if __name__ == '__main__':
    fix_database()
