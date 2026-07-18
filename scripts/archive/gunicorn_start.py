#!/usr/bin/env python
import os
import sys
import subprocess

# Print current directory and contents for debugging
print("Current directory:", os.getcwd())
print("Directory contents:", os.listdir('.'))

# Add the backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
print("Adding to Python path:", backend_path)
sys.path.insert(0, backend_path)

# Change to backend directory
os.chdir(backend_path)
print("Changed to directory:", os.getcwd())
print("Backend directory contents:", os.listdir('.'))

# Run gunicorn
print("Starting gunicorn...")
subprocess.run([
    'gunicorn',
    '--bind', '0.0.0.0:8000',
    'ecom_project.wsgi:application'
])
