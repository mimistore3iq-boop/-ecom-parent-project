from django.db import models
from django.contrib.auth import get_user_model
from orders.models import Order
import uuid

User = get_user_model()

class Notification(models.Model):
    TYPE_CHOICES = (
        ('new_order', 'طلب جديد'),
        ('order_status_changed', 'تغيير حالة الطلب'),
        ('low_stock', 'نفاد المخزون'),
        ('system', 'نظام'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', verbose_name="المستمل", null=True, blank=True)
    type = models.CharField(max_length=30, choices=TYPE_CHOICES, verbose_name="نوع الإشعار", null=True, blank=True)
    title = models.CharField(max_length=100, verbose_name="العنوان")
    message = models.TextField(verbose_name="الرسالة")
    data = models.JSONField(default=dict, blank=True, verbose_name="البيانات الإضافية")
    is_read = models.BooleanField(default=False, verbose_name="تم القراءة")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")

    # Optional relations
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications', verbose_name="الطلب")

    def __str__(self):
        recipient_name = self.recipient.username if self.recipient else "System"
        return f"{self.title} - {recipient_name}"

    class Meta:
        verbose_name = "إشعار"
        verbose_name_plural = "إشعارات"
        ordering = ['-created_at']

class DeviceToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='device_tokens', verbose_name="المستخدم")
    token = models.CharField(max_length=255, unique=True, verbose_name="رمز الجهاز")
    device_type = models.CharField(max_length=10, choices=[('web', 'ويب'), ('mobile', 'موبايل')], default='web', verbose_name="نوع الجهاز")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")

    def __str__(self):
        return f"{self.user.username} - {self.device_type}"

    class Meta:
        verbose_name = "رمز جهاز"
        verbose_name_plural = "رموز الأجهزة"
