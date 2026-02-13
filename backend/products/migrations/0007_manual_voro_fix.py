
from django.db import migrations, models

def add_missing_columns(apps, schema_editor):
    db_vendor = schema_editor.connection.vendor
    
    # 1. حقل featured_on_homepage في جدول products_category
    check_and_add_column(
        schema_editor, 
        'products_category', 
        'featured_on_homepage', 
        'boolean DEFAULT FALSE NOT NULL' if db_vendor == 'postgresql' else 'boolean DEFAULT 0 NOT NULL'
    )
    
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
            cursor.execute(
                f"SELECT 1 FROM information_schema.columns WHERE table_name='{table_name}' AND column_name='{column_name}'"
            )
            exists = cursor.fetchone()
            if not exists:
                cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}")
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
        # معالجة حقل التصنيفات
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name='category',
                    name='featured_on_homepage',
                    field=models.BooleanField(default=False, verbose_name='تمييز في الواجهة الرئيسية'),
                ),
            ],
            database_operations=[], # سنتعامل معها في RunPython الموحد
        ),
        # معالجة حقول صور المنتجات
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
                    field=models.URLField(blank=True, null=True, verbose_name='رابط الصورة السابعة (ImgBB)'),
                ),
                migrations.AddField(
                    model_name='product',
                    name='image_8',
                    field=models.URLField(blank=True, null=True, verbose_name='رابط الصورة الثامنة (ImgBB)'),
                ),
            ],
            database_operations=[], # سنتعامل معها في RunPython الموحد
        ),
        # تشغيل فحص وإضافة الأعمدة برمجياً
        migrations.RunPython(add_missing_columns, reverse_code=remove_missing_columns),
    ]
