from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from .models import Product, Category, Banner
from .models_coupons import Coupon, CouponUsage
from .serializers import ProductSerializer, CategorySerializer, BannerSerializer
from .serializers_coupons import CouponSerializer, CouponUsageSerializer
from django.conf import settings
import requests

@api_view(['POST'])
@permission_classes([AllowAny])
def upload_image_to_imgbb(request):
    if 'image' not in request.FILES:
        return Response({'error': 'No image file provided'}, status=400)

    image_file = request.FILES['image']
    api_key = settings.IMGBB_API_KEY

    if not api_key:
        return Response({'error': 'ImgBB API key is not configured'}, status=500)

    try:
        # Use base64 encoding for the image
        import base64
        import io
        
        # Read image file and encode to base64
        image_data = image_file.read()
        encoded_image = base64.b64encode(image_data).decode('utf-8')
        
        # Prepare payload
        payload = {
            'key': api_key,
            'image': encoded_image,
            'name': image_file.name,
            'expiration': 3600  # 1 hour
        }
        
        # Make request
        response = requests.post(
            'https://api.imgbb.com/1/upload',
            data=payload
        )
        
        # Check response
        print(f"ImgBB response status: {response.status_code}")
        print(f"ImgBB response: {response.text}")
        
        response.raise_for_status()
        result = response.json()

        if result.get('data') and result['data'].get('url'):
            return Response({
                'url': result['data']['url'],
                'thumb_url': result['data'].get('thumb', {}).get('url'),
                'delete_url': result['data'].get('delete_url')
            })
        else:
            error_message = result.get('error', {}).get('message', 'Unknown error from ImgBB')
            return Response({'error': error_message}, status=500)

    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e}")
        print(f"Response body: {e.response.text if e.response else 'No response'}")
        return Response({'error': f'HTTP error from ImgBB: {e}'}, status=e.response.status_code if e.response else 500)
    except requests.exceptions.RequestException as e:
        print(f"Request Error: {e}")
        return Response({'error': f'Failed to connect to ImgBB: {e}'}, status=500)
    except Exception as e:
        print(f"Unexpected Error: {e}")
        return Response({'error': f'An unexpected error occurred: {e}'}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def product_list(request):
    """
    قائمة جميع المنتجات مرتبة حسب display_order
    """
    products = Product.objects.all().order_by('display_order', '-created_at')
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def product_detail(request, pk):
    """
    تفاصيل منتج محدد
    """
    try:
        product = Product.objects.get(pk=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'error': 'المنتج غير موجود'}, status=404)

@api_view(['GET'])
@permission_classes([AllowAny])
def category_list(request):
    """
    قائمة الفئات الرئيسية (الأب فقط) مع فئاتها الفرعية مرتبة حسب display_order
    """
    # Return only parent categories (where parent is None), ordered by display_order
    categories = Category.objects.filter(parent__isnull=True).order_by('display_order', 'name')
    print(f"Found {categories.count()} parent categories")
    
    # Log categories for debugging
    for category in categories:
        children_count = category.children.count()
        print(f"Category: {category.name}, ID: {category.id}, Active: {category.is_active}, Display Order: {category.display_order}, Children: {children_count}")
        
    serializer = CategorySerializer(categories, many=True)
    print(f"Returning {len(serializer.data)} categories with their subcategories")
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def products_by_category(request, category_id):
    """
    قائمة المنتجات حسب الفئة
    """
    try:
        category = Category.objects.get(id=category_id)
        products = Product.objects.filter(category=category)
        print(f"Found {products.count()} products in category {category.name}")
        
        # Log products for debugging
        for product in products:
            print(f"Product: {product.name}, ID: {product.id}, Active: {product.is_active}")
            
        serializer = ProductSerializer(products, many=True)
        print(f"Returning {len(serializer.data)} products")
        return Response(serializer.data)
    except Category.DoesNotExist:
        print(f"Category with ID {category_id} not found or not active")
        return Response({'error': 'الفئة غير موجودة أو غير نشطة'}, status=404)

