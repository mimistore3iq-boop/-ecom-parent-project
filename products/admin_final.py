from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db.models import Count, Avg
from .models import Category, Product, ProductReview, ProductView
from .views import admin_views


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name_display', 'image_preview', 'products_count', 'status_display', 'created_at_display', 'actions_column')
    list_filter = ('is_active', 'created_at', 'parent')
    search_fields = ('name', 'description')
    prepopulated_fields = {}
    readonly_fields = ('created_at', 'updated_at', 'products_count_display', 'children_count_display')
    list_per_page = 20

    fieldsets = (
        ('📂 معلومات أساسية', {
            'fields': ('name', 'parent', 'description', 'image'),
            'classes': ('wide',)
        }),
        ('⚡ الحالة', {
            'fields': ('is_active',),
            'classes': ('wide',)
        }),
        ('📊 إحصائيات', {
            'fields': ('products_count_display', 'children_count_display'),
            'classes': ('wide', 'collapse')
        }),
        ('📅 معلومات إضافية', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('wide', 'collapse')
        }),
    )

    def name_display(self, obj):
        """Display category name with icon"""
        return format_html(
            '<i class="fas fa-folder" style="color: #6f42c1;"></i> <strong>{}</strong>',
            obj.name
        )
    name_display.short_description = '📂 اسم القسم'
    name_display.admin_order_field = 'name'

    def image_preview(self, obj):
        """Display category image preview"""
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;" />',
                obj.image
            )
        return format_html('<div style="width: 50px; height: 50px; background: #f8f9fa; border-radius: 8px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-image" style="color: #6c757d;"></i></div>')
    image_preview.short_description = '🖼️ الصورة'

    def products_count(self, obj):
        """Display products count with link (direct products only)"""
        count = obj.products_count
        if count > 0:
            url = reverse('admin:products_product_changelist') + f'?category__id__exact={obj.id}'
            return format_html(
                '<a href="{}" class="badge badge-info"><i class="fas fa-box"></i> {} منتج</a>',
                url, count
            )
        return format_html('<span class="badge badge-light">0 منتج</span>')
    products_count.short_description = '📦 عدد المنتجات'

    def children_count_display(self, obj):
        """Display subcategories count with link"""
        count = obj.children_count
        if count > 0:
            url = reverse('admin:products_category_changelist') + f'?parent__id__exact={obj.id}'
            return format_html(
                '<a href="{}" class="badge badge-secondary"><i class="fas fa-sitemap"></i> {} قسم فرعي</a>',
                url, count
            )
        return format_html('<span class="badge badge-light">0 قسم فرعي</span>')
    children_count_display.short_description = '🗂️ الأقسام الفرعية'

    def status_display(self, obj):
        """Display active status with badge"""
        if obj.is_active:
            return format_html(
                '<span class="badge badge-success"><i class="fas fa-check-circle"></i> نشط</span>'
            )
        return format_html(
            '<span class="badge badge-warning"><i class="fas fa-pause-circle"></i> معطل</span>'
        )
    status_display.short_description = '✅ الحالة'
    status_display.admin_order_field = 'is_active'

    def created_at_display(self, obj):
        """Display creation date with icon"""
        return format_html(
            '<i class="fas fa-calendar-plus" style="color: #17a2b8;"></i> {}',
            obj.created_at.strftime('%Y-%m-%d')
        )
    created_at_display.short_description = '📅 تاريخ الإنشاء'
    created_at_display.admin_order_field = 'created_at'

    def actions_column(self, obj):
        """Display action buttons"""
        actions = []

        # Edit button
        edit_url = reverse('admin:products_category_change', args=[obj.pk])
        actions.append(f'<a href="{edit_url}" class="btn btn-sm btn-primary" title="تعديل"><i class="fas fa-edit"></i></a>')

        # View products button
        products_url = reverse('admin:products_product_changelist') + f'?category__id__exact={obj.id}'
        actions.append(f'<a href="{products_url}" class="btn btn-sm btn-info" title="عرض المنتجات"><i class="fas fa-box"></i></a>')

        # Add subcategory button
        add_sub_url = reverse('admin:products_category_add') + f'?parent={obj.id}'
        actions.append(f'<a href="{add_sub_url}" class="btn btn-sm btn-success" title="إضافة قسم فرعي"><i class="fas fa-plus"></i></a>')

        # View all categories button
        list_url = reverse('admin:products_category_list')
        actions.append(f'<a href="{list_url}" class="btn btn-sm btn-secondary" title="عرض جميع الأقسام"><i class="fas fa-list"></i></a>')

        # Delete button
        delete_url = reverse('admin:products_category_delete', args=[obj.pk])
        actions.append(f'<a href="{delete_url}" class="btn btn-sm btn-danger" title="حذف"><i class="fas fa-trash"></i></a>')

        return format_html(' '.join(actions))
    actions_column.short_description = '⚡ الإجراءات'

    def products_count_display(self, obj):
        """Display detailed products count"""
        count = obj.products_count
        return format_html(
            '<span class="badge badge-primary">{} منتج</span>',
            count
        )
    products_count_display.short_description = 'عدد المنتجات'

    class Media:
        css = {
            'all': ('custom_admin.css',)
        }
        js = ('custom_admin.js', 'product_tabs.js')


