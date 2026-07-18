
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    id = models.AutoField(primary_key=True)
    email = models.EmailField(blank=True, null=True, verbose_name="البريد الإلكتروني")
    phone = models.CharField(max_length=20, unique=True, verbose_name="رقم الهاتف")
    address = models.TextField(blank=True, null=True, verbose_name="العنوان")
    governorate = models.CharField(max_length=50, blank=True, null=True, verbose_name="المحافظة")
    is_customer = models.BooleanField(default=True, verbose_name="عميل")
    is_staff_member = models.BooleanField(default=False, verbose_name="موظف")

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = "مستخدم"
        verbose_name_plural = "المستخدمون"

    @property
    def is_admin(self):
        """صلاحية الإدارة — مشتقّة من is_staff، ويعتمدها الباكند والواجهة معاً."""
        return self.is_staff

    def __str__(self):
        return self.username
