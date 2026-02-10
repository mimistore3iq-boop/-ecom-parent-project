from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import Order, OrderItem, NewOrder, ProcessedOrder


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name', 'price', 'total_price', 'product_image_display')
    fields = ('product_image_display', 'product', 'product_name', 'price', 'quantity', 'total_price')
    
    def product_image_display(self, obj):
        """عرض صورة المنتج مع إمكانية التكبير"""
        if obj.product and obj.product.main_image:
            return format_html(
                '<a href="{}" target="_blank" style="cursor: zoom-in; text-decoration: none;" title="انقر لفتح الصورة بحجم كامل">'
                '<img src="{}" width="80" height="80" style="border-radius: 4px; object-fit: cover; cursor: zoom-in; border: 2px solid #e9ecef; transition: all 0.3s;"/>'
                '</a>',
                obj.product.main_image,
                obj.product.main_image
            )
        return '❌ لا توجد صورة'
    product_image_display.short_description = '📸 صورة المنتج (انقر للتكبير)'
    
    def has_add_permission(self, request, obj=None):
        return False


# Base Order Admin Class
class BaseOrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_number_display', 'customer_display', 'status_display',
        'total_display', 'created_at_display'
    )
    list_filter = (
        'status', 'payment_method', 'created_at', 'governorate'
    )
    search_fields = (
        'customer_name', 'customer_phone', 'customer_email'
    )
    readonly_fields = (
        'id', 'created_at', 'updated_at', 'total', 'customer_name_copy', 'customer_phone_copy'
    )
    inlines = [OrderItemInline]
    list_per_page = 25
    
    fieldsets = (
        ('🛒 معلومات الطلب الأساسية', {
            'fields': ('id', 'customer_name_copy', 'customer_phone_copy', 'customer_email', 'created_at', 'updated_at'),
            'classes': ('wide',)
        }),
        ('📊 حالة الطلب والدفع', {
            'fields': ('status', 'payment_method'),
            'classes': ('wide',)
        }),
        ('💰 تفاصيل التسعير', {
            'fields': ('subtotal', 'delivery_fee', 'total'),
            'classes': ('wide',)
        }),
        ('🚚 معلومات الشحن والتوصيل', {
            'fields': (
                'customer_address', 'governorate'
            ),
            'classes': ('wide',)
        }),
        ('📝 الملاحظات والتعليقات', {
            'fields': ('additional_info',),
            'classes': ('wide', 'collapse')
        }),
    )
    
    actions = ['mark_as_confirmed', 'mark_as_preparing', 'mark_as_shipped', 'mark_as_delivered', 'mark_as_cancelled']
    
    def customer_name_copy(self, obj):
        return format_html(
            '<strong>{}</strong> <a href="javascript:void(0)" onclick="navigator.clipboard.writeText(\'{}\'); alert(\'تم نسخ الاسم\')" style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; color: #4c6ef5; text-decoration: none; margin-right: 10px; border: 1px solid #dee2e6;" title="نسخ الاسم">📋 نسخ الاسم</a>',
            obj.customer_name, obj.customer_name
        )
    customer_name_copy.short_description = '👤 اسم العميل'

    def customer_phone_copy(self, obj):
        return format_html(
            '<span style="direction: ltr; display: inline-block;">{}</span> <a href="javascript:void(0)" onclick="navigator.clipboard.writeText(\'{}\'); alert(\'تم نسخ الرقم\')" style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; color: #4c6ef5; text-decoration: none; margin-right: 10px; border: 1px solid #dee2e6;" title="نسخ الرقم">📋 نسخ الرقم</a>',
            obj.customer_phone, obj.customer_phone
        )
    customer_phone_copy.short_description = '📱 رقم الهاتف'

    def order_number_display(self, obj):
        """Display order number with icon"""
        return format_html(
            '<i class="fas fa-receipt" style="color: #6f42c1;"></i> <strong>{}</strong>',
            str(obj.id)[:8]
        )
    order_number_display.short_description = '🛒 رقم الطلب'
    order_number_display.admin_order_field = 'id'
    
    def customer_display(self, obj):
        """Display customer with professional copy buttons - Stable Version"""
        name = obj.customer_name or "بدون اسم"
        phone = obj.customer_phone or "بدون رقم"
        
        return format_html(
            '<div style="min-width: 220px; background: #ffffff; padding: 10px; border-radius: 8px; border: 1px solid #dee2e6; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">'
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #eee;">'
            '<span style="font-weight: 600; color: #1a1a1a; font-size: 14px;">👤 {}</span>'
            '<button type="button" onclick="navigator.clipboard.writeText(\'{}\').then(() => {{ this.innerText = \'✅ تم\'; setTimeout(() => this.innerText = \'نسخ\', 2000) }})" style="padding: 4px 10px; font-size: 11px; background: #4c6ef5; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">نسخ</button>'
            '</div>'
            '<div style="display: flex; justify-content: space-between; align-items: center;">'
            '<span style="direction: ltr; color: #495057; font-size: 13px; font-family: monospace;">📱 {}</span>'
            '<button type="button" onclick="navigator.clipboard.writeText(\'{}\').then(() => {{ this.innerText = \'✅ تم\'; setTimeout(() => this.innerText = \'نسخ\', 2000) }})" style="padding: 4px 10px; font-size: 11px; background: #12b886; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">نسخ</button>'
            '</div>'
            '</div>',
            name, name, phone, phone
        )
    customer_display.short_description = '👤 معلومات العميل'
    customer_display.admin_order_field = 'customer_name'
    
    def total_display(self, obj):
        """Display total amount with currency"""
        return format_html(
            '<span style="font-weight: bold; color: #28a745; font-size: 1.1em;">{} IQD</span>',
            obj.total
        )
    total_display.short_description = '💰 المبلغ الإجمالي'
    total_display.admin_order_field = 'total'
    
    def created_at_display(self, obj):
        """Display creation date with icon"""
        return format_html(
            '<i class="fas fa-calendar-plus" style="color: #17a2b8;"></i> {}',
            obj.created_at.strftime('%Y-%m-%d %H:%M')
        )
    created_at_display.short_description = '📅 تاريخ الطلب'
    created_at_display.admin_order_field = 'created_at'
    
    def status_display(self, obj):
        """Display order status with colored badge"""
        status_config = {
            'pending': {'color': 'warning', 'icon': 'fas fa-clock', 'text': 'في الانتظار'},
            'confirmed': {'color': 'info', 'icon': 'fas fa-check-circle', 'text': 'مؤكد'},
            'preparing': {'color': 'primary', 'icon': 'fas fa-cog', 'text': 'قيد التحضير'},
            'shipped': {'color': 'secondary', 'icon': 'fas fa-shipping-fast', 'text': 'تم الشحن'},
            'delivered': {'color': 'success', 'icon': 'fas fa-check-double', 'text': 'تم التسليم'},
            'cancelled': {'color': 'danger', 'icon': 'fas fa-times-circle', 'text': 'ملغي'},
        }
        
        config = status_config.get(obj.status, {'color': 'light', 'icon': 'fas fa-question', 'text': obj.status})
        return format_html(
            '<span class="badge badge-{}"><i class="{}"></i> {}</span>',
            config['color'], config['icon'], config['text']
        )
    status_display.short_description = '📊 حالة الطلب'
    status_display.admin_order_field = 'status'
    
    def mark_as_confirmed(self, request, queryset):
        updated = queryset.filter(status='pending').update(status='confirmed')
        self.message_user(request, f'تم تأكيد {updated} طلب')
    mark_as_confirmed.short_description = '✅ تأكيد الطلبات المحددة'
    
    def mark_as_preparing(self, request, queryset):
        updated = queryset.filter(status='confirmed').update(status='preparing')
        self.message_user(request, f'تم تحديث {updated} طلب إلى قيد التحضير')
    mark_as_preparing.short_description = '⚙️ تحديد كـ قيد التحضير'
    
    def mark_as_shipped(self, request, queryset):
        updated = queryset.filter(status__in=['confirmed', 'preparing']).update(status='shipped')
        self.message_user(request, f'📦 تم شحن {updated} طلب')
    mark_as_shipped.short_description = '📦 شحن الطلبات المحددة'
    
    def mark_as_delivered(self, request, queryset):
        updated = queryset.filter(status='shipped').update(status='delivered')
        self.message_user(request, f'✅ تم تسليم {updated} طلب')
    mark_as_delivered.short_description = '✅ تسليم الطلبات المحددة'
    
    def mark_as_cancelled(self, request, queryset):
        updated = queryset.filter(status__in=['pending', 'confirmed']).update(status='cancelled')
        self.message_user(request, f'🗑️ تم إلغاء {updated} طلب')
    mark_as_cancelled.short_description = '🗑️ إلغاء الطلبات المحددة'
    
    def get_queryset(self, request):
        """Optimize queryset"""
        qs = super().get_queryset(request)
        return qs.select_related().prefetch_related('items__product')
    
    def has_add_permission(self, request):
        # منع إضافة طلبات يدويًا من لوحة الإدارة
        return False


