# E:\DiagnosisProject-main\patients\admin.py
from django.contrib import admin
from .models import Patient, Symptom, Diagnostic

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'date_of_birth')
    search_fields = ('full_name',)

@admin.register(Symptom)
class SymptomAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'patient', 'created_at')
    list_filter = ('name',)

@admin.register(Diagnostic)
class DiagnosticAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'disease', 'probability', 'date')
    list_filter = ('disease',)
