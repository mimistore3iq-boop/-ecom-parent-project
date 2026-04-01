from django.core.management.base import BaseCommand
from products.models import Product, Banner, Category

class Command(BaseCommand):
    help = 'Remove "uploads/" prefix from image URLs in the database'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Starting to fix image paths...'))
        
        # 1. Fix Product images
        products = Product.objects.all()
        image_fields = ['main_image', 'image_2', 'image_3', 'image_4', 'image_5', 'image_6', 'image_7', 'image_8']
        
        product_count = 0
        for product in products:
            updated = False
            for field in image_fields:
                url = getattr(product, field)
                if url and 'uploads/' in url:
                    new_url = url.replace('uploads/', '')
                    setattr(product, field, new_url)
                    updated = True
            
            if updated:
                product.save()
                product_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'✅ Fixed paths for {product_count} products.'))

        # 2. Fix Banner images
        banners = Banner.objects.all()
        banner_count = 0
        for banner in banners:
            if banner.image_url and 'uploads/' in banner.image_url:
                banner.image_url = banner.image_url.replace('uploads/', '')
                banner.save()
                banner_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'✅ Fixed paths for {banner_count} banners.'))

        # 3. Fix Category images (if any stored as URL or path)
        categories = Category.objects.all()
        cat_count = 0
        for cat in categories:
            if cat.image and 'uploads/' in str(cat.image):
                # For ImageField, we need to handle the underlying name
                name = cat.image.name
                if 'uploads/' in name:
                    cat.image.name = name.replace('uploads/', '')
                    cat.save()
                    cat_count += 1
            if cat.image_url and 'uploads/' in cat.image_url:
                cat.image_url = cat.image_url.replace('uploads/', '')
                cat.save()
                cat_count += 1

        self.stdout.write(self.style.SUCCESS(f'✅ Fixed paths for {cat_count} categories.'))
        self.stdout.write(self.style.SUCCESS('🎉 Path fixing completed!'))
