from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductListSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product_image = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['product', 'product_name', 'price', 'quantity', 'total_price', 'product_image']
    
    def get_product_image(self, obj):
        """Get the main image URL for the product"""
        try:
            if not obj.product:
                return None
            
            # Try to get main_image_url first
            if hasattr(obj.product, 'main_image_url') and obj.product.main_image_url:
                return obj.product.main_image_url
            
            # Then try main_image file field
            if hasattr(obj.product, 'main_image') and obj.product.main_image:
                try:
                    request = self.context.get('request')
                    if request:
                        return request.build_absolute_uri(obj.product.main_image.url)
                    return obj.product.main_image.url
                except Exception:
                    pass
            
            return None
        except Exception:
            return None

class OrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'customer_name', 'customer_phone', 'customer_email', 
            'customer_address', 'governorate', 'additional_info', 
            'payment_method', 'status', 'subtotal', 'delivery_fee', 
            'coupon_code', 'coupon_discount', 'total', 'created_at', 'updated_at', 'items'
        ]
        # الحالة قابلة للتعديل — التحديث مقصور على المشرفين عبر صلاحيات OrderViewSet
        read_only_fields = ['id', 'created_at', 'updated_at']

    def update(self, instance, validated_data):
        """
        دفاع في العمق: حالة الطلب لا يغيّرها إلا مشرف.
        صلاحيات OrderViewSet تمنع غير المشرفين أصلاً، لكن هذا الحارس يبقى
        صالحاً لو استُخدم السيريلايزر مستقبلاً من مسار بصلاحيات أضعف.
        """
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if 'status' in validated_data and not (user and user.is_authenticated and user.is_staff):
            validated_data.pop('status')
        return super().update(instance, validated_data)

    def get_items(self, obj):
        """Return items with context"""
        items = obj.items.all()
        return OrderItemSerializer(items, many=True, context=self.context).data

class CreateOrderSerializer(serializers.ModelSerializer):
    items = serializers.ListField(write_only=True)
    
    class Meta:
        model = Order
        fields = [
            'customer_name', 'customer_phone', 'customer_email', 
            'customer_address', 'governorate', 'additional_info', 
            'payment_method', 'subtotal', 'delivery_fee', 'coupon_code', 
            'coupon_discount', 'total', 'items'
        ]

    def create(self, validated_data):
        # Extract items from validated data
        items_data = validated_data.pop('items', [])

        # Create the order
        order = Order.objects.create(**validated_data)

        # Create order items and update product stock
        from products.models import Product
        for item_data in items_data:
            product_id = item_data.get('product_id')
            product = Product.objects.get(id=product_id)
            quantity = item_data.get('quantity', 1)
            
            # Create the order item
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=item_data.get('product_name', product.name),
                price=item_data.get('price', product.price),
                quantity=quantity,
                total_price=item_data.get('total_price', product.price * quantity)
            )
            
            # Update product stock (decrease by quantity sold)
            if product.stock_quantity >= quantity:
                product.stock_quantity -= quantity
                product.save()

        return order

