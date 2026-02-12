from django.http import JsonResponse
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from products.models import Product, Category
from orders.models import Order
from users.models import User

def home_view(request):
    """
    صفحة ترحيب للـ API
    """
    context = {
        'title': 'voro API',
        'description': 'مرحباً بك في متجر voro الإلكتروني',
        'version': '1.0.0',
        'endpoints': {
            'products': '/api/products/',
            'categories': '/api/products/categories/',
            'featured_products': '/api/products/featured/',
            'cart': '/api/orders/cart/',
            'orders': '/api/orders/',
            'user_profile': '/api/users/profile/',
            'login': '/api/users/login/',
            'register': '/api/users/register/',
            'admin': '/admin/',
        },
        'stats': {
            'total_products': 0,
            'total_categories': 0,
            'total_users': 0,
            'total_orders': 0,
        }
    }
    
    # إذا كان الطلب JSON، أرجع JSON response
    if request.content_type == 'application/json' or 'application/json' in request.META.get('HTTP_ACCEPT', ''):
        return JsonResponse(context)
    
    # وإلا أرجع HTML template
    return render(request, 'home.html', context)

@api_view(['GET'])
@permission_classes([AllowAny])
def api_info(request):
    """
    معلومات API
    """
    return Response({
        'message': 'مرحباً بك في voro API',
        'version': '1.0.0',
        'status': 'active',
        'endpoints': {
            'authentication': {
                'login': '/api/users/login/',
                'register': '/api/users/register/',
                'token_obtain': '/api/token/',
                'token_refresh': '/api/token/refresh/',
            },
            'products': {
                'list': '/api/products/',
                'detail': '/api/products/{id}/',
                'categories': '/api/products/categories/',
                'featured': '/api/products/featured/',
                'search': '/api/products/search/?q={query}',
            },
            'orders': {
                'cart': '/api/orders/cart/',
                'add_to_cart': '/api/orders/cart/add/',
                'orders_list': '/api/orders/',
                'create_order': '/api/orders/create/',
                'order_detail': '/api/orders/{id}/',
            },
            'users': {
                'profile': '/api/users/profile/',
                'update_profile': '/api/users/profile/update/',
            }
        },
        'admin_credentials': {
            'phone': 'admin',
            'password': 'admin123'
        },
        'stats': {
            'total_products': 0,
            'total_categories': 0,
            'total_users': 0,
            'total_orders': 0,
        }
    })