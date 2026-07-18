#!/usr/bin/env python
"""
Check database tables
"""
import os
import sqlite3

def check_database():
    """
    Check if tables exist in database
    """
    print("Checking database tables...")

    # Path to database
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend', 'db.sqlite3')

    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return False

    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Get list of tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()

        print("Tables in database:")
        for table in tables:
            print(f"- {table[0]}")

        # Check for coupon tables
        coupon_tables = [table[0] for table in tables if 'coupon' in table[0].lower()]
        print(f"
Coupon-related tables: {coupon_tables}")

        # Check if products_coupon table exists
        if 'products_coupon' in coupon_tables:
            print("
Products_coupon table found!")
            cursor.execute("SELECT COUNT(*) FROM products_coupon")
            count = cursor.fetchone()[0]
            print(f"Number of coupons in database: {count}")
        else:
            print("
Products_coupon table not found!")

        conn.close()
        return True

    except Exception as e:
        print(f"Error checking database: {e}")
        return False

if __name__ == '__main__':
    check_database()
