import sqlite3
import os

# Path to database
db_path = os.path.join(os.path.dirname(__file__), 'db.sqlite3')

print(f"🔧 Fixing django_admin_log table...")
print(f"📁 Database: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check current structure
    cursor.execute("PRAGMA table_info(django_admin_log)")
    columns = cursor.fetchall()
    print(f"\n📋 Current columns in django_admin_log:")
    for col in columns:
        print(f"   - {col[1]} ({col[2]})")
    
    # Drop and recreate the table with correct structure for Django 5.2
    print("\n🗑️  Dropping old django_admin_log table...")
    cursor.execute("DROP TABLE IF EXISTS django_admin_log")
    
    print("✨ Creating new django_admin_log table with correct structure...")
    cursor.execute("""
        CREATE TABLE django_admin_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action_time DATETIME NOT NULL,
            object_id TEXT,
            object_repr VARCHAR(200) NOT NULL,
            action_flag SMALLINT UNSIGNED NOT NULL,
            change_message TEXT NOT NULL,
            content_type_id INTEGER,
            user_id TEXT NOT NULL,
            FOREIGN KEY (content_type_id) REFERENCES django_content_type (id),
            FOREIGN KEY (user_id) REFERENCES users_user (id)
        )
    """)
    
    # Create indexes
    print("📑 Creating indexes...")
    cursor.execute("""
        CREATE INDEX django_admin_log_content_type_id_c4bce8eb 
        ON django_admin_log (content_type_id)
    """)
    cursor.execute("""
        CREATE INDEX django_admin_log_user_id_c564eba6 
        ON django_admin_log (user_id)
    """)
    
    conn.commit()
    
    # Verify new structure
    cursor.execute("PRAGMA table_info(django_admin_log)")
    columns = cursor.fetchall()
    print(f"\n✅ New columns in django_admin_log:")
    for col in columns:
        print(f"   - {col[1]} ({col[2]})")
    
    print("\n✅ django_admin_log table fixed successfully!")
    print("🎉 You can now use the admin panel without errors!")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    conn.rollback()
finally:
    conn.close()