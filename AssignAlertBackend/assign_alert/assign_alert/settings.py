"""
Django settings for assign_alert project.
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
from corsheaders.defaults import default_headers

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError("SECRET_KEY is not set in environment variables!")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

FRONTEND_URL = "http://localhost:5173"

# ────────────────────────────────────────────────────────────────────────────────
# INSTALLED APPS
# ────────────────────────────────────────────────────────────────────────────────

INSTALLED_APPS = [
    # Custom configs to use ObjectIdAutoField for built-in apps (MongoDB requirement)
    'core.mongo_configs.MongoAdminConfig',
    'core.mongo_configs.MongoAuthConfig',
    'core.mongo_configs.MongoContentTypesConfig',

    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',

    'core',
]

# ────────────────────────────────────────────────────────────────────────────────
# MIDDLEWARE
# ────────────────────────────────────────────────────────────────────────────────

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ────────────────────────────────────────────────────────────────────────────────
# TEMPLATES
# ────────────────────────────────────────────────────────────────────────────────

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ────────────────────────────────────────────────────────────────────────────────
# DATABASE - MongoDB
# ────────────────────────────────────────────────────────────────────────────────

DATABASES = {
    'default': {
        'ENGINE': 'django_mongodb_backend',
        'NAME': os.getenv('MONGO_DB_NAME', 'assign_alert'),
        'CLIENT': {
            'host': os.getenv('MONGO_URI'),  # must be full mongodb+srv://... URI
            'tls': True,
            'tlsAllowInvalidCertificates': False,
            'tlsMinProtocol': 'tls1.2',
            'serverSelectionTimeoutMS': 15000,
            'connectTimeoutMS': 20000,
            'socketTimeoutMS': 20000,
        }
    }
}

# Development fallback (very useful when MongoDB is down)
if DEBUG and os.getenv('USE_SQLITE_DEV') == '1':
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }

# Required for MongoDB + custom User model
DEFAULT_AUTO_FIELD = 'django_mongodb_backend.fields.ObjectIdAutoField'

# ────────────────────────────────────────────────────────────────────────────────
# AUTHENTICATION & CUSTOM USER
# ────────────────────────────────────────────────────────────────────────────────

AUTH_USER_MODEL = 'core.User'

# Very important for custom user model + JWT
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

# ────────────────────────────────────────────────────────────────────────────────
# REST FRAMEWORK & JWT CONFIGURATION
# ────────────────────────────────────────────────────────────────────────────────

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
        # Comment BrowsableAPIRenderer during API debugging (prevents HTML 400)
        # 'rest_framework.renderers.BrowsableAPIRenderer',
    ),
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=2),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
    # Very important when using ObjectId as pk
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# ────────────────────────────────────────────────────────────────────────────────
# CORS (careful in production!)
# ────────────────────────────────────────────────────────────────────────────────

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


CORS_ALLOW_HEADERS = list(default_headers) + [
    'cache-control',
    'pragma',
    'expires',
]

# ────────────────────────────────────────────────────────────────────────────────
# OTHER SETTINGS
# ────────────────────────────────────────────────────────────────────────────────

ROOT_URLCONF = 'assign_alert.urls'
WSGI_APPLICATION = 'assign_alert.wsgi.application'

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'  # Better for your location (Bhayandar, MH)
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

# Password validation (keep them – good security)
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Celery (unchanged)
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'


EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'eacc11158@gmail.com'          
EMAIL_HOST_PASSWORD = 'yxckrubtgszfndkk'        
DEFAULT_FROM_EMAIL = 'Assign Alert <eacc11158@gmail.com>'