class ProductReviewInline(admin.TabularInline):
    model = ProductReview
    extra = 0
    readonly_fields = ('user', 'rating', 'comment', 'created_at')
    can_delete = True

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name_display', 'image_preview', 'category_display', 'price_display',
        'stock_status_display', 'rating_display', 'status_badges', 'actions_column'
    )
    list_filter = (
        'category', 'is_active', 'is_featured', 'created_at',
        'discount_percentage', 'brand', 'stock_quantity'
    )
    search_fields = ('name', 'description', 'brand', 'model', 'tags')
    readonly_fields = (
        'slug', 'created_at', 'updated_at', 'discounted_price',
        'stock_status_display', 'main_image_preview', 'rating_display', 'reviews_count'
    )
    prepopulated_fields = {}
    inlines = [ProductReviewInline]
    list_per_page = 20

    fieldsets = (
        ('📦 معلومات أساسية', {
            'fields': ('name', 'description', 'category', 'slug'),
            'classes': ('wide',)
        }),
        ('💰 التسعير والخصومات', {
            'fields': ('price', 'discount_percentage', 'discounted_price'),
            'classes': ('wide',)
        }),
        ('📊 إدارة المخزون', {
            'fields': ('stock_quantity', 'low_stock_threshold', 'stock_status_display'),
            'classes': ('wide',)
        }),
        ('🖼️ معرض الصور', {
            'fields': ('main_image', 'main_image_preview', 'image_2', 'image_3', 'image_4'),
            'classes': ('wide',)
        }),
        ('🏷️ تفاصيل المنتج', {
            'fields': ('brand', 'model', 'color', 'size', 'weight'),
            'classes': ('wide', 'collapse')
        }),
        ('🔍 SEO والبيانات الوصفية', {
            'fields': ('meta_description', 'tags'),
            'classes': ('wide', 'collapse')
        }),
        ('⚡ الحالة والمميزات', {
            'fields': ('is_active', 'is_featured'),
            'classes': ('wide',)
        }),
        ('📈 الإحصائيات', {
            'fields': ('rating_display', 'reviews_count'),
            'classes': ('wide', 'collapse')
        }),
        ('📅 معلومات إضافية', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('wide', 'collapse')
        }),
    )

    actions = ['make_active', 'make_inactive', 'make_featured', 'remove_featured', 'apply_discount']

    def name_display(self, obj):
        """Display product name with icon"""
        return format_html(
            '<i class="fas fa-box" style="color: #6f42c1;"></i> <strong>{}</strong>',
            obj.name[:50] + '...' if len(obj.name) > 50 else obj.name
        )
    name_display.short_description = '📦 اسم المنتج'
    name_display.admin_order_field = 'name'

    def image_preview(self, obj):
        """Display product image preview"""
        if obj.main_image:
            return format_html(
                '<img src="{}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; border: 2px solid #dee2e6;" />',
                obj.main_image
            )
        return format_html('<div style="width: 60px; height: 60px; background: #f8f9fa; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid #dee2e6;"><i class="fas fa-image" style="color: #6c757d;"></i></div>')
    image_preview.short_description = '🖼️ الصورة'

    def category_display(self, obj):
        """Display category with link"""
        if obj.category:
            url = reverse('admin:products_category_change', args=[obj.category.pk])
            return format_html(
                '<a href="{}" class="badge badge-secondary"><i class="fas fa-folder"></i> {}</a>',
                url, obj.category.name
            )
        return format_html('<span class="badge badge-light">غير محدد</span>')
    category_display.short_description = '📂 القسم'
    category_display.admin_order_field = 'category__name'

    def price_display(self, obj):
        """Display price with discount info"""
        if obj.is_on_sale:
            return format_html(
                '<div><span style="text-decoration: line-through; color: #6c757d;">{} ر.س</span><br><span style="color: #dc3545; font-weight: bold; font-size: 1.1em;">{} ر.س</span><br><span class="badge badge-danger">خصم {}%</span></div>',
                obj.price, obj.discounted_price, obj.discount_percentage
            )
        return format_html('<span style="font-weight: bold; font-size: 1.1em;">{} ر.س</span>', obj.price)
    price_display.short_description = '💰 السعر'
    price_display.admin_order_field = 'price'

    def stock_status_display(self, obj):
        """Display stock status with badge"""
        if obj.stock_quantity <= 0:
            return format_html('<span class="badge badge-danger">نفذ المخزون</span>')
        elif obj.stock_quantity <= obj.low_stock_threshold:
            return format_html('<span class="badge badge-warning">مخزون منخفض</span>')
        return format_html('<span class="badge badge-success">متوفر</span>')
    stock_status_display.short_description = '📦 حالة المخزون'
    stock_status_display.admin_order_field = 'stock_quantity'

    def rating_display(self, obj):
        """Display product rating with stars"""
        if obj.average_rating > 0:
            stars = ''
            for i in range(1, 6):
                if i <= obj.average_rating:
                    stars += '<i class="fas fa-star" style="color: #ffc107;"></i>'
                elif i - 0.5 <= obj.average_rating:
                    stars += '<i class="fas fa-star-half-alt" style="color: #ffc107;"></i>'
                else:
                    stars += '<i class="far fa-star" style="color: #ffc107;"></i>'
            return format_html('<div style="font-size: 0.9em;">{}</div>', stars)
        return format_html('<span class="badge badge-light">لا تقييم</span>')
    rating_display.short_description = '⭐ التقييم'
    rating_display.admin_order_field = 'average_rating'

    def status_badges(self, obj):
        """Display product status badges"""
        badges = []
        if obj.is_active:
            badges.append('<span class="badge badge-success">نشط</span>')
        else:
            badges.append('<span class="badge badge-warning">غير نشط</span>')

        if obj.is_featured:
            badges.append('<span class="badge badge-info">مميز</span>')

        if obj.is_on_sale:
            badges.append('<span class="badge badge-danger">خصم</span>')

        return format_html('&nbsp;'.join(badges))
    status_badges.short_description = '🏷️ الحالة'

    def actions_column(self, obj):
        """Display action buttons"""
        actions = []

        # Edit button
        edit_url = reverse('admin:products_product_change', args=[obj.pk])
        actions.append(f'<a href="{edit_url}" class="btn btn-sm btn-primary" title="تعديل"><i class="fas fa-edit"></i></a>')

        # View reviews button
        if obj.reviews_count > 0:
            reviews_url = reverse('admin:products_product_changelist') + f'?id={obj.id}'
            actions.append(f'<a href="{reviews_url}" class="btn btn-sm btn-info" title="عرض التقييمات"><i class="fas fa-star"></i></a>')

        # Delete button
        delete_url = reverse('admin:products_product_delete', args=[obj.pk])
        actions.append(f'<a href="{delete_url}" class="btn btn-sm btn-danger" title="حذف"><i class="fas fa-trash"></i></a>')

        return format_html('&nbsp;'.join(actions))
    actions_column.short_description = '⚡ الإجراءات'

    def make_active(self, request, queryset):
        """Mark selected products as active"""
        queryset.update(is_active=True)
    make_active.short_description = 'تفعيل المنتجات المحددة'

    def make_inactive(self, request, queryset):
        """Mark selected products as inactive"""
        queryset.update(is_active=False)
    make_inactive.short_description = 'تعطيل المنتجات المحددة'

    def make_featured(self, request, queryset):
        """Mark selected products as featured"""
        queryset.update(is_featured=True)
    make_featured.short_description = 'تسليط الضوء على المنتجات المحددة'

    def remove_featured(self, request, queryset):
        """Remove featured status from selected products"""
        queryset.update(is_featured=False)
    remove_featured.short_description = 'إزالة التميز من المنتجات المحددة'

    def apply_discount(self, request, queryset):
        """Apply discount to selected products"""
        # This would typically open a form to set the discount percentage
        # For now, we'll just apply a 10% discount
        for product in queryset:
            product.discount_percentage = 10
            product.save()
    apply_discount.short_description = 'تطبيق خصم 10% على المنتجات المحددة'

    def main_image_preview(self, obj):
        """Display main image preview"""
        if obj.main_image:
            return format_html(
                '<img src="{}" style="max-width: 200px; max-height: 200px; border-radius: 8px; object-fit: cover;" />',
                obj.main_image
            )
        return format_html('<div style="width: 200px; height: 200px; background: #f8f9fa; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px dashed #dee2e6;"><i class="fas fa-image" style="color: #6c757d;"></i></div>')
    main_image_preview.short_description = 'معاينة الصورة الرئيسية'

    def reviews_count(self, obj):
        """Display reviews count"""
        count = obj.reviews_count
        if count > 0:
            url = reverse('admin:products_product_changelist') + f'?id={obj.id}'
            return format_html(
                '<a href="{}" class="badge badge-info"><i class="fas fa-star"></i> {} تقييم</a>',
                url, count
            )
        return format_html('<span class="badge badge-light">0 تقييم</span>')
    reviews_count.short_description = 'عدد التقييمات'

    class Media:
        css = {
            'all': ('custom_admin.css',)
        }
        js = ('custom_admin.js', 'product_tabs.js')


