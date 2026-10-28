import os
from pathlib import Path

import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent


def env_bool(nome, padrao):
  valor = os.environ.get(nome)
  if valor is None:
    return padrao
  return valor.strip().lower() in ('1', 'true', 'yes', 'sim')


def env_lista(nome, padrao=''):
  valor = os.environ.get(nome, padrao)
  return [item.strip() for item in valor.split(',') if item.strip()]


DEBUG = env_bool('DEBUG', True)

SECRET_KEY = os.environ.get('SECRET_KEY', '')
if not SECRET_KEY:
  if not DEBUG:
    raise RuntimeError('Defina SECRET_KEY nas variáveis de ambiente.')
  SECRET_KEY = 'dev-inseguro-apenas-para-uso-local-0000'

ALLOWED_HOSTS = env_lista('ALLOWED_HOSTS', '*')
RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
  ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'denuncias', 
]

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

ROOT_URLCONF = 'contravetores.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'contravetores.wsgi.application'


DATABASES = {
    'default': dj_database_url.config(
        default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',
        conn_max_age=600,
    )
}


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


LANGUAGE_CODE = 'pt-br'

TIME_ZONE = 'America/Recife'

USE_I18N = True

USE_TZ = True


STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

if not DEBUG:
  MIDDLEWARE.insert(2, 'whitenoise.middleware.WhiteNoiseMiddleware')
  STORAGES = {
      'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
      'staticfiles': {
          'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
      },
  }

MEDIA_URL = '/media/'
MEDIA_ROOT = os.environ.get('MEDIA_ROOT', BASE_DIR / 'media')
SERVE_MEDIA = env_bool('SERVE_MEDIA', DEBUG)

DATA_UPLOAD_MAX_MEMORY_SIZE = 11 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 11 * 1024 * 1024

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}


CORS_ALLOWED_ORIGINS = env_lista('CORS_ALLOWED_ORIGINS')
CORS_ALLOW_ALL_ORIGINS = DEBUG and not CORS_ALLOWED_ORIGINS
CSRF_TRUSTED_ORIGINS = env_lista('CSRF_TRUSTED_ORIGINS')

if not DEBUG:
  SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
  SESSION_COOKIE_SECURE = True
  CSRF_COOKIE_SECURE = True

AUTH_USER_MODEL = 'denuncias.Usuario'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'