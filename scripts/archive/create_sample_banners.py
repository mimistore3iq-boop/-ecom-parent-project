import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from products.models import Banner, Product

def create_sample_banners():
    print("Creating sample banners...")

    # Create sample banners
    banner_data = [
        {
            'title': 'تخفيضات الصيف',
            'description': 'خصم يصل إلى 50% على جميع منتجات الصيف',
            'image': 'https://i.ibb.co/8X0Q2vN/summer-sale.jpg',
            'link_url': 'https://example.com/summer-sale',
            'is_active': True,
            'display_order': 1
        },
        {
            'title': 'منتجات جديدة',
            'description': 'استكشف أحدث منتجاتنا المضافة',
            'image': 'https://i.ibb.co/3dX0qQJ/new-products.jpg',
            'link_url': 'https://example.com/new-products',
            'is_active': True,
            'display_order': 2
        },
        {
            'title': 'عروض الأسبوع',
            'description': 'عروض خاصة لهذا الأسبوع فقط',
            'image': 'https://i.ibb.co/2Z7QfVf/weekly-offers.jpg',
            'link_url': 'https://example.com/weekly-offers',
            'is_active': True,
            'display_order': 3
        },
        {
            'title': 'توصيل مجاني',
            'description': 'توصيل مجاني لجميع الطلبات فوق 100 ريال',
            'image': 'https://i.ibb.co/6WZqQ0T/free-shipping.jpg',
            'link_url': 'https://example.com/free-shipping',
            'is_active': True,
            'display_order': 4
        },
        {
            'title': 'مجموعة الإلكترونيات',
            'description': 'أحدث الأجهزة الإلكترونية بأسعار مميزة',
            'image': 'https://i.ibb.co/Zf3Q3rN/electronics.jpg',
            'link_url': 'https://example.com/electronics',
            'is_active': True,
            'display_order': 5
        }
    ]

    for data in banner_data:
        banner, created = Banner.objects.get_or_create(
            title=data['title'],
            defaults=data
        )
        if created:
            print(f"Created banner: {banner.title}")
        else:
            print(f"Banner already exists: {banner.title}")

    print("Sample banners created successfully!")

if __name__ == '__main__':
    create_sample_banners()
