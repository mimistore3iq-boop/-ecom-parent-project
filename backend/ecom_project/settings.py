"""
Django settings for ecom_project project.
"""

import os
from pathlib import Path
from decouple import config
import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-me-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.0.0.0.0,ecom-parent-project.onrender.com').split(',')

# Application definition
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'whitenoise',
]

LOCAL_APPS = [
    'users',
    'products',
    'orders.apps.OrdersConfig',
    'notifications',
    'test_app',
]

INSTALLED_APPS = ['jazzmin'] + DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ecom_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR.parent / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'ecom_project.context_processors.currency',
            ],
        },
    },
]

WSGI_APPLICATION = 'ecom_project.wsgi.application'

# Database
import warnings
warnings.filterwarnings('ignore', category=RuntimeWarning)

if config('DEBUG', default=False, cast=bool):
    # بيئة التطوير: SQLite
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    # بيئة الإنتاج: PostgreSQL
    DATABASES = {
        'default': dj_database_url.config(
            default=config('DATABASE_URL'),
            conn_max_age=600,
            conn_health_checks=True,
        )
    }

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# Authentication backends
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'users.backends.PhoneBackend',
]

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'ar'
TIME_ZONE = 'Asia/Riyadh'
USE_I18N = True
USE_TZ = True

# Currency
CURRENCY_SYMBOL = 'د.ع'
CURRENCY_CODE = 'IQD'

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'

# In production, static files will be collected to this directory
if not DEBUG:
    STATIC_ROOT = BASE_DIR / 'staticfiles'
    # Use WhiteNoise for serving static files in production
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
    # WhiteNoise settings
    WHITENOISE_USE_FINDERS = True
    WHITENOISE_COMPRESSION_ENABLED = True
    WHITENOISE_SKIP_COMPRESS_EXTENSIONS = [
        '.jpg', '.jpeg', '.png', '.gif', '.webp', '.zip', '.gz', '.tgz', '.bz2', '.xz',
    ]

STATICFILES_DIRS = [
    BASE_DIR / 'static',
    BASE_DIR.parent / 'static',
]

# Additional static files for Jazzmin
JAZZMIN_STATIC = {
    'vendor': {
        'css': {
            'all.min.css': 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
            'adminlte.min.css': 'https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/css/adminlte.min.css',
            'bootstrap.min.css': 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css',
        },
        'js': {
            'jquery.min.js': 'https://code.jquery.com/jquery-3.6.0.min.js',
            'bootstrap.min.js': 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.min.js',
            'adminlte.min.js': 'https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/js/adminlte.min.js',
        }
    }
}

# Static files finders
STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]

# Static files storage
if not DEBUG:
    # In production, we need to set STATIC_ROOT and run collectstatic
    # Use ManifestStaticFilesStorage for better caching
    STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.ManifestStaticFilesStorage'
else:
    STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# Make sure static files are served properly
STATIC_URL = '/static/'

# Ensure static files are served in production
if not DEBUG:
    STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.ManifestStaticFilesStorage'
    # Make sure all static files are collected
    STATIC_ROOT = BASE_DIR / 'staticfiles'
    # Ensure static files are properly served
    STATIC_URL = '/static/'
    # Make sure static files are collected during deployment
    STATICFILES_DIRS = [
        BASE_DIR / 'static',
        BASE_DIR.parent / 'static',
    ]
    # Ensure static files are served correctly in production
    STATICFILES_FINDERS = [
        'django.contrib.staticfiles.finders.FileSystemFinder',
        'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    ]
    # Use external CDN for static files in production
    # Note: JAZZMIN_SETTINGS will be updated later in the file
    # Make sure static files are collected during deployment
    STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.ManifestStaticFilesStorage'
    # Ensure static files are collected during deployment
    STATIC_ROOT = BASE_DIR / 'staticfiles'
    # Ensure static files are served correctly in production
    STATIC_URL = '/static/'
    # Make sure static files are collected during deployment
    STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.ManifestStaticFilesStorage'
    # Ensure static files are collected during deployment
    STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Ensure media files are served correctly in production
if not DEBUG:
    # Use WhiteNoise for serving media files in production
    WHITENOISE_MEDIA = True
    WHITENOISE_MEDIA_PREFIX = 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_AUTHENTICATION_BACKENDS': [
        'users.backends.PhoneBackend',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# JWT Configuration
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3002',  # Frontend
    'http://127.0.0.1:3002',  # Frontend
    'http://localhost:5500',  # Live Server
    'http://127.0.0.1:5500',  # Live Server
    'http://localhost:8000',  # Backend API port
    'http://127.0.0.1:8000',  # Backend API port
    'http://localhost:8080',  # Alternative port
    'http://127.0.0.1:8080',  # Alternative port
    'https://ecom-parent-project-1.onrender.com',  # Production frontend
]

