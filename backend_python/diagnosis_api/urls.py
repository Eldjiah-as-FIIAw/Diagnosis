# F:\DiagnosisProject-main\diagnosis_api\urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.http import JsonResponse
from django.http import HttpResponse
def index(request):
    return HttpResponse("Backend Django is running")
# ---------------- Endpoint racine pour lister l'API ----------------
def api_root(request):
    return JsonResponse({
        "auth": {
            "login": "/api/token/ [POST]",
            "refresh": "/api/token/refresh/ [POST]"
        },
        "patients": {
            "submit_symptoms": "/api/symptoms/ [POST]",
            "create_patient": "/api/patients/ [POST]",
            "patient_history": "/api/patients/<id>/history/ [GET]",
            "export_patients": "/api/patients/export/ [GET]"
        },
        "diagnostics": {
            "list": "/api/diagnostics/ [GET]",
            "stats": "/api/diagnostics/stats/ [GET]"
        }
    })

# ---------------- URLs principales ----------------
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', index),  # Route racine pour gérer les requêtes HEAD de wait-on 
    # JWT endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Endpoint racine /api/
    path('api/', api_root, name='api_root'),

    # Routes de l’app patients
    path('api/', include('patients.urls')),

    path('api/image/', include('image_recognition.urls')),
]
