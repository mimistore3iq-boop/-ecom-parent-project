#!/usr/bin/env python
"""
Create test coupon
"""
import os
import sys
import django
from datetime import datetime, timedelta
from decimal import Decimal

# Add backend directory to path
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
sys.path.insert(0, backend_path)

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

def create_test_coupons():
    """
    Create multiple test coupons
    """
    print("Creating test coupons...")

    try:
        from products.models_coupons import Coupon

        # Check if coupons already exist
        if Coupon.objects.exists():
            print("Coupons already exist in database")
            return True

        # Create multiple test coupons
        coupons_data = [
            {
                'code': 'SAVE10',
                'description': 'خصم 10% على جميع المنتجات',
                'discount_type': 'percentage',
                'discount_value': Decimal('10.00'),
                'minimum_order_amount': Decimal('50.00'),
                'start_date': datetime.now(),
                'end_date': datetime.now() + timedelta(days=30),
                'usage_limit': 100,
                'is_active': True
            },
            {
                'code': 'SAVE20',
                'description': 'خصم 20% على جميع المنتجات',
                'discount_type': 'percentage',
                'discount_value': Decimal('20.00'),
                'minimum_order_amount': Decimal('100.00'),
                'start_date': datetime.now(),
                'end_date': datetime.now() + timedelta(days=30),
                'usage_limit': 50,
                'is_active': True
            },
            {
                'code': 'FLAT5',
                'description': 'خصم ثابت 5 ريال على جميع المنتجات',
                'discount_type': 'fixed',
                'discount_value': Decimal('5.00'),
                'minimum_order_amount': Decimal('20.00'),
                'start_date': datetime.now(),
                'end_date': datetime.now() + timedelta(days=30),
                'usage_limit': 200,
                'is_active': True
            }
        ]

        for coupon_data in coupons_data:
            coupon = Coupon.objects.create(**coupon_data)
            print(f"Created coupon: {coupon.code}")
            print(f"Discount: {coupon.discount_value}{'%' if coupon.discount_type == 'percentage' else ' ريال'}")
            print(f"Valid until: {coupon.end_date}")
            print("---")

        return True

    except Exception as e:
        print(f"Error creating coupons: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    create_test_coupons()
