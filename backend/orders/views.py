from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Order, OrderItem
from .serializers import OrderSerializer, CreateOrderSerializer
from notifications.firebase_service import send_notification_to_topic, subscribe_to_topic
from notifications.views import create_notification
from django.contrib.auth import get_user_model
from utils.whatsapp_service import send_whatsapp_order_notification


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'create_order':
            return CreateOrderSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        """
        Override default create to use CreateOrderSerializer and send notifications.
        This handles POST /api/orders/
        """
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # The serializer's .create() method handles creating the order and its items.
        order = serializer.save()
        
        # Send notification to admins
        self.send_admin_notification(order)
        
        # Re-serialize the created order instance with the default serializer
        response_serializer = OrderSerializer(order, context={'request': request})
        headers = self.get_success_headers(serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny], url_path='create')
    def create_order(self, request, *args, **kwargs):
        """
        Creates an order, its items, and sends a notification to admins.
        """
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # The serializer's .create() method now handles creating the order and its items.
        order = serializer.save()
        
        # Send notification to admins
        self.send_admin_notification(order)
        
        # Re-serialize the created order instance with the default serializer to include all fields
        response_serializer = OrderSerializer(order, context={'request': request})
        headers = self.get_success_headers(serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def send_admin_notification(self, order: Order):
        """Sends a notification to all staff users about a new order."""
        try:
            User = get_user_model()
            admin_users = User.objects.filter(is_staff=True, is_active=True)

            # Prepare notification data
            notification_data = {
                'order_id': str(order.id),
                'customer_name': order.customer_name,
                'total': str(order.total),
                'type': 'new_order'
            }

            # Create notification for each admin user
            for admin in admin_users:
                create_notification(
                    recipient=admin,
                    type='new_order',
                    title=f'طلب جديد #{str(order.id)[:8]}',
                    message=f'طلب جديد من {order.customer_name} بقيمة {order.total} د.ع',
                    data=notification_data
                )

            # Also send notification to admin topic (for backward compatibility)
            send_notification_to_topic(
                topic='admin_orders',
                title='طلب جديد',
                body=f'طلب جديد من {order.customer_name} بقيمة {order.total} د.ع',
                data=notification_data
            )

            # Send WhatsApp Notification to Manager
            send_whatsapp_order_notification(order)
        except Exception as e:
            print(f"Error sending admin notification: {str(e)}")

    @action(detail=False, methods=['post'])
    def register_admin_token(self, request):
        """Register admin device token for notifications"""
        try:
            token = request.data.get('token')
            if not token:
                return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

            # Subscribe the token to admin topic
            subscribe_to_topic([token], 'admin_orders')

            return Response({'success': 'Token registered successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)