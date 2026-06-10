from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0007_manual_voro_fix'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='similar_products',
            field=models.ManyToManyField(
                blank=True,
                related_name='similar_to',
                to='products.product',
                verbose_name='منتجات مشابهة',
            ),
        ),
    ]
