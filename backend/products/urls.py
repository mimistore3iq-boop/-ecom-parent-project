from django.urls import path
from . import views
from . import views_coupons

urlpatterns = [
    # Products
    path('', views.product_list, name='product_list'),
    path('<int:pk>/', views.product_detail, name='product_detail'),
    path('featured/', views.featured_products, name='featured_products'),
    path('search/', views.search_products, name='search_products'),

    path('upload-image/', views.upload_image_to_voro, name='upload_image'),

    # Categories
    path('categories/', views.category_list, name='category_list'),
    path('categories/<int:category_id>/products/', views.products_by_category, name='products_by_category'),
    
    # Banners
    path('banners/', views.banner_list, name='banner_list'),

    # Coupons
    path('coupons/', views.coupon_list, name='coupon_list'),
    path('coupons/validate/', views.validate_coupon, name='validate_coupon'),
    path('coupons/user/', views_coupons.user_coupons, name='user_coupons'),
    path('coupons/apply/', views_coupons.apply_coupon, name='apply_coupon'),
    path('admin/coupons/', views_coupons.admin_coupons, name='admin_coupons'),
    path('admin/coupons/create/', views_coupons.create_coupon, name='create_coupon'),
    path('admin/coupons/<uuid:pk>/', views_coupons.admin_coupon_detail, name='admin_coupon_detail'),
    path('admin/coupons/<uuid:pk>/stats/', views_coupons.coupon_usage_stats, name='coupon_usage_stats'),
    path('admin/coupons/usages/', views_coupons.all_coupon_usages, name='all_coupon_usages'),

    # Admin Products Management
    path('admin/products/', views.admin_products_list, name='admin_products_list'),
    path('admin/products/<int:pk>/', views.admin_product_detail, name='admin_product_detail'),
]

