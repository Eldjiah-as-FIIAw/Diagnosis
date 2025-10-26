# E:\DiagnosisProject-main\diagnosis_api\asgi.py
import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'diagnosis_api.settings')
application = get_asgi_application()
