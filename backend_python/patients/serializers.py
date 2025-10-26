from rest_framework import serializers
from .models import Patient, Symptom, Diagnostic

class PatientSerializer(serializers.ModelSerializer):
    age = serializers.IntegerField(read_only=True)  # juste read_only

    class Meta:
        model = Patient
        fields = ['id', 'full_name', 'date_of_birth', 'sex', 'age']

class SymptomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Symptom
        fields = ['id', 'name', 'created_at']

class DiagnosticSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnostic
        fields = ['id', 'disease', 'probability', 'date']

class SubmitSymptomsSerializer(serializers.Serializer):
    patient_id = serializers.IntegerField()
    symptoms = serializers.ListField(child=serializers.CharField())
    patientName = serializers.CharField(required=False)
    sex = serializers.ChoiceField(choices=['male', 'female'], required=False)
