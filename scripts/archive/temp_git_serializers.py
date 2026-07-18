from rest_framework import serializers
from .models import Product, Category, Banner
from .models_coupons import Coupon, CouponUsage
from .serializers_coupons import CouponSerializer, CouponUsageSerializer

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductListSerializer(serializers.ModelSerializer):
    """A simplified serializer for product lists"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    main_image_url = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'discount_percentage', 'category_name', 'main_image_url', 'image', 'is_featured', 'is_in_stock']

    def get_main_image_url(self, obj):
        if obj.main_image:
            return obj.main_image
        return None

    def get_image(self, obj):
        # Return the first available image
        for img_field in [obj.main_image, obj.image_2, obj.image_3, obj.image_4]:
            if img_field:
                return img_field
        return None

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    main_image_url = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'
    
    def get_main_image_url(self, obj):
        if obj.main_image:
            # main_image is already a URL field, not an ImageField
            return obj.main_image
        return None
        
    def get_image(self, obj):
        # Return the first available image
        for img_field in [obj.main_image, obj.image_2, obj.image_3, obj.image_4]:
            if img_field:
                return img_field
        return None

class BannerSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    link = serializers.SerializerMethodField()
    product_id = serializers.SerializerMethodField()
    
    class Meta:
        model = Banner
        fields = '__all__'
        
    def get_image(self, obj):
        # Use the get_image_url method from the model
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

