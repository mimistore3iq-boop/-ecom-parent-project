
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from decimal import Decimal

from .models_coupons import Coupon, CouponUsage
from .serializers_coupons import CouponSerializer, CouponUsageSerializer, CouponApplySerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_coupons(request):
    """
    الحصول على قائمة الكوبونات المتاحة للمستخدم
    """
    now = timezone.now()
    # الحصول على الكوبونات النشطة والصالحة حاليًا
    coupons = Coupon.objects.filter(
        is_active=True,
        start_date__lte=now,
        end_date__gte=now
    )

    # استبعاد الكوبونات التي استخدمها المستخدم بالفعل
    used_coupons = CouponUsage.objects.filter(user=request.user).values_list('coupon_id', flat=True)
    coupons = coupons.exclude(id__in=used_coupons)

    serializer = CouponSerializer(coupons, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([])  # السماح بالطلبات بدون تسجيل الدخول
def apply_coupon(request):
    """
    تطبيق كوبون خصم على سلة التسوق

    لا يُطبَّق الكوبون على المنتجات المخفضة:
    - حالة 1: لا يوجد منتج مخفّض  -> يُطبَّق الكوبون بشكل طبيعي (السلوك الحالي).
    - حالة 2: جميع المنتجات مخفّضة -> لا يُطبَّق الكوبون وتظهر رسالة حمراء.
    - حالة 3: بعض المنتجات مخفّضة  -> يُطبَّق على غير المخفّضة فقط مع تنبيه.
    """
    serializer = CouponApplySerializer(data=request.data)
    if not serializer.is_valid():
        return Response({
            'valid': False,
            'message': serializer.errors.get('code', ['كود الكوبون غير صحيح'])[0],
            'discount_amount': 0
        }, status=status.HTTP_400_BAD_REQUEST)

    coupon = serializer.validated_data['code']

    # الحصول على عناصر السلة من الطلب
    cart_items = request.data.get('cart_items', [])
    cart_total = Decimal(str(request.data.get('total', request.data.get('cart_total', 0))))

    # تحديد المنتجات المخفّضة (المعتمدة على خاصية is_on_sale في المنتج)
    from .models import Product
    product_ids = [item.get('product') for item in cart_items if item.get('product')]
    on_sale_ids = set()
    if product_ids:
        for product in Product.objects.filter(id__in=product_ids):
            if product.is_on_sale:
                on_sale_ids.add(str(product.id))

    def _is_discounted(item):
        pid = item.get('product')
        return pid is not None and str(pid) in on_sale_ids

    discounted_items = [item for item in cart_items if _is_discounted(item)]
    non_discounted_items = [item for item in cart_items if not _is_discounted(item)]
    has_discounted = len(discounted_items) > 0
    has_non_discounted = len(non_discounted_items) > 0

    # حالة 2: جميع المنتجات مخفّضة -> لا يُطبَّق الكوبون
    if has_discounted and not has_non_discounted:
        return Response({
            'valid': False,
            'message': 'لا يمكن تطبيق الكوبون',
            'warning': 'لا يمكن استخدام الكوبون على المنتجات المخفضة.',
            'discount_amount': 0,
            'code': coupon.code
        }, status=status.HTTP_400_BAD_REQUEST)

    # حساب قيمة الخصم على المنتجات غير المخفّضة فقط
    if cart_items:
        non_discounted_total = sum(
            (Decimal(str(item.get('price', 0))) * int(item.get('quantity', 1))
             for item in non_discounted_items),
            Decimal(0)
        )
    else:
        # سلة بدون تفاصيل عناصر -> استخدم الإجمالي المُرسَل (السلوك الحالي)
        non_discounted_total = cart_total

    discount_amount, message = coupon.calculate_discount(non_discounted_items, non_discounted_total)

    if discount_amount <= 0:
        return Response({
            'valid': False,
            'message': message,
            'warning': None,
            'discount_amount': 0,
            'code': coupon.code
        }, status=status.HTTP_400_BAD_REQUEST)

    # حالة 3: بعض المنتجات مخفّضة وبعضها غير مخفّض
    if has_discounted:
        return Response({
            'valid': True,
            'message': 'تم تطبيق الكوبون بنجاح',
            'warning': 'لا يمكن استخدام الكوبون على المنتجات المخفضة، وتم تطبيقه فقط على المنتجات غير المخفضة.',
            'discount_amount': float(discount_amount),
            'code': coupon.code,
            'coupon_id': str(coupon.id)
        }, status=status.HTTP_200_OK)

    # حالة 1: لا يوجد منتج مخفّض -> السلوك الطبيعي الحالي
    return Response({
        'valid': True,
        'message': message,
        'warning': None,
        'discount_amount': float(discount_amount),
        'code': coupon.code,
        'coupon_id': str(coupon.id)
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_coupons(request):
    """
    الحصول على قائمة جميع الكوبونات (للمديرين)
    """
    coupons = Coupon.objects.all()
    serializer = CouponSerializer(coupons, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_coupon(request):
    """
    إنشاء كوبون جديد (للمديرين)
    """
    serializer = CouponSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_coupon_detail(request, pk):
    """
    عرض، تحديث أو حذف كوبون محدد (للمديرين)
    """
    try:
        coupon = Coupon.objects.get(pk=pk)
    except Coupon.DoesNotExist:
        return Response({'error': 'الكوبون غير موجود'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = CouponSerializer(coupon)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = CouponSerializer(coupon, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        coupon.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def coupon_usage_stats(request, pk):
    """
    الحصول على إحصائيات استخدام كوبون محدد (للمديرين)
    """
    try:
        coupon = Coupon.objects.get(pk=pk)
    except Coupon.DoesNotExist:
        return Response({'error': 'الكوبون غير موجود'}, status=status.HTTP_404_NOT_FOUND)

    usages = CouponUsage.objects.filter(coupon=coupon)
    serializer = CouponUsageSerializer(usages, many=True)

    # حساب إجمالي الخصم
    total_discount = sum(usage.discount_amount for usage in usages)

    return Response({
        'coupon': CouponSerializer(coupon).data,
        'usage_count': usages.count(),
        'total_discount': total_discount,
        'usages': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def all_coupon_usages(request):
    """
    الحصول على قائمة جميع استخدامات الكوبونات (للمديرين)
    """
    usages = CouponUsage.objects.all()
    serializer = CouponUsageSerializer(usages, many=True)
    return Response(serializer.data)