# @admin.register(ProductReview) - Registered in main admin.py
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ('user_display', 'product_display', 'rating_display', 'comment_display', 'created_at_display')
    list_filter = ('rating', 'created_at', 'product__category')
    search_fields = ('user__name', 'user__phone', 'product__name', 'comment')
    readonly_fields = ('user', 'product', 'rating', 'comment', 'created_at')
    list_per_page = 20

    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('user', 'product', 'rating', 'comment'),
            'classes': ('wide',)
        }),
        ('معلومات إضافية', {
            'fields': ('created_at',),
            'classes': ('wide', 'collapse')
        }),
    )

    def user_display(self, obj):
        """Display user name with link"""
        if obj.user:
            url = reverse('admin:users_user_change', args=[obj.user.pk])
            return format_html(
                '<a href="{}" class="badge badge-secondary">{}</a>',
                url, obj.user.name
            )
        return format_html('<span class="badge badge-light">مستخدم غير مسجل</span>')
    user_display.short_description = 'المستخدم'
    user_display.admin_order_field = 'user__name'

    def product_display(self, obj):
        """Display product name with link"""
        if obj.product:
            url = reverse('admin:products_product_change', args=[obj.product.pk])
            return format_html(
                '<a href="{}" class="badge badge-info">{}</a>',
                url, obj.product.name[:30] + '...' if len(obj.product.name) > 30 else obj.product.name
            )
        return format_html('<span class="badge badge-light">منتج محذوف</span>')
    product_display.short_description = 'المنتج'
    product_display.admin_order_field = 'product__name'

    def rating_display(self, obj):
        """Display rating with stars"""
        stars = ''
        for i in range(1, 6):
            if i <= obj.rating:
                stars += '<i class="fas fa-star" style="color: #ffc107;"></i>'
            else:
                stars += '<i class="far fa-star" style="color: #ffc107;"></i>'
        return format_html('<div>{}</div>', stars)
    rating_display.short_description = 'التقييم'

    def comment_display(self, obj):
        """Display comment with truncate"""
        return format_html(
            '<div style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="{}">{}</div>',
            obj.comment, obj.comment[:50] + '...' if len(obj.comment) > 50 else obj.comment
        )
    comment_display.short_description = 'التعليق'

    def created_at_display(self, obj):
        """Display creation date"""
        return format_html(
            '<i class="fas fa-calendar-plus" style="color: #17a2b8;"></i> {}',
            obj.created_at.strftime('%Y-%m-%d')
        )
    created_at_display.short_description = 'تاريخ التقييم'
    created_at_display.admin_order_field = 'created_at'