@api_view(['GET'])
@permission_classes([AllowAny])
def featured_products(request):
    """
    قائمة المنتجات المميزة
    """
    products = Product.objects.filter(featured=True)
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def search_products(request):
    """
    البحث عن المنتجات
    """
    query = request.GET.get('q', '')
    products = Product.objects.filter(name__icontains=query)
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def banner_list(request):
    """
    قائمة جميع البانرات
    """
    banners = Banner.objects.filter(is_active=True)
    print(f"Found {banners.count()} active banners")
    for banner in banners:
        print(f"Banner: {banner.title}, Product: {banner.product}, Image URL: {banner.get_image_url()}")
    serializer = BannerSerializer(banners, many=True, context={'request': request})
    print(f"Serialized banners data: {serializer.data}")
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def coupon_list(request):
    """
    قائمة جميع الكوبونات النشطة
    """
    coupons = Coupon.objects.filter(is_active=True)
    serializer = CouponSerializer(coupons, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def validate_coupon(request):
    """
    التحقق من صلاحية الكوبون
    """
    code = request.data.get('code')
    cart_total = request.data.get('cart_total', 0)

    if not code:
        return Response({'error': 'كود الكوبون مطلوب'}, status=400)

    try:
        coupon = Coupon.objects.get(code=code, is_active=True)
        is_valid, message = coupon.is_valid(cart_total)

        if is_valid:
            serializer = CouponSerializer(coupon)
            return Response({
                'valid': True,
                'message': message,
                'coupon': serializer.data
            })
        else:
            return Response({
                'valid': False,
                'message': message
            })

    except Coupon.DoesNotExist:
        return Response({
            'valid': False,
            'message': 'كوبون غير صالح'
        }, status=404)


# ============ ADMIN ENDPOINTS ============

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_products_list(request):
    """
    Admin endpoint for managing products
    GET: List all products with images
    POST: Create a new product
    """
    if request.method == 'GET':
        products = Product.objects.all().order_by('-created_at')
        
        # تسجيل بيانات الصور للتحقق
        print("📦 Getting Admin Products List")
        for idx, product in enumerate(products[:3]):  # أول 3 منتجات فقط
            print(f"📸 Product {idx + 1}: {product.name} (ID: {product.id})")
            print(f"   main_image: {product.main_image}")
            print(f"   image_2: {product.image_2}")
            print(f"   image_3: {product.image_3}")
            print(f"   image_4: {product.image_4}")
        
        serializer = ProductSerializer(products, many=True, context={'request': request})
        print(f"✅ Serialized {len(serializer.data)} products")
        
        # تسجيل البيانات المسلسلة للمنتج الأول
        if serializer.data:
            print(f"📤 First product serialized data: {serializer.data[0]}")
        
        return Response(serializer.data)
    
    elif request.method == 'POST':
        print(f"📤 POST /admin/products/ - البيانات المستقبلة:")
        print(f"   {request.data}")
        
        serializer = ProductSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            product = serializer.save()
            print(f"✅ تم حفظ المنتج بنجاح:")
            print(f"   ID: {product.id}")
            print(f"   Name: {product.name}")
            print(f"   main_image: {product.main_image}")
            print(f"   image_2: {product.image_2}")
            print(f"   image_3: {product.image_3}")
            print(f"   image_4: {product.image_4}")
            return Response(serializer.data, status=201)
        print(f"❌ خطأ في التحقق من البيانات: {serializer.errors}")
        return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_product_detail(request, pk):
    """
    Admin endpoint for managing a specific product
    GET: Get product details
    PUT: Update product
    DELETE: Delete product
    """
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'error': 'المنتج غير موجود'}, status=404)
    
    if request.method == 'GET':
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        print(f"✏️ PUT /admin/products/{pk}/ - البيانات المستقبلة للتحديث:")
        print(f"   {request.data}")
        
        serializer = ProductSerializer(product, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated_product = serializer.save()
            print(f"✅ تم تحديث المنتج بنجاح:")
            print(f"   ID: {updated_product.id}")
            print(f"   Name: {updated_product.name}")
            print(f"   main_image: {updated_product.main_image}")
            print(f"   image_2: {updated_product.image_2}")
            print(f"   image_3: {updated_product.image_3}")
            print(f"   image_4: {updated_product.image_4}")
            return Response(serializer.data)
        print(f"❌ خطأ في التحقق من البيانات: {serializer.errors}")
        return Response(serializer.errors, status=400)
    
    elif request.method == 'DELETE':
        product.delete()
        return Response({'message': 'تم حذف المنتج بنجاح'}, status=204)