# Render frontend URL
RENDER_FRONTEND_URL = config('RENDER_FRONTEND_URL', default='https://ecom-parent-project-1.onrender.com')
if RENDER_FRONTEND_URL and RENDER_FRONTEND_URL not in CORS_ALLOWED_ORIGINS:
    CORS_ALLOWED_ORIGINS.append(RENDER_FRONTEND_URL)

# Allow file:// protocol for local HTML files
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True  # For development only
else:
    # In production, allow specific origins
    CORS_ALLOWED_ORIGINS = list(set(CORS_ALLOWED_ORIGINS))  # Remove duplicates
    CORS_ALLOW_ALL_ORIGINS = True  # Temporary fix for production
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_HEADERS = True
CORS_ALLOW_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']

# Additional CORS headers
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Using ImgBB for image hosting; no server-side SDK required

# Firebase Configuration
FIREBASE_CREDENTIALS_PATH = config('FIREBASE_CREDENTIALS_PATH', default=str(BASE_DIR / 'firebase' / 'ecomproject-a8173-38763797948f.json'))
FIREBASE_PROJECT_ID = config('FIREBASE_PROJECT_ID', default='ecomproject-a8173')

# ImgBB Configuration
IMGBB_API_KEY = config('IMGBB_API_KEY', default='a2cebbc3daff0b042082a5d5d7a3b80d')

# Security Settings
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_REDIRECT_EXEMPT = []
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_PRELOAD = True
else:
    # Disable SSL redirect in development
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Create logs directory if it doesn't exist
os.makedirs(BASE_DIR / 'logs', exist_ok=True)

