
from django.contrib import admin
from django import forms
from django.utils.html import mark_safe
from .models import Category, Product, ProductReview, ProductView, Banner
from .models_coupons import Coupon, CouponUsage
from .widgets import ImgBBUploadWidget


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'display_order', 'is_active')
    list_filter = ('is_active', 'parent')
    search_fields = ('name', 'description', 'parent__name')
    list_editable = ('display_order', 'is_active')
    prepopulated_fields = {}  # يمكن إضافة حقول يتم ملؤها تلقائيًا إذا لزم الأمر

    fieldsets = (
        (None, {
            'fields': ('name', 'parent', 'description', 'image', 'image_url', 'is_active', 'display_order')
        }),
    )


class ProductAdminForm(forms.ModelForm):
    """Custom form for Product admin with ImgBB upload widgets"""
    class Meta:
        model = Product
        fields = '__all__'
        widgets = {
            'main_image': ImgBBUploadWidget(attrs={'placeholder': 'رابط الصورة الرئيسية من voro'}),
            'image_2': ImgBBUploadWidget(attrs={'placeholder': 'رابط الصورة الثانية من voro'}),
            'image_3': ImgBBUploadWidget(attrs={'placeholder': 'رابط الصورة الثالثة من voro'}),
            'image_4': ImgBBUploadWidget(attrs={'placeholder': 'رابط الصورة الرابعة من voro'}),
            'image_5': ImgBBUploadWidget(attrs={'placeholder': 'رابط الصورة الخامسة من voro'}),
            'image_6': ImgBBUploadWidget(attrs={'placeholder': 'رابط الصورة السادسة من voro'}),
            'image_7': ImgBBUploadWidget(attrs={'placeholder': 'رابط الصورة السابعة من voro'}),
            'image_8': ImgBBUploadWidget(attrs={'placeholder': 'رابط الصورة الثامنة من voro'}),
        }


class ProductAdmin(admin.ModelAdmin):
    form = ProductAdminForm
    change_form_template = 'admin/products/product/change_form.html'
    change_list_template = 'admin/products/product/change_list.html'
    list_display = (
        'product_image',
        'name',
        'category',
        'price',
        'discount_amount',
        'price_after_discount',
        'stock_quantity',
        'display_order',
        'is_active',
    )
    list_display_links = ('product_image', 'name')
    list_editable = (
        'category',
        'price',
        'discount_amount',
        'stock_quantity',
        'display_order',
        'is_active',
    )
    list_filter = ('category', 'is_active', 'is_featured', 'created_at')
    search_fields = ('name', 'description', 'brand', 'model')
    list_per_page = 25
    ordering = ('display_order', '-created_at')
    save_on_top = True
    filter_horizontal = ('similar_products',)

    def formfield_for_manytomym(self, db_field, request, **kwargs):
        if db_field.name == 'similar_products':
            qs = Product.objects.filter(is_active=True).order_by('name')
            object_id = request.resolver_match.kwargs.get('object_id')
            if object_id:
                qs = qs.exclude(pk=object_id)
            kwargs['queryset'] = qs
        return super().formfield_for_manytomym(db_field, request, **kwargs)

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        field = super().formfield_for_dbfield(db_field, request, **kwargs)
        labels = {
            'category': 'القسم',
            'price': 'السعر الأصلي (د.ع)',
            'discount_amount': 'الخصم (د.ع)',
            'stock_quantity': 'الكمية المتوفرة',
            'display_order': 'ترتيب الظهور',
            'is_active': 'نشط',
        }
        if db_field.name in labels:
            field.label = labels[db_field.name]
        if db_field.name in ('price', 'discount_amount'):
            field.widget.attrs.setdefault('step', '1')
            field.widget.attrs.setdefault('min', '0')
        return field

    def price_after_discount(self, obj):
        final = obj.discounted_price
        if obj.price and final < obj.price:
            amount = int(final)
            formatted = f'{amount:,}'.replace(',', '.')
            return mark_safe(
                f'<span class="voro-price-final">{formatted} الف دينار عراقي</span>'
            )
        return mark_safe('<span class="voro-price-empty">—</span>')

    price_after_discount.short_description = 'السعر بعد الخصم'
    
    def product_image(self, obj):
        """عرض صورة صغيرة من المنتج"""
        if obj.main_image:
            return mark_safe(
                f'<img src="{obj.main_image}" width="48" height="48" '
                f'style="border-radius:12px;object-fit:cover;border:1px solid rgba(0,0,0,.08);" />'
            )
        return mark_safe('<span class="voro-price-empty">—</span>')
    product_image.short_description = '🖼️ الصورة'

    fieldsets = (
        ('📦 معلومات أساسية', {
            'fields': ('name', 'description', 'category', 'brand', 'model')
        }),
        ('💰 التسعير والخصومات', {
            'fields': ('price', 'discount_price', 'discount_amount', 'discount_start', 'discount_end')
        }),
        ('📊 إدارة المخزون', {
            'fields': ('stock_quantity', 'low_stock_threshold')
        }),
        ('🖼️ معرض الصور', {
            'fields': ('main_image', 'image_2', 'image_3', 'image_4', 'image_5', 'image_6', 'image_7', 'image_8')
        }),
        ('🏷️ تفاصيل المنتج', {
            'fields': ('color', 'size', 'weight')
        }),
        ('🔍 SEO والبيانات الوصفية', {
            'fields': ('slug', 'meta_description', 'tags')
        }),
        ('⚡ الحالة والمميزات', {
            'fields': ('is_active', 'is_featured', 'show_on_homepage', 'display_order')
        }),
        ('🔗 منتجات مشابهة', {
            'fields': ('similar_products',),
            'description': 'اختر المنتجات التي تظهر في أسفل صفحة هذا المنتج للزبون.',
        }),
    )

