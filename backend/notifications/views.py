from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import Notification, DeviceToken
from .serializers import NotificationSerializer, DeviceTokenSerializer
from .firebase_service import send_notification_to_device

User = get_user_model()

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        is_admin = getattr(user, 'is_admin', False)
        wants_all = self.request.query_params.get('all') == 'true'

        # المشرف يحتاج الوصول لأي إشعار — إشعارات الطلبات مُسجّلة باسم صاحب الطلب،
        # فبدون هذا لا يستطيع تعليمها كمقروءة (كانت ترجع 404).
        # أمّا القائمة فتبقى مقيَّدة بـ all=true حتى لا تختلط إشعارات المستخدم بغيره.
        detail_actions = ('retrieve', 'mark_as_read', 'update', 'partial_update', 'destroy')
        if is_admin and (wants_all or self.action in detail_actions):
            return Notification.objects.all()

        return Notification.objects.filter(recipient=user)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark a notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'notification marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all notifications as read for the current user"""
        notifications = self.get_queryset()
        notifications.update(is_read=True)
        return Response({'status': 'all notifications marked as read'})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        if request.query_params.get('all') == 'true' and request.user.is_admin:
            # Count all unread notifications for admin
            count = Notification.objects.filter(is_read=False).count()
        else:
            # Count unread notifications for the current user
            count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': count})

class DeviceTokenViewSet(viewsets.ModelViewSet):
    serializer_class = DeviceTokenSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return device tokens for the current user
        return DeviceToken.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Save the device token with the current user
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def register(self, request):
        """Register a device token for notifications"""
        token = request.data.get('token')
        device_type = request.data.get('device_type', 'web')

        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if token already exists
        device_token, created = DeviceToken.objects.get_or_create(
            user=request.user,
            token=token,
            defaults={'device_type': device_type}
        )

        if not created:
            # Update existing token
            device_token.device_type = device_type
            device_token.is_active = True
            device_token.save()

        return Response({'status': 'Token registered successfully'})

    @action(detail=False, methods=['post'])
    def unregister(self, request):
        """Unregister a device token"""
        token = request.data.get('token')

        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            device_token = DeviceToken.objects.get(user=request.user, token=token)
            device_token.is_active = False
            device_token.save()
            return Response({'status': 'Token unregistered successfully'})
        except DeviceToken.DoesNotExist:
            return Response({'error': 'Token not found'}, status=status.HTTP_404_NOT_FOUND)

# Notification service functions
def create_notification(recipient, type, title, message, data=None, order=None):
    """Create a new notification"""
    notification = Notification.objects.create(
        recipient=recipient,
        type=type,
        title=title,
        message=message,
        data=data or {},
        order=order
    )

    # Send push notification if user has device tokens
    send_push_notification(notification)

    return notification

def send_push_notification(notification):
    """Send push notification to user's devices"""
    # Get active device tokens for the user
    device_tokens = DeviceToken.objects.filter(
        user=notification.recipient,
        is_active=True
    )

    # Send notification to each device
    for device_token in device_tokens:
        try:
            send_notification_to_device(
                token=device_token.token,
                title=notification.title,
                body=notification.message,
                data={
                    'notification_id': str(notification.id),
                    'type': notification.type,
                    **notification.data
                }
            )
        except Exception as e:
            print(f"Error sending push notification: {str(e)}")