# Admin for New Orders (Pending only)
class NewOrderAdmin(BaseOrderAdmin):
    """Admin interface for new/pending orders only"""
    
    def get_queryset(self, request):
        """Show only pending orders"""
        qs = super().get_queryset(request)
        return qs.filter(status='pending')
    
    actions = ['mark_as_confirmed', 'mark_as_cancelled']
    
    def mark_as_confirmed(self, request, queryset):
        """Confirm selected orders - they will move to Processed Orders"""
        updated = queryset.filter(status='pending').update(status='confirmed')
        self.message_user(request, f'✅ تم تأكيد {updated} طلب وتم نقلهم إلى قسم الطلبات المعالجة')
    mark_as_confirmed.short_description = '✅ تأكيد الطلبات المحددة'
    
    def mark_as_cancelled(self, request, queryset):
        """Cancel selected orders - they will move to Processed Orders"""
        updated = queryset.filter(status='pending').update(status='cancelled')
        self.message_user(request, f'🗑️ تم إلغاء {updated} طلب وتم نقلهم إلى قسم الطلبات المعالجة')
    mark_as_cancelled.short_description = '🗑️ إلغاء الطلبات المحددة'


# Admin for Processed Orders (All except pending)
class ProcessedOrderAdmin(BaseOrderAdmin):
    """Admin interface for all processed orders (confirmed, shipped, delivered, cancelled)"""
    
    def get_queryset(self, request):
        """Show all orders except pending"""
        qs = super().get_queryset(request)
        return qs.exclude(status='pending')
    
    actions = ['mark_as_preparing', 'mark_as_shipped', 'mark_as_delivered', 'mark_as_cancelled']
    
    def mark_as_preparing(self, request, queryset):
        updated = queryset.filter(status='confirmed').update(status='preparing')
        self.message_user(request, f'⚙️ تم تحديث {updated} طلب إلى قيد التحضير')
    mark_as_preparing.short_description = '⚙️ تحديد كـ قيد التحضير'
    
    def mark_as_shipped(self, request, queryset):
        updated = queryset.filter(status__in=['confirmed', 'preparing']).update(status='shipped')
        self.message_user(request, f'📦 تم شحن {updated} طلب')
    mark_as_shipped.short_description = '📦 شحن الطلبات المحددة'
    
    def mark_as_delivered(self, request, queryset):
        updated = queryset.filter(status='shipped').update(status='delivered')
        self.message_user(request, f'✅ تم تسليم {updated} طلب')
    mark_as_delivered.short_description = '✅ تسليم الطلبات المحددة'
    
    def mark_as_cancelled(self, request, queryset):
        updated = queryset.filter(status__in=['confirmed', 'preparing']).update(status='cancelled')
        self.message_user(request, f'🗑️ تم إلغاء {updated} طلب')
    mark_as_cancelled.short_description = '🗑️ إلغاء الطلبات المحددة'


# Create OrderAdmin class for the base Order model
class OrderAdmin(BaseOrderAdmin):
    """
    Admin for the base Order model - shows all orders
    """
    pass

# Register all models with Django's default admin site
admin.site.register(Order, OrderAdmin)
admin.site.register(NewOrder, NewOrderAdmin)
admin.site.register(ProcessedOrder, ProcessedOrderAdmin)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'product_name', 'price', 'quantity', 'total_price')
    list_filter = ('order__status', 'order__created_at')
    search_fields = ('product_name', 'product__name', 'order__customer_name')
    readonly_fields = ('total_price',)

    fieldsets = (
        (None, {
            'fields': ('order', 'product', 'product_name', 'price', 'quantity', 'total_price')
        }),
    )

    def has_add_permission(self, request):
        # منع إضافة عناصر طلبات يدويًا من لوحة الإدارة
        return False