# F:\DiagnosisProject-main\patients\urls.py
from django.urls import path
from .views import (
    submit_symptoms,
    patient_history,
    diagnostics_list,
    diagnostic_stats,
    export_patients,
    create_patient,
    analyze_symptoms,
    search_patients,
    AIDiagnosisAPIView,
)

urlpatterns = [
    # Soumission de symptômes
    path('symptoms/', submit_symptoms, name='submit_symptoms'),

    # Analyse des symptômes via ML
    path('analyze/', analyze_symptoms, name='analyze_symptoms'),

    # Historique d’un patient
    path('patients/<int:patient_id>/history/', patient_history, name='patient_history'),

    # Liste des diagnostics
    path('diagnostics/', diagnostics_list, name='diagnostics_list'),

    # Statistiques des diagnostics
    path('diagnostics/stats/', diagnostic_stats, name='diagnostic_stats'),

    # Export CSV des patients
    path('patients/export/', export_patients, name='export_patients'),

    # Création et liste des patients
    path('patients/', create_patient, name='create_patient'),

    # Recherche de patients
    path('patients/search/', search_patients, name='search_patients'),

    # Analyse IA (image / vidéo)
    path('ai-diagnosis/', AIDiagnosisAPIView.as_view(), name='ai-diagnosis'),
]
