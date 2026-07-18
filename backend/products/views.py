from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, BasePermission
from rest_framework.response import Response
from .models import Product, Category, Banner
from .models_coupons import Coupon, CouponUsage
from .serializers import ProductSerializer, CategorySerializer, BannerSerializer
from .serializers_coupons import CouponSerializer, CouponUsageSerializer
from django.conf import settings
from django.core.files.storage import default_storage
import requests
import logging

from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)


class IsProjectAdmin(BasePermission):
    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return bool(getattr(user, 'is_staff', False) or getattr(user, 'is_staff_member', False) or getattr(user, 'is_superuser', False))

# الصيغ المسموح بها، ولكل صيغة امتدادها المعتمد.
# الامتداد يُشتق من محتوى الملف المتحقَّق منه، لا من اسمه: اسم الملف وContent-Type
# يتحكم بهما العميل، ورفع ملف باسم ‎.html/.svg‎ على نطاق الوسائط يعني XSS مخزَّن.
ALLOWED_IMAGE_FORMATS = {'JPEG': '.jpg', 'PNG': '.png', 'WEBP': '.webp', 'GIF': '.gif'}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 ميغابايت


@csrf_exempt
@api_view(['POST'])
@permission_classes([IsProjectAdmin])
def upload_image_to_voro(request):
    """
    رفع صورة من جهاز المشرف إلى تخزين المشروع (Cloudflare R2 عبر default_storage).
    يُرجع {'url': ...} وهو الرابط الذي يُحفظ في image_url للقسم/البنر/المنتج.
    """
    image_file = request.FILES.get('image')
    if not image_file:
        return Response({'error': 'لم يتم إرسال أي صورة'}, status=400)

    if image_file.size > MAX_UPLOAD_BYTES:
        return Response(
            {'error': f'حجم الصورة يتجاوز الحد المسموح ({MAX_UPLOAD_BYTES // (1024 * 1024)} ميغابايت)'},
            status=400,
        )

    # نتحقق من البايتات نفسها. verify() يُبطل الكائن بعد استدعائه، لذا نفتح مرة ثانية للصيغة.
    try:
        from PIL import Image
        Image.open(image_file).verify()
        image_file.seek(0)
        image_format = Image.open(image_file).format
        image_file.seek(0)
    except Exception:
        return Response({'error': 'الملف ليس صورة صالحة'}, status=400)

    ext = ALLOWED_IMAGE_FORMATS.get(image_format)
    if not ext:
        return Response(
            {'error': 'صيغة غير مدعومة. الصيغ المسموحة: JPG، PNG، WEBP، GIF'},
            status=400,
        )

    try:
        import uuid
        # نمرّر الملف نفسه (لا ContentFile(read())) حتى يُبَثّ بدل تحميله كاملاً في الذاكرة
        path = default_storage.save(f'{uuid.uuid4()}{ext}', image_file)
        url = default_storage.url(path)
        # التخزين المحلي (وضع التطوير) يُرجع مساراً نسبياً مثل /media/x.jpg، وحقول
        # image_url في النماذج من نوع URLField فترفض المسار النسبي. نجعله مطلقاً دائماً.
        if not url.startswith('http'):
            url = request.build_absolute_uri(url)
        return Response({'url': url, 'path': path})
    except Exception:
        # لا نُسرّب نص الاستثناء (قد يحوي تفاصيل التخزين/المفاتيح)
        logger.exception('upload_image_to_voro: storage write failed')
        return Response({'error': 'تعذّر حفظ الصورة. راجع سجلات الخادم.'}, status=500)

from django.core.management import call_command
from django.http import HttpResponse
import io

