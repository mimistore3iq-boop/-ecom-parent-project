#!/usr/bin/env python3
"""
Simple HTTP server to serve the frontend files
This solves CORS issues when opening HTML files directly
"""

import http.server
import socketserver
import os
import webbrowser
import threading
import time

# Configuration
PORT = 3000
DIRECTORY = "frontend"

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

def open_browser():
    """Open browser after a short delay"""
    time.sleep(1)
    webbrowser.open(f'http://localhost:{PORT}')

def main():
    # Change to project directory
    project_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_dir)
    
    print(f"📂 مجلد المشروع: {project_dir}")
    
    # Check if frontend directory exists
    frontend_path = os.path.join(project_dir, DIRECTORY)
    if not os.path.exists(frontend_path):
        print(f"❌ مجلد {DIRECTORY} غير موجود في: {frontend_path}")
        print("📁 الملفات الموجودة:")
        for item in os.listdir(project_dir):
            print(f"   - {item}")
        return
    
    # Check if backend is running
    try:
        import urllib.request
        urllib.request.urlopen('http://localhost:8000/api/', timeout=5)
        print("✅ Backend متصل!")
    except:
        print("⚠️  تحذير: Backend قد لا يكون متصلاً")
        print("   يرجى تشغيل: quick_start.bat")
    
    # Start server
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"🌐 تشغيل خادم الواجهة الأمامية على المنفذ {PORT}")
        print(f"📂 مجلد الملفات: {DIRECTORY}")
        print(f"🔗 الرابط: http://localhost:{PORT}")
        print("🛑 اضغط Ctrl+C للإيقاف")
        
        # Open browser in background
        browser_thread = threading.Thread(target=open_browser)
        browser_thread.daemon = True
        browser_thread.start()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 تم إيقاف الخادم")

if __name__ == "__main__":
    main()