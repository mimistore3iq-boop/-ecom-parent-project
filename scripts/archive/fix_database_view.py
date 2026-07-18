#!/usr/bin/env python
"""
Django view to fix database issues
"""
import os
import sys
import django
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection

# Add the project directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, 'backend')
sys.path.append(backend_dir)

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')

# Setup Django
django.setup()

@csrf_exempt
def fix_database(request):
    """
    Django view to fix database issues
    """
    try:
        with connection.cursor() as cursor:
            # Create products_coupon_excluded_products table if it doesn't exist
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

            # Create products_coupon_excluded_categories table if it doesn't exist
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

            # Create products_coupon table if it doesn't exist
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS products_coupon (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code VARCHAR(50) NOT NULL UNIQUE,
                description TEXT,
                discount_type VARCHAR(20) NOT NULL,
                discount_value DECIMAL(10, 2) NOT NULL,
                minimum_amount DECIMAL(10, 2) DEFAULT 0,
                is_active BOOLEAN DEFAULT True,
                usage_limit INTEGER,
                used_count INTEGER DEFAULT 0,
                valid_from DATETIME,
                valid_until DATETIME,
                created_at DATETIME NOT NULL,
                updated_at DATETIME NOT NULL
            )
            """)

            # Create products_couponusage table if it doesn't exist
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

            return JsonResponse({
                'status': 'success',
                'message': 'Database tables created successfully'
            })

    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': f'Error creating database tables: {str(e)}'
        })
