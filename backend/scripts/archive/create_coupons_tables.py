import sqlite3
import os

# Path to database
db_path = os.path.join(os.path.dirname(__file__), 'db.sqlite3')

print(f"🔧 Creating coupons tables...")
print(f"📁 Database: {db_path}\n")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Create products_coupon table
    print("✨ Creating products_coupon table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products_coupon (
            id TEXT PRIMARY KEY,
            code VARCHAR(20) UNIQUE NOT NULL,
            description TEXT,
            discount_type VARCHAR(10) NOT NULL DEFAULT 'percentage',
            discount_value DECIMAL(10, 2) NOT NULL,
            minimum_order_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
            max_discount_amount DECIMAL(10, 2),
            start_date DATETIME NOT NULL,
            end_date DATETIME NOT NULL,
            usage_limit INTEGER,
            used_count INTEGER NOT NULL DEFAULT 0,
            is_active BOOLEAN NOT NULL DEFAULT 1,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL
        )
    """)
    
    # Create index on code
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS products_coupon_code_idx 
        ON products_coupon (code)
    """)
    
    # Create index on is_active
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS products_coupon_is_active_idx 
        ON products_coupon (is_active)
    """)
    
    # Create products_couponusage table
    print("✨ Creating products_couponusage table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products_couponusage (
            id TEXT PRIMARY KEY,
            coupon_id TEXT NOT NULL,
            order_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            discount_amount DECIMAL(10, 2) NOT NULL,
            used_at DATETIME NOT NULL,
            FOREIGN KEY (coupon_id) REFERENCES products_coupon (id) ON DELETE CASCADE,
            FOREIGN KEY (order_id) REFERENCES orders_order (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users_user (id) ON DELETE CASCADE,
            UNIQUE (coupon_id, order_id)
        )
    """)
    
    # Create indexes
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS products_couponusage_coupon_id_idx 
        ON products_couponusage (coupon_id)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS products_couponusage_order_id_idx 
        ON products_couponusage (order_id)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS products_couponusage_user_id_idx 
        ON products_couponusage (user_id)
    """)
    
    conn.commit()
    
    # Verify tables
    cursor.execute("PRAGMA table_info(products_coupon)")
    columns = cursor.fetchall()
    print(f"\n✅ products_coupon columns:")
    for col in columns:
        print(f"   - {col[1]} ({col[2]})")
    
    cursor.execute("PRAGMA table_info(products_couponusage)")
    columns = cursor.fetchall()
    print(f"\n✅ products_couponusage columns:")
    for col in columns:
        print(f"   - {col[1]} ({col[2]})")
    
    print("\n✅ Coupons tables created successfully!")
    print("🎉 You can now manage coupons in the admin panel!")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    conn.rollback()
finally:
    conn.close()