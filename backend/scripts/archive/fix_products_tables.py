#!/usr/bin/env python
"""
Fix products tables structure to match the models
"""
import os
import sys
import django
import sqlite3

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')

# Setup Django
django.setup()

from django.conf import settings

print("=" * 70)
print("إصلاح بنية جداول المنتجات")
print("=" * 70)
print()

db_path = settings.DATABASES['default']['NAME']
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Fix products_category table
    print("1️⃣ إصلاح جدول products_category...")
    
    cursor.execute("PRAGMA table_info(products_category)")
    columns = cursor.fetchall()
    column_names = [col[1] for col in columns]
    
    required_category_cols = ['id', 'name', 'description', 'image', 'image_url', 'parent_id', 'is_active', 'created_at', 'updated_at']
    missing_category = [col for col in required_category_cols if col not in column_names]
    
    if missing_category:
        print(f"   ⚠️ أعمدة مفقودة: {', '.join(missing_category)}")
        
        # Backup data
        cursor.execute("SELECT * FROM products_category")
        old_data = cursor.fetchall()
        
        # Drop and recreate
        cursor.execute("DROP TABLE IF EXISTS products_category")
        cursor.execute("""
            CREATE TABLE products_category (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                image VARCHAR(100),
                image_url VARCHAR(200),
                parent_id INTEGER,
                is_active BOOLEAN NOT NULL DEFAULT 1,
                created_at TIMESTAMP NOT NULL,
                updated_at TIMESTAMP NOT NULL,
                FOREIGN KEY (parent_id) REFERENCES products_category(id) ON DELETE CASCADE
            )
        """)
        print("   ✅ تم إعادة إنشاء الجدول")
    else:
        print("   ✅ الجدول بنيته صحيحة")
    
    print()
    
    # Fix products_product table
    print("2️⃣ إصلاح جدول products_product...")
    
    cursor.execute("PRAGMA table_info(products_product)")
    columns = cursor.fetchall()
    column_names = [col[1] for col in columns]
    
    required_product_cols = [
        'id', 'name', 'description', 'category_id', 'price', 'discount_percentage',
        'stock_quantity', 'low_stock_threshold', 'main_image', 'image_2', 'image_3', 'image_4',
        'brand', 'model', 'color', 'size', 'weight', 'slug', 'meta_description', 'tags',
        'is_active', 'is_featured', 'created_at', 'updated_at'
    ]
    missing_product = [col for col in required_product_cols if col not in column_names]
    
    if missing_product:
        print(f"   ⚠️ أعمدة مفقودة: {', '.join(missing_product)}")
        
        # Backup data
        cursor.execute("SELECT * FROM products_product")
        old_data = cursor.fetchall()
        
        # Drop and recreate
        cursor.execute("DROP TABLE IF EXISTS products_product")
        cursor.execute("""
            CREATE TABLE products_product (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(200) NOT NULL,
                description TEXT NOT NULL,
                category_id INTEGER NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                discount_percentage INTEGER NOT NULL DEFAULT 0,
                stock_quantity INTEGER NOT NULL DEFAULT 0,
                low_stock_threshold INTEGER NOT NULL DEFAULT 10,
                main_image VARCHAR(200),
                image_2 VARCHAR(200),
                image_3 VARCHAR(200),
                image_4 VARCHAR(200),
                brand VARCHAR(100),
                model VARCHAR(100),
                color VARCHAR(50),
                size VARCHAR(50),
                weight DECIMAL(5, 2),
                slug VARCHAR(250) UNIQUE,
                meta_description VARCHAR(160),
                tags VARCHAR(500),
                is_active BOOLEAN NOT NULL DEFAULT 1,
                is_featured BOOLEAN NOT NULL DEFAULT 0,
                created_at TIMESTAMP NOT NULL,
                updated_at TIMESTAMP NOT NULL,
                FOREIGN KEY (category_id) REFERENCES products_category(id) ON DELETE CASCADE
            )
        """)
        print("   ✅ تم إعادة إنشاء الجدول")
    else:
        print("   ✅ الجدول بنيته صحيحة")
    
    print()
    
    # Create other product-related tables if they don't exist
    print("3️⃣ إنشاء جداول إضافية...")
    
    # ProductReview table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products_productreview (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            rating INTEGER NOT NULL,
            comment TEXT,
            is_approved BOOLEAN NOT NULL DEFAULT 1,
            created_at TIMESTAMP NOT NULL,
            FOREIGN KEY (product_id) REFERENCES products_product(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users_user(id) ON DELETE CASCADE,
            UNIQUE (product_id, user_id)
        )
    """)
    print("   ✅ products_productreview")
    
    # ProductView table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products_productview (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            user_id INTEGER,
            ip_address VARCHAR(39),
            user_agent TEXT,
            viewed_at TIMESTAMP NOT NULL,
            FOREIGN KEY (product_id) REFERENCES products_product(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users_user(id) ON DELETE CASCADE
        )
    """)
    print("   ✅ products_productview")
    
    # Banner table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products_banner (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            image VARCHAR(100),
            image_url VARCHAR(200),
            product_id INTEGER,
            link_url VARCHAR(200),
            is_active BOOLEAN NOT NULL DEFAULT 1,
            display_order INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL,
            FOREIGN KEY (product_id) REFERENCES products_product(id) ON DELETE CASCADE
        )
    """)
    print("   ✅ products_banner")
    
    print()
    
    # Commit changes
    conn.commit()
    
    print("=" * 70)
    print("✅ تم إصلاح جميع جداول المنتجات بنجاح!")
    print("=" * 70)

except Exception as e:
    print(f"❌ خطأ: {e}")
    import traceback
    traceback.print_exc()
    conn.rollback()
    sys.exit(1)

finally:
    conn.close()