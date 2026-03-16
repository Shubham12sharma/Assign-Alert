"""
Django settings for assign_alert project.
MongoDB + Django Admin (Production Ready for Render Deployment)
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
from corsheaders.defaults import default_headers

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# ─────────────────────────────────────────────
# SECURITY
# ─────────────────────────────────────────────

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")

# DEBUG mode - set to False in production for security
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# Allowed hosts - include both local and production domains
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
ALLOWED_HOSTS.append("assign-alert.onrender.com")  # Production backend

# ─────────────────────────────────────────────
# APPLICATIONS (Admin enabled)
# ─────────────────────────────────────────────

INSTALLED_APPS = [
    "core.mongo_configs.MongoAdminConfig",
    "core.mongo_configs.MongoAuthConfig",
    "core.mongo_configs.MongoContentTypesConfig",

    # Required Django apps
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",  # This should only appear once

    # Third-party apps
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",

    # Local app
    "core",

    # Whitenoise for static files
    "whitenoise.runserver_nostatic",  # This is for local development, if needed
]

# ─────────────────────────────────────────────
# MIDDLEWARE
# ─────────────────────────────────────────────

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",  # Whitenoise needs to follow SecurityMiddleware
    "whitenoise.middleware.WhiteNoiseMiddleware",  # Add this line for static file handling
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ─────────────────────────────────────────────
# TEMPLATES (required for Django admin)
# ─────────────────────────────────────────────

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ─────────────────────────────────────────────
# DATABASE - MongoDB Atlas (for Render)
# ─────────────────────────────────────────────


if os.getenv("RENDER") == "true":
    # Production: PostgreSQL on Render
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("DB_NAME"),
            "USER": os.getenv("DB_USER"),
            "PASSWORD": os.getenv("DB_PASS"),
            "HOST": os.getenv("DB_HOST"),
            "PORT": os.getenv("DB_PORT", 5432),
        }
    }
    DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
else:
    # Development: MongoDB
    DATABASES = {
        "default": {
            "ENGINE": "django_mongodb_backend",
            "NAME": os.getenv("MONGO_DB_NAME", "assign_alert"),
            "CLIENT": {
                "host": os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/"),
            },
        }
    }


DEFAULT_AUTO_FIELD = "django_mongodb_backend.fields.ObjectIdAutoField"

# ─────────────────────────────────────────────
# AUTH
# ─────────────────────────────────────────────

AUTH_USER_MODEL = "core.User"

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
]

# ─────────────────────────────────────────────
# REST FRAMEWORK & JWT
# ─────────────────────────────────────────────

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    # Set default permission to AllowAny so endpoints without auth can be called
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.AllowAny",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=2),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}


# ─────────────────────────────────────────────
# CORS
# ─────────────────────────────────────────────

# Allowed origins for CORS requests
CORS_ALLOWED_ORIGINS = [
    "https://assign-alert1.onrender.com",  # Production frontend
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    
]

# Allow credentials (cookies, authorization headers)
CORS_ALLOW_CREDENTIALS = True

# Custom headers allowed

CORS_ALLOW_HEADERS = list(default_headers) + ["authorization"]


# ─────────────────────────────────────────────
# STATIC FILES
# ─────────────────────────────────────────────

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"  # For production use

# ─────────────────────────────────────────────
# CORE DJANGO
# ─────────────────────────────────────────────

ROOT_URLCONF = "assign_alert.urls"
WSGI_APPLICATION = "assign_alert.wsgi.application"

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ─────────────────────────────────────────────
# EMAIL (Use ENV Variables!)
# ─────────────────────────────────────────────

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL")

# ─────────────────────────────────────────────
# CELERY (optional)
# ─────────────────────────────────────────────

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")