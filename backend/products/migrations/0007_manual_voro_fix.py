
from django.db import migrations, models

def add_featured_column(apps, schema_editor):
    table_name = 'products_category'
    column_name = 'featured_on_homepage'
    
    # Check if column exists
    with schema_editor.connection.cursor() as cursor:
        if schema_editor.connection.vendor == 'postgresql':
            cursor.execute(
                f"SELECT 1 FROM information_schema.columns WHERE table_name='{table_name}' AND column_name='{column_name}'"
            )
            exists = cursor.fetchone()
            if not exists:
                cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} boolean DEFAULT FALSE NOT NULL")
        elif schema_editor.connection.vendor == 'sqlite':
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = [column[1] for column in cursor.fetchall()]
            if column_name not in columns:
                cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} boolean DEFAULT 0 NOT NULL")

def remove_featured_column(apps, schema_editor):
    # Reverse logic if needed, but dropping columns is tricky in SQLite
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('products', '0006_product_discount_end_product_discount_price_and_more'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name='category',
                    name='featured_on_homepage',
                    field=models.BooleanField(default=False, verbose_name='تمييز في الواجهة الرئيسية'),
                ),
            ],
            database_operations=[
                migrations.RunPython(add_featured_column, reverse_code=remove_featured_column),
            ],
        ),
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
    ]
