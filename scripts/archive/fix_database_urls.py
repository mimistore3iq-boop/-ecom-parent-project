#!/usr/bin/env python
"""
URLs for database fix views
"""
from django.urls import path
from fix_database_view import fix_database

urlpatterns = [
    path('fix-database/', fix_database, name='fix_database'),
]
