"""
Django settings for assign_alert project.
MongoDB + Django Admin (Local Testing Ready)
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

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# ─────────────────────────────────────────────
# APPLICATIONS (ADMIN ENABLED)
# ─────────────────────────────────────────────

INSTALLED_APPS = [
    # Mongo replacements (IMPORTANT)
    "core.mongo_configs.MongoAdminConfig",
    "core.mongo_configs.MongoAuthConfig",
    "core.mongo_configs.MongoContentTypesConfig",

    # Required Django apps
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",

    # Local app
    "core",
]

# ─────────────────────────────────────────────
# MIDDLEWARE
# ─────────────────────────────────────────────

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ─────────────────────────────────────────────
# TEMPLATES (REQUIRED FOR ADMIN)
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
# DATABASE - LOCAL MONGO
# ─────────────────────────────────────────────

DATABASES = {
    "default": {
        "ENGINE": "django_mongodb_backend",
        "NAME": "assign_alert",
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
# REST FRAMEWORK
# ─────────────────────────────────────────────

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
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
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://assign-alert1.onrender.com",  # Production frontend
]

# Allow credentials (cookies, authorization headers)
CORS_ALLOW_CREDENTIALS = True

# Custom headers allowed
CORS_ALLOW_HEADERS = list(default_headers)

# ─────────────────────────────────────────────
# STATIC FILES
# ─────────────────────────────────────────────

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# ─────────────────────────────────────────────
# CORE DJANGO
# ─────────────────────────────────────────────

ROOT_URLCONF = "assign_alert.urls"
WSGI_APPLICATION = "assign_alert.wsgi.application"

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True