@api_view(['POST'])
@permission_classes([IsProjectAdmin])
def run_migration_view(request):
    """
    تشغيل أمر تهجير الصور — مقصور على المشرفين وعبر POST فقط.
    URL: /api/products/run-migration-secret-123/
    ملاحظة: يُفضّل تشغيل أوامر الإدارة عبر CLI/CI؛ هذه النقطة أداة صيانة محمية.
    """
    # نستخدم StringIO لالتقاط مخرجات الأمر (stdout)
    out = io.StringIO()
    try:
        # 1. تهجير الصور من ImgBB إلى R2
        call_command('migrate_images_to_r2', stdout=out)

        # 2. إصلاح المسارات بإزالة uploads/
        call_command('fix_image_paths', stdout=out)

        result = out.getvalue()
        return HttpResponse(f"<h1>voro Image Migration & Path Fix Result</h1><pre>{result}</pre>", content_type="text/html")
    except Exception:
        # لا نُسرّب نص الاستثناء الداخلي للعميل
        logger.exception("run_migration_view failed")
        return HttpResponse("<h1>Error during migration</h1><p>حدث خطأ داخلي. راجع سجلات الخادم.</p>", status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def product_list(request):
    """
    قائمة جميع المنتجات مرتبة حسب display_order
    """
    try:
        products = Product.objects.all().order_by('display_order', '-created_at')
        print(f"📡 Product list requested. Found {products.count()} products.")
        serializer = ProductSerializer(products, many=True)
        data = serializer.data
        print(f"✅ Successfully serialized {len(data)} products.")
        return Response(data)
    except Exception as e:
        import traceback
        print(f"❌ Error in product_list: {str(e)}")
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)

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

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def category_list(request):
    """
    GET: قائمة الفئات الرئيسية (الأب فقط) مع فئاتها الفرعية مرتبة حسب display_order
    POST: إنشاء قسم جديد (للمشرف فقط)
    """
    if request.method == 'POST':
        if not (request.user and request.user.is_authenticated and request.user.is_staff):
            return Response({'error': 'غير مصرّح لك بهذا الإجراء'}, status=403)
        serializer = CategorySerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

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

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([AllowAny])
def category_detail(request, pk):
    """
    GET: تفاصيل قسم واحد.
    PUT/PATCH: تحديث القسم (بما فيها صورته) — للمشرف فقط.
    DELETE: حذف القسم — للمشرف فقط.
    """
    try:
        category = Category.objects.get(pk=pk)
    except Category.DoesNotExist:
        return Response({'error': 'القسم غير موجود'}, status=404)

    if request.method == 'GET':
        return Response(CategorySerializer(category, context={'request': request}).data)

    # طرق الكتابة — للمشرف فقط
    if not (request.user and request.user.is_authenticated and request.user.is_staff):
        return Response({'error': 'غير مصرّح لك بهذا الإجراء'}, status=403)

    if request.method in ('PUT', 'PATCH'):
        serializer = CategorySerializer(category, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    # DELETE
    category.delete()
    return Response(status=204)

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
    قائمة البانرات النشطة. تدعم الفلترة حسب مكان الظهور:
    ‏/api/products/banners/?placement=home  أو  ?placement=offers
    (بدون بارامتر تُرجِع بنرات الرئيسية للحفاظ على السلوك السابق.)
    """
    placement = request.query_params.get('placement', Banner.PLACEMENT_HOME)
    banners = Banner.objects.filter(is_active=True, placement=placement)
    serializer = BannerSerializer(banners, many=True, context={'request': request})
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
@permission_classes([IsProjectAdmin])
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
@permission_classes([IsProjectAdmin])
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


@api_view(['GET', 'POST'])
@permission_classes([IsProjectAdmin])
def admin_banners_list(request):
    """
    إدارة البنرات (مشرف فقط).
    GET: كل البنرات (الرئيسية والعروض، نشطة وغير نشطة) مرتّبة حسب المكان ثم الترتيب.
    POST: إنشاء بنر جديد.
    """
    if request.method == 'GET':
        banners = Banner.objects.all().order_by('placement', 'display_order', '-created_at')
        serializer = BannerSerializer(banners, many=True, context={'request': request})
        return Response(serializer.data)

    serializer = BannerSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        banner = serializer.save()
        return Response(BannerSerializer(banner, context={'request': request}).data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsProjectAdmin])
def admin_banner_detail(request, pk):
    """إدارة بنر محدّد (مشرف فقط): عرض / تعديل / حذف."""
    try:
        banner = Banner.objects.get(pk=pk)
    except Banner.DoesNotExist:
        return Response({'error': 'البنر غير موجود'}, status=404)

    if request.method == 'GET':
        serializer = BannerSerializer(banner, context={'request': request})
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = BannerSerializer(banner, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    banner.delete()
    return Response({'message': 'تم حذف البنر بنجاح'}, status=204)

