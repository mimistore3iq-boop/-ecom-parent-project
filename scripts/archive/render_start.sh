#!/bin/bash
echo "Starting backend server..."
cd backend
ls -la
echo "Current directory: $(pwd)"
echo "Running gunicorn..."
gunicorn ecom_project.wsgi:application