class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('product__name', 'user__username', 'comment')
    readonly_fields = ('created_at',)


class ProductViewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'ip_address', 'viewed_at')
    list_filter = ('viewed_at',)
    search_fields = ('product__name', 'user__username', 'ip_address')
    readonly_fields = ('viewed_at',)


class BannerAdminForm(forms.ModelForm):
    """Custom form for Banner admin with ImgBB upload widget"""
    class Meta:
        model = Banner
        fields = '__all__'
        widgets = {
            'image_url': ImgBBUploadWidget(attrs={'placeholder': 'رفع صورة الإعلان عبر voro'}),
        }


class BannerAdmin(admin.ModelAdmin):
    form = BannerAdminForm
    list_display = ('title', 'product', 'is_active', 'display_order', 'created_at')
    list_filter = ('is_active', 'created_at', 'product')
    search_fields = ('title', 'description', 'product__name')
    list_editable = ('is_active', 'display_order')
    autocomplete_fields = ['product']  # Enable autocomplete for product selection
    
    fieldsets = (
        ('معلومات الإعلان', {
            'fields': ('title', 'description')
        }),
        ('الصور والروابط', {
            'fields': ('image_url',),
            'description': '⚠️ استخدم الزر "رفع عبر voro" لرفع صورة الإعلان. لا تستخدم الحقل الآخر (image).'
        }),
        ('ربط المنتج', {
            'fields': ('product', 'link_url'),
            'description': 'اختر المنتج المرتبط بالإعلان. سيتم توجيه المستخدم لصفحة المنتج عند الضغط على الإعلان.'
        }),
        ('إعدادات العرض', {
            'fields': ('is_active', 'display_order')
        }),
    )


# تسجيل نماذج الكوبونات
# Note: Registration is done in ecom_project/admin.py for custom admin site
class CouponAdmin(admin.ModelAdmin):
    """إعدادات عرض الكوبونات في لوحة الإدارة"""
    list_display = [
        'code', 
        'discount_type', 
        'discount_value', 
        'minimum_order_amount',
        'usage_limit',
        'used_count',
        'is_active',
        'start_date',
        'end_date'
    ]
    list_filter = [
        'discount_type',
        'is_active',
        'start_date',
        'end_date',
        'created_at'
    ]
    search_fields = ['code', 'description']
    readonly_fields = ['id', 'used_count', 'created_at', 'updated_at']
    
    fieldsets = (
        ('معلومات الكوبون', {
            'fields': (
                'code',
                'description',
                'is_active'
            )
        }),
        ('تفاصيل الخصم', {
            'fields': (
                'discount_type',
                'discount_value',
                'max_discount_amount',
                'minimum_order_amount'
            )
        }),
        ('الصلاحية والاستخدام', {
            'fields': (
                'start_date',
                'end_date',
                'usage_limit',
                'used_count'
            )
        }),
        # ('تطبيق الكوبون', {
        #     'fields': (
        #         'applicable_products',
        #         'applicable_categories',
        #         'excluded_products',
        #         'excluded_categories'
        #     )
        # }),
        ('معلومات النظام', {
            'fields': (
                'id',
                'created_at',
                'updated_at'
            ),
            'classes': ('collapse',)
        })
    )
    
    def get_readonly_fields(self, request, obj=None):
        """جعل حقل used_count للقراءة فقط دائمًا"""
        if obj:  # إذا كان الكائن موجودًا بالفعل
            return self.readonly_fields + ['used_count']
        return self.readonly_fields


# Note: Registration is done in ecom_project/admin.py for custom admin site
class CouponUsageAdmin(admin.ModelAdmin):
    """إعدادات عرض استخدامات الكوبونات في لوحة الإدارة"""
    list_display = [
        'coupon_code',
        'user',
        'order',
        'discount_amount',
        'used_at'
    ]
    list_filter = [
        'used_at',
        'coupon__discount_type'
    ]
    search_fields = [
        'coupon__code',
        'user__first_name',
        'user__last_name',
        'user__phone',
        'order__id'
    ]
    readonly_fields = ['id', 'used_at']
    
    def coupon_code(self, obj):
        """عرض كود الكوبون"""
        return obj.coupon.code
    coupon_code.short_description = 'كود الكوبون'
    
    def has_add_permission(self, request):
        """منع إضافة استخدامات كوبونات يدويًا"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """منع تعديل استخدامات الكوبونات"""
        return False


# تسجيل النماذج الأخرى
admin.site.register(Category, CategoryAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(ProductReview, ProductReviewAdmin)
admin.site.register(ProductView, ProductViewAdmin)
admin.site.register(Banner, BannerAdmin)
