import os
import requests
import uuid
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from products.models import Product, Banner

class Command(BaseCommand):
    help = 'Migrate existing images from external URLs (ImgBB/imgpp) to Cloudflare R2'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Starting image migration to R2...'))
        
        # 1. Migrate Product images
        products = Product.objects.all()
        self.stdout.write(f'Found {products.count()} products to check.')
        
        image_fields = ['main_image', 'image_2', 'image_3', 'image_4', 'image_5', 'image_6', 'image_7', 'image_8']
        
        for product in products:
            updated = False
            for field_name in image_fields:
                url = getattr(product, field_name)
                if url and ('imgbb' in url.lower() or 'imgpp' in url.lower() or 'i.ibb.co' in url.lower()):
                    new_url = self.migrate_image(url, f"products/{product.id}")
                    if new_url:
                        setattr(product, field_name, new_url)
                        updated = True
            
            if updated:
                product.save()
                self.stdout.write(self.style.SUCCESS(f'  ✅ Updated images for product: {product.name} (ID: {product.id})'))

        # 2. Migrate Banner images
        banners = Banner.objects.all()
        self.stdout.write(f'Found {banners.count()} banners to check.')
        
        for banner in banners:
            if banner.image_url and ('imgbb' in banner.image_url.lower() or 'imgpp' in banner.image_url.lower() or 'i.ibb.co' in banner.image_url.lower()):
                new_url = self.migrate_image(banner.image_url, f"banners/{banner.id}")
                if new_url:
                    banner.image_url = new_url
                    banner.save()
                    self.stdout.write(self.style.SUCCESS(f'  ✅ Updated image for banner: {banner.title} (ID: {banner.id})'))

        self.stdout.write(self.style.SUCCESS('🎉 Migration completed!'))

    def migrate_image(self, url, folder):
        try:
            self.stdout.write(f'    ⏳ Downloading: {url}')
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            # Get extension from URL or content-type
            ext = '.jpg'
            if 'image/png' in response.headers.get('Content-Type', ''):
                ext = '.png'
            elif 'image/webp' in response.headers.get('Content-Type', ''):
                ext = '.webp'
            elif '.' in url.split('/')[-1]:
                ext = '.' + url.split('/')[-1].split('.')[-1]
            
            filename = f"migrated/{folder}/{uuid.uuid4()}{ext}"
            
            # Save to R2 via default_storage
            path = default_storage.save(filename, ContentFile(response.content))
            new_url = default_storage.url(path)
            
            self.stdout.write(self.style.SUCCESS(f'    ✅ Migrated to: {new_url}'))
            return new_url
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'    ❌ Failed to migrate {url}: {str(e)}'))
            return None
