
from django.db import migrations, models
import logging

logger = logging.getLogger(__name__)

def add_missing_columns(apps, schema_editor):
    db_vendor = schema_editor.connection.vendor
    
    # 1. حقل featured_on_homepage في جدول products_category
    check_and_add_column(
        schema_editor, 
        'products_category', 
        'featured_on_homepage', 
        'boolean DEFAULT FALSE NOT NULL' if db_vendor == 'postgresql' else 'boolean DEFAULT 0 NOT NULL'
    )
    
    # ضمان عدم وجود قيم NULL في العمود الموجود مسبقاً لمنع IntegrityError
    with schema_editor.connection.cursor() as cursor:
        if db_vendor == 'postgresql':
            cursor.execute("UPDATE products_category SET featured_on_homepage = FALSE WHERE featured_on_homepage IS NULL")
        elif db_vendor == 'sqlite':
            cursor.execute("UPDATE products_category SET featured_on_homepage = 0 WHERE featured_on_homepage IS NULL")
    
    # 2. حقول الصور في جدول products_product
    image_fields = ['image_5', 'image_6', 'image_7', 'image_8']
    for field in image_fields:
        check_and_add_column(
            schema_editor, 
            'products_product', 
            field, 
            'varchar(200)' # URLField هو varchar في الداتابيز
        )

def check_and_add_column(schema_editor, table_name, column_name, column_type):
    with schema_editor.connection.cursor() as cursor:
        if schema_editor.connection.vendor == 'postgresql':
            # التحقق من وجود العمود في Postgres بشكل أكثر دقة
            # نستخدم الكيانات الصغيرة كما هي في Postgres عادة
            cursor.execute(
                "SELECT 1 FROM information_schema.columns WHERE table_name = %s AND column_name = %s",
                [table_name, column_name]
            )
            exists = cursor.fetchone()
            if not exists:
                try:
                    cursor.execute(f'ALTER TABLE "{table_name}" ADD COLUMN "{column_name}" {column_type}')
                except Exception as e:
                    logger.warning(f"Could not add column {column_name} to {table_name}: {e}")
        elif schema_editor.connection.vendor == 'sqlite':
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = [column[1] for column in cursor.fetchall()]
            if column_name not in columns:
                cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}")

def remove_missing_columns(apps, schema_editor):
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('products', '0006_product_discount_end_product_discount_price_and_more'),
    ]

    operations = [
        # معالجة حقل التصنيفات في حالة الموديل
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name='category',
                    name='featured_on_homepage',
                    field=models.BooleanField(default=False, verbose_name='تمييز في الواجهة الرئيسية'),
                ),
            ],
            database_operations=[], 
        ),
        # معالجة حقول صور المنتجات في حالة الموديل
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name='product',
                    name='image_5',
                    field=models.URLField(blank=True, null=True, verbose_name='رابط الصورة الخامسة (ImgBB)'),
                ),
                migrations.AddField(
                    model_name='product',
                    name='image_6',
                    field=models.URLField(blank=True, null=True, verbose_name='رابط الصورة السادسة (ImgBB)'),
                ),
                migrations.AddField(
                    model_name='product',
                    name='image_7',
                    field=models.URLField(blank=True, null=True, verbose_name='رابط الصورة الخامسة (ImgBB)'),
                ),
                migrations.AddField(
                    model_name='product',
                    name='image_8',
                    field=models.URLField(blank=True, null=True, verbose_name='رابط الصورة السادسة (ImgBB)'),
                ),
            ],
            database_operations=[], 
        ),
        # تشغيل فحص وإضافة الأعمدة برمجياً لضمان عدم حدوث DuplicateColumnError
        migrations.RunPython(add_missing_columns, reverse_code=remove_missing_columns),
    ]
