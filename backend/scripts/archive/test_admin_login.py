"""
Test admin login functionality after fixing the session issue
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecom_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.sessions.backends.db import SessionStore

User = get_user_model()

def test_session_creation():
    """Test if we can create a session"""
    try:
        # Create a test session
        session = SessionStore()
        session['test_key'] = 'test_value'
        session.save()
        
        print("✅ Session created successfully!")
        print(f"   Session key: {session.session_key}")
        
        # Retrieve the session
        retrieved_session = SessionStore(session_key=session.session_key)
        if retrieved_session.get('test_key') == 'test_value':
            print("✅ Session retrieved successfully!")
        else:
            print("❌ Session retrieval failed!")
        
        # Clean up
        session.delete()
        print("✅ Session deleted successfully!")
        
        return True
    except Exception as e:
        print(f"❌ Session test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_admin_user():
    """Check if admin user exists"""
    try:
        admin_users = User.objects.filter(is_superuser=True)
        if admin_users.exists():
            print(f"\n✅ Found {admin_users.count()} admin user(s):")
            for user in admin_users:
                print(f"   - Username: {user.username}, Phone: {user.phone}")
        else:
            print("\n⚠️  No admin users found!")
            print("   Creating default admin user...")
            User.objects.create_superuser(
                username='admin',
                phone='01234567890',
                email='admin@example.com',
                password='admin123'
            )
            print("✅ Admin user created successfully!")
    except Exception as e:
        print(f"❌ Error checking admin user: {e}")

if __name__ == '__main__':
    print("=" * 60)
    print("Testing Admin Login Functionality")
    print("=" * 60)
    
    print("\n1. Testing session creation...")
    session_ok = test_session_creation()
    
    print("\n2. Checking admin user...")
    check_admin_user()
    
    print("\n" + "=" * 60)
    if session_ok:
        print("✅ All tests passed! Admin login should work now.")
        print("\nYou can now login with:")
        print("   Username/Phone: admin or 01234567890")
        print("   Password: admin123")
    else:
        print("❌ Some tests failed. Please check the errors above.")
    print("=" * 60)