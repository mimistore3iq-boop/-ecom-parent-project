from django.contrib import admin
from django.contrib.admin import AdminSite
from django.urls import path
from django.shortcuts import render
from django.db.models import Sum, Count
from users.models import User
from products.models import Product, Category, ProductReview, ProductView
from orders.models import Order, OrderItem
from products.views_fixed import add_category_view, category_list_view, category_add_success_view

class VoroAdminSite(AdminSite):
    site_header = "إدارة voro"
    site_title = "voro"
    index_title = "لوحة التحكم الرئيسية"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('products/admin/category/add/', add_category_view, name='admin-category-add'),
            path('products/admin/category/list/', category_list_view, name='admin-category-list'),
            path('products/admin/category/add/success/', category_add_success_view, name='admin-category-add-success'),
        ]
        return custom_urls + urls
    
    def index(self, request, extra_context=None):
        """
        Custom admin index with statistics
        """
        extra_context = extra_context or {}
        
        # Get statistics
        extra_context['users_count'] = User.objects.count()
        extra_context['products_count'] = Product.objects.count()
        extra_context['orders_count'] = Order.objects.count()
        extra_context['categories_count'] = Category.objects.count()
        
        # Calculate total revenue
        extra_context['total_revenue'] = Order.objects.filter(
            status__in=['delivered']
        ).aggregate(
            total=Sum('subtotal')
        )['total'] or Decimal('0')
        
        # Recent activity
        extra_context['recent_orders'] = Order.objects.order_by('-created_at')[:5]
        extra_context['recent_users'] = User.objects.order_by('-date_joined')[:5]
        extra_context['recent_products'] = Product.objects.order_by('-created_at')[:5]
        
        # Low stock products
        extra_context['low_stock_products'] = Product.objects.filter(stock_quantity__lt=10).order_by('stock_quantity')[:5]
        
        # Pending orders
        extra_context['pending_orders'] = Order.objects.filter(status='pending').count()

        # Notifications (recent + unread count)
        try:
            from notifications.models import Notification
            extra_context['recent_notifications'] = Notification.objects.select_related('recipient')[:5]
            extra_context['unread_notifications_count'] = Notification.objects.filter(is_read=False).count()
        except Exception:
            extra_context['recent_notifications'] = []
            extra_context['unread_notifications_count'] = 0
        
        return super().index(request, extra_context)

# Create custom admin site instance
admin_site = VoroAdminSite(name='voro_admin')

# Import and register all admin classes
from users.admin import UserAdmin
from products.admin import CategoryAdmin, ProductAdmin, ProductReviewAdmin, ProductViewAdmin, BannerAdmin, CouponAdmin, CouponUsageAdmin
from orders.admin import OrderAdmin, OrderItemAdmin, NewOrderAdmin, ProcessedOrderAdmin
from orders.models import NewOrder, ProcessedOrder

# Register models with custom admin site
admin_site.register(User, UserAdmin)
admin_site.register(Category, CategoryAdmin)
admin_site.register(Product, ProductAdmin)
# Register all Order models (base Order + proxy models)
admin_site.register(Order, OrderAdmin)
admin_site.register(NewOrder, NewOrderAdmin)
admin_site.register(ProcessedOrder, ProcessedOrderAdmin)

# Register Notification and DeviceToken
try:
    from notifications.models import Notification, DeviceToken
    from notifications.admin import NotificationAdmin, DeviceTokenAdmin
    admin_site.register(Notification, NotificationAdmin)
    admin_site.register(DeviceToken, DeviceTokenAdmin)
except Exception:
    pass

# Register additional models if they exist
try:
    admin_site.register(ProductReview, ProductReviewAdmin)
except:
    pass

try:
    admin_site.register(ProductView, ProductViewAdmin)
except:
    pass

try:
    admin_site.register(OrderItem, OrderItemAdmin)
except:
    pass

# Register Banner model
try:
    from products.models import Banner
    admin_site.register(Banner, BannerAdmin)
except:
    pass

# Register Coupon models
try:
    from products.models_coupons import Coupon, CouponUsage
    admin_site.register(Coupon, CouponAdmin)
    admin_site.register(CouponUsage, CouponUsageAdmin)
except Exception as e:
    print(f"Error registering Coupon models: {e}")
