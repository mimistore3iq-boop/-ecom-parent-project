
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class Category(models.Model):
    """Product category model"""
    name = models.CharField('اسم القسم', max_length=100, unique=True)
    description = models.TextField('الوصف', blank=True)
    image = models.ImageField('صورة القسم', upload_to='categories/', blank=True, null=True)
    image_url = models.URLField('رابط صورة القسم (الخارجي)', blank=True, null=True)
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True,
        related_name='children', verbose_name='القسم الأب'
    )
    is_active = models.BooleanField('نشط', default=True)
    created_at = models.DateTimeField('تاريخ الإنشاء', auto_now_add=True)
    updated_at = models.DateTimeField('تاريخ التحديث', auto_now=True)

    class Meta:
        verbose_name = 'قسم'
        verbose_name_plural = 'الأقسام'
        ordering = ['name']

    def __str__(self):
        return self.name

    def get_image_url(self):
        """Get the image URL for the category"""
        if self.image:
            return self.image.url
        return self.image_url or "#"

    @property
    def products_count(self):
        """Get number of active products in this category (direct products only)"""
        return self.products.filter(is_active=True).count()

    @property
    def children_count(self):
        """Get number of active direct subcategories"""
        return self.children.filter(is_active=True).count()
