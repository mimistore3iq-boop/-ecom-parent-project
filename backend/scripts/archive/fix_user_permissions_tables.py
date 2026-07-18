import sqlite3
import os

# Path to database
db_path = os.path.join(os.path.dirname(__file__), 'db.sqlite3')

print(f"🔧 Creating missing user permission tables...")
print(f"📁 Database: {db_path}\n")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Create users_user_groups table
    print("✨ Creating users_user_groups table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users_user_groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            group_id INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users_user (id) ON DELETE CASCADE,
            FOREIGN KEY (group_id) REFERENCES auth_group (id) ON DELETE CASCADE,
            UNIQUE (user_id, group_id)
        )
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS users_user_groups_user_id_b88eab82 
        ON users_user_groups (user_id)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS users_user_groups_group_id_9afc8d0e 
        ON users_user_groups (group_id)
    """)
    
    # Create users_user_user_permissions table
    print("✨ Creating users_user_user_permissions table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users_user_user_permissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            permission_id INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users_user (id) ON DELETE CASCADE,
            FOREIGN KEY (permission_id) REFERENCES auth_permission (id) ON DELETE CASCADE,
            UNIQUE (user_id, permission_id)
        )
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS users_user_user_permissions_user_id_20aca447 
        ON users_user_user_permissions (user_id)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS users_user_user_permissions_permission_id_0b93982e 
        ON users_user_user_permissions (permission_id)
    """)
    
    conn.commit()
    
    print("\n✅ All permission tables created successfully!")
    print("🎉 User permissions system is now ready!")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    conn.rollback()
finally:
    conn.close()