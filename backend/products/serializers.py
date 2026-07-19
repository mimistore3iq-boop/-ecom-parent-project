from rest_framework import serializers
from .models import Product, Category, Banner
from .models_coupons import Coupon, CouponUsage
from .serializers_coupons import CouponSerializer, CouponUsageSerializer
import logging

logger = logging.getLogger(__name__)

class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    # products_count/children_count خصائص (@property) على النموذج، و fields='__all__'
    # لا يُسلسِل الخصائص — كانت الواجهة تعرض "0 منتج" لكل قسم دائماً. نُصرّح بها هنا.
    products_count = serializers.IntegerField(read_only=True)
    children_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = '__all__'

    def get_children(self, obj):
        """Get subcategories for this category"""
        if obj.children.exists():
            return CategorySerializer(obj.children.all(), many=True).data
        return []

class ProductListSerializer(serializers.ModelSerializer):
    """A simplified serializer for product lists"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    main_image_url = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    discount_percentage = serializers.SerializerMethodField()
    discounted_price = serializers.SerializerMethodField()
    is_on_sale = serializers.SerializerMethodField()
    time_left = serializers.IntegerField(read_only=True)
    stock = serializers.IntegerField(source='stock_quantity', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'discount_price', 'discount_amount', 'discount_start', 'discount_end', 
                  'discount_percentage', 'discounted_price', 'is_on_sale', 'time_left', 'stock_quantity', 'stock', 
                  'category_name', 'main_image', 'image_2', 'image_3', 'image_4', 'image_5', 'image_6', 'image_7', 'image_8',
                  'main_image_url', 'image', 'is_featured', 'show_on_homepage', 'brand', 'is_in_stock']
        read_only_fields = ['id', 'main_image_url', 'image', 'discount_percentage', 'discounted_price', 'is_on_sale', 
                            'time_left', 'category_name', 'stock', 'is_in_stock']

    def get_main_image_url(self, obj):
        """الصورة الرئيسية بوضوح"""
        if obj.main_image:
            return obj.main_image
        return None

    def get_image(self, obj):
        """اختر أول صورة متاحة - هذا ما يستخدمه Frontend"""
        for img_field in [obj.main_image, obj.image_2, obj.image_3, obj.image_4]:
            if img_field:
                return img_field
        return None
    
    def get_discount_percentage(self, obj):
        """Get discount percentage from model property"""
        return obj.discount_percentage
    
    def get_discounted_price(self, obj):
        """Get discounted price from model property"""
        return obj.discounted_price
    
    def get_is_on_sale(self, obj):
        """Get is_on_sale from model property"""
        return obj.is_on_sale

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    
    def get_category_name(self, obj):
        if obj.category:
            return obj.category.name
        return "بدون قسم"
    main_image_url = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    all_images = serializers.SerializerMethodField()
    # إضافة حقول الخصم المحسوبة
    discount_percentage = serializers.SerializerMethodField()
    discounted_price = serializers.SerializerMethodField()
    is_on_sale = serializers.SerializerMethodField()
    time_left = serializers.IntegerField(read_only=True)
    stock = serializers.IntegerField(source='stock_quantity', read_only=True)
    similar_products = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'category', 'category_name',
            'price', 'discount_price', 'discount_amount', 'discount_start', 'discount_end',
            'discount_percentage', 'discounted_price', 'is_on_sale', 'time_left',
            'stock_quantity', 'stock', 'low_stock_threshold',
            'main_image', 'image_2', 'image_3', 'image_4', 'image_5', 'image_6', 'image_7', 'image_8',
            'main_image_url', 'image', 'all_images', 'similar_products',
            'brand', 'model', 'color', 'size', 'weight',
            'slug', 'meta_description', 'tags',
            'is_active', 'is_featured', 'show_on_homepage', 'display_order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'main_image_url', 'image', 'all_images', 'time_left']

    def get_main_image_url(self, obj):
        """إرجاع الصورة الرئيسية"""
        if obj.main_image:
            return obj.main_image
        return None

    def get_image(self, obj):
        """إرجاع أول صورة متاحة - يستخدمها Frontend لعرض الصورة"""
        for img_field in [obj.main_image, obj.image_2, obj.image_3, obj.image_4,
                         obj.image_5, obj.image_6, obj.image_7, obj.image_8]:
            if img_field:
                return img_field
        return None
    
    def get_all_images(self, obj):
        """إرجاع كل الصور كقائمة"""
        images = []
        for img_field in [obj.main_image, obj.image_2, obj.image_3, obj.image_4,
                         obj.image_5, obj.image_6, obj.image_7, obj.image_8]:
            if img_field:
                images.append(img_field)
        return images if images else None
    
    def get_discount_percentage(self, obj):
        """Get discount percentage from model property"""
        return obj.discount_percentage
    
    def get_discounted_price(self, obj):
        """Get discounted price from model property"""
        return obj.discounted_price
    
    def get_is_on_sale(self, obj):
        """Get is_on_sale from model property"""
        return obj.is_on_sale

    def get_similar_products(self, obj):
        """Products chosen by admin for the similar section"""
        qs = obj.similar_products.filter(is_active=True).order_by('display_order', '-created_at')
        return ProductListSerializer(qs, many=True, context=self.context).data
    
    def to_representation(self, instance):
        """تحسين تمثيل البيانات - تأكد من أن الصور موجودة"""
        representation = super().to_representation(instance)
        
        # تسجيل للتحقق من البيانات
        if instance.id <= 3:  # تسجيل أول 3 منتجات فقط
            print(f"🖼️ Serializing Product: {instance.name} (ID: {instance.id})")
            for i in range(1, 9):
                field = 'main_image' if i == 1 else f'image_{i}'
                val = getattr(instance, field)
                if val:
                    print(f"   {field}: {val}")
            print(f"   Final image field: {representation.get('image')}")
        
        return representation
    
    def create(self, validated_data):
        """إنشء منتج جديد مع ضمان حفظ الصور"""
        print(f"📝 Creating new product with data:")
        print(f"   main_image: {validated_data.get('main_image')}")
        print(f"   image_2: {validated_data.get('image_2')}")
        print(f"   image_3: {validated_data.get('image_3')}")
        print(f"   image_4: {validated_data.get('image_4')}")
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """تحديث منتج مع ضمان حفظ الصور"""
        print(f"📝 Updating product {instance.id} with data:")
        print(f"   main_image: {validated_data.get('main_image')}")
        print(f"   image_2: {validated_data.get('image_2')}")
        print(f"   image_3: {validated_data.get('image_3')}")
        print(f"   image_4: {validated_data.get('image_4')}")
        
        return super().update(instance, validated_data)

class BannerSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    image_url = serializers.URLField(allow_blank=True, required=False)  # Prefer external URL
    link = serializers.SerializerMethodField()
    product_id = serializers.SerializerMethodField()

    class Meta:
        model = Banner
        fields = ['id', 'title', 'description', 'image', 'image_url', 'placement', 'product', 'link_url',
                  'is_active', 'display_order', 'link', 'product_id', 'created_at', 'updated_at']

    def get_image(self, obj):
        # Prefer external URL (ImgBB) over local file
        image_url = obj.get_image_url()
        print(f"Banner image URL for {obj.title}: {image_url}")
        if image_url and image_url != "#":
            request = self.context.get('request')
            if request and not image_url.startswith('http'):
                # Build absolute URI with proper domain
                absolute_uri = request.build_absolute_uri(image_url)
                print(f"Absolute URI: {absolute_uri}")
                return absolute_uri
            return image_url
        return None

    def get_link(self, obj):
        # Return the link using the get_link method from the model
        link = obj.get_link()
        print(f"Banner link for {obj.title}: {link}")
        return link

    def get_product_id(self, obj):
        # Return the product ID if exists
        if obj.product:
            print(f"Banner {obj.title} is linked to product ID: {obj.product.id}")
            return obj.product.id
        print(f"Banner {obj.title} is not linked to any product")
        return None