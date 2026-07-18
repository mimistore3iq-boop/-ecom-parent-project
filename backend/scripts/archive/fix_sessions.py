import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from django.db import connection

def check_and_fix_sessions():
    """Check and fix session table issues"""
    with connection.cursor() as cursor:
        # Check if django_session table exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='django_session';
        """)
        result = cursor.fetchone()
        
        if result:
            print("✅ django_session table exists")
            
            # Check table structure
            cursor.execute("PRAGMA table_info(django_session);")
            columns = cursor.fetchall()
            print("\nTable structure:")
            for col in columns:
                print(f"  - {col[1]} ({col[2]})")
            
            # Check if there are any sessions
            cursor.execute("SELECT COUNT(*) FROM django_session;")
            count = cursor.fetchone()[0]
            print(f"\n📊 Number of sessions: {count}")
            
            # Clear old sessions
            cursor.execute("DELETE FROM django_session WHERE expire_date < datetime('now');")
            deleted = cursor.rowcount
            print(f"🗑️  Deleted {deleted} expired sessions")
            
        else:
            print("❌ django_session table does not exist")
            print("Creating django_session table...")
            
            # Create the table
            cursor.execute("""
                CREATE TABLE django_session (
                    session_key VARCHAR(40) NOT NULL PRIMARY KEY,
                    session_data TEXT NOT NULL,
                    expire_date DATETIME NOT NULL
                );
            """)
            cursor.execute("""
                CREATE INDEX django_session_expire_date_idx 
                ON django_session (expire_date);
            """)
            print("✅ django_session table created successfully")

if __name__ == '__main__':
    try:
        check_and_fix_sessions()
        print("\n✅ Session fix completed successfully!")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()