# @admin.register(ProductView) - Registered in main admin.py
class ProductViewAdmin(admin.ModelAdmin):
    list_display = ('user_display', 'product_display', 'view_date_display')
    list_filter = ('view_date', 'product__category')
    search_fields = ('user__name', 'user__phone', 'product__name')
    readonly_fields = ('user', 'product', 'view_date')
    list_per_page = 20

    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('user', 'product', 'view_date'),
            'classes': ('wide',)
        }),
    )

    def user_display(self, obj):
        """Display user name with link"""
        if obj.user:
            url = reverse('admin:users_user_change', args=[obj.user.pk])
            return format_html(
                '<a href="{}" class="badge badge-secondary">{}</a>',
                url, obj.user.name
            )
        return format_html('<span class="badge badge-light">مستخدم غير مسجل</span>')
    user_display.short_description = 'المستخدم'
    user_display.admin_order_field = 'user__name'

    def product_display(self, obj):
        """Display product name with link"""
        if obj.product:
            url = reverse('admin:products_product_change', args=[obj.product.pk])
            return format_html(
                '<a href="{}" class="badge badge-info">{}</a>',
                url, obj.product.name[:30] + '...' if len(obj.product.name) > 30 else obj.product.name
            )
        return format_html('<span class="badge badge-light">منتج محذوف</span>')
    product_display.short_description = 'المنتج'
    product_display.admin_order_field = 'product__name'

    def view_date_display(self, obj):
        """Display view date with icon"""
        return format_html(
            '<i class="fas fa-eye" style="color: #17a2b8;"></i> {}',
            obj.view_date.strftime('%Y-%m-%d %H:%M')
        )
    view_date_display.short_description = 'تاريخ المشاهدة'
    view_date_display.admin_order_field = 'view_date'
