import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from django.contrib import admin
from products.models_coupons import Coupon, CouponUsage

print("Checking admin registration...")
print(f"Coupon registered: {Coupon in admin.site._registry}")
print(f"CouponUsage registered: {CouponUsage in admin.site._registry}")

if Coupon in admin.site._registry:
    print(f"\nCoupon admin class: {admin.site._registry[Coupon]}")
    print(f"List display: {admin.site._registry[Coupon].list_display}")

if CouponUsage in admin.site._registry:
    print(f"\nCouponUsage admin class: {admin.site._registry[CouponUsage]}")
    print(f"List display: {admin.site._registry[CouponUsage].list_display}")

print("\n\nAll registered models:")
for model, model_admin in admin.site._registry.items():
    print(f"  - {model._meta.app_label}.{model._meta.model_name}")