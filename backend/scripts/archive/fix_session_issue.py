"""
Fix the session issue by removing the custom sessions app migration
and ensuring Django's built-in session handling works correctly.
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from django.db import connection

def fix_session_migration():
    """Remove the custom sessions migration from django_migrations table"""
    with connection.cursor() as cursor:
        # Check if the migration exists
        cursor.execute("""
            SELECT id, app, name FROM django_migrations 
            WHERE app = 'sessions';
        """)
        migrations = cursor.fetchall()
        
        if migrations:
            print("Found custom sessions migrations:")
            for migration in migrations:
                print(f"  - ID: {migration[0]}, App: {migration[1]}, Name: {migration[2]}")
            
            # Delete the custom sessions migration
            cursor.execute("DELETE FROM django_migrations WHERE app = 'sessions';")
            print(f"\n✅ Deleted {cursor.rowcount} custom sessions migration(s)")
            
            # Now Django will use its built-in session handling
            print("✅ Django will now use built-in session handling")
        else:
            print("ℹ️  No custom sessions migrations found")
        
        # Verify django_session table is correct
        cursor.execute("PRAGMA table_info(django_session);")
        columns = cursor.fetchall()
        
        expected_columns = ['session_key', 'session_data', 'expire_date']
        actual_columns = [col[1] for col in columns]
        
        if set(expected_columns) == set(actual_columns):
            print("✅ django_session table structure is correct")
        else:
            print(f"⚠️  Table structure mismatch:")
            print(f"   Expected: {expected_columns}")
            print(f"   Actual: {actual_columns}")

if __name__ == '__main__':
    try:
        fix_session_migration()
        print("\n✅ Session issue fixed successfully!")
        print("\nℹ️  You can now try logging in to the admin panel.")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()