# Jazzmin settings
JAZZMIN_SETTINGS = {
    # Site branding
    "site_title": "voro - لوحة الإدارة",
    "site_header": "🛍️ voro",
    "site_brand": "voro",
    "site_logo": None,
    "login_logo": None,
    "login_logo_dark": None,
    "site_logo_classes": "img-circle",
    "site_icon": None,

    # Welcome message
    "welcome_sign": "مرحباً بك في لوحة تحكم متجر voro الاحترافية",
    "copyright": "© 2024 voro - جميع الحقوق محفوظة",

    # Search model
    "search_model": ["users.User", "products.Product", "products.Coupon", "orders.Order"],

    # Field name to display for the user in top right
    "user_avatar": None,

    # Links to put along the top menu
    "topmenu_links": [
        {"name": "الرئيسية", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "عرض الموقع", "url": "/", "new_window": True},
        {"name": "API", "url": "/api/", "new_window": True},
        {"model": "users.User"},
        {"app": "products"},
    ],

    # Whether to display the side menu
    "show_sidebar": True,

    # Whether to aut expand the menu
    "navigation_expanded": True,

    # Hide these apps when generating side menu
    "hide_apps": [],

    # Hide these models when generating side menu
    "hide_models": [],

    # List of apps (and models) to base side menu ordering off of
    "order_with_respect_to": ["users", "products", "orders", "auth"],

    # Custom links to append to app groups
    "custom_links": {
        "products": [
            {
                "name": "إضافة منتج جديد", 
                "url": "admin:products_product_add", 
                "icon": "fas fa-plus",
                "permissions": ["products.add_product"]
            },
            {
                "name": "إدارة الكوبونات", 
                "url": "admin:products_coupon_changelist", 
                "icon": "fas fa-ticket-alt",
                "permissions": ["products.view_coupon"]
            },
            {
                "name": "إضافة كوبون جديد", 
                "url": "admin:products_coupon_add", 
                "icon": "fas fa-plus-circle",
                "permissions": ["products.add_coupon"]
            }
        ],
        "orders": [{
            "name": "الطلبات الجديدة", 
            "url": "admin:orders_order_changelist", 
            "icon": "fas fa-shopping-cart",
            "permissions": ["orders.view_order"]
        }],
        "users": [{
            "name": "المستخدمون الجدد", 
            "url": "admin:users_user_changelist", 
            "icon": "fas fa-users",
            "permissions": ["users.view_user"]
        }],
        "notifications": [{
            "name": "الإشعارات", 
            "url": "admin:notifications_notification_changelist", 
            "icon": "fas fa-bell",
            "permissions": ["notifications.view_notification"]
        }]
    },

    # Custom icons for side menu apps/models
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        "users.User": "fas fa-user-circle",
        "products.Product": "fas fa-box",
        "products.Category": "fas fa-tags",
        "products.Coupon": "fas fa-ticket-alt",
        "products.CouponUsage": "fas fa-receipt",
        "products.Banner": "fas fa-image",
        "products.ProductReview": "fas fa-star",
        "products.ProductView": "fas fa-eye",
        "orders.Order": "fas fa-shopping-cart",
        "orders.OrderItem": "fas fa-list",
        "notifications.Notification": "fas fa-bell",
        "notifications.DeviceToken": "fas fa-mobile-alt",
    },

    # Icons that are used when one is not manually specified
    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",

    # Related modal
    "related_modal_active": False,

    # Use modals instead of popups
    "use_google_fonts_cdn": True,
    "show_ui_builder": True,

    # Language chooser
    "language_chooser": False,

    # RTL support
    "html_direction": "rtl",
}

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-purple",
    "accent": "accent-teal",
    "navbar": "navbar-dark",
    "no_navbar_border": False,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-purple",
    "sidebar_nav_small_text": False,
    "sidebar_nav_flat_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_compact_style": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": False,
    "theme": "litera",
    "dark_mode_theme": "darkly",
    "theme_condition": "none",
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success"
    },
    "actions_sticky_top": True,
    "custom_css": "custom_admin.css",
    "custom_js": "custom_admin.js",
    # Use external CDN for static files in production
    "use_external_cdn": True,
    "external_cdn": {
        "fontawesome": "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css",
        "adminlte": {
            "css": "https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/css/adminlte.min.css",
            "js": "https://cdn.jsdelivr.net/npm/admin-lte@3.2/dist/js/adminlte.min.js",
        },
        "bootstrap": {
            "css": "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css",
            "js": "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.min.js",
        },
        "jquery": "https://code.jquery.com/jquery-3.6.0.min.js",
    }
}

# ==========================
# FIREBASE CONFIGURATION
# ==========================
import json

firebase_credentials_json = config('FIREBASE_CREDENTIALS_JSON', default=None)
FIREBASE_CREDENTIALS_PATH = config('FIREBASE_CREDENTIALS_PATH', default=str(BASE_DIR / 'firebase' / 'ecomproject-a8173-38763797948f.json'))

try:
    import firebase_admin
    from firebase_admin import credentials

    if firebase_credentials_json:
        cred_dict = json.loads(firebase_credentials_json)
        cred = credentials.Certificate(cred_dict)
    elif os.path.exists(FIREBASE_CREDENTIALS_PATH):
        cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
    else:
        cred = None

    if cred:
        firebase_admin.initialize_app(cred)
        print("Firebase initialized successfully.")
    else:
        print("Firebase credentials not found. Skipping initialization.")
except ModuleNotFoundError:
    print("Firebase Admin library not installed.")
