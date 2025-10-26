# patients/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Avg
from django.http import HttpResponse
import csv
from datetime import datetime
import requests

from .ml import predict_disease
from .serializers import SubmitSymptomsSerializer, DiagnosticSerializer, PatientSerializer
from .models import Patient, Symptom, Diagnostic
from .utils.web_utils import build_query, search_web_serpapi, fetch_snippet, normalize_text

# ---------------- Traduction automatique ----------------
def translate_to_french(text: str) -> str:
    """Force la traduction d'un texte en français via MyMemory API."""
    try:
        tr_url = f"https://api.mymemory.translated.net/get?q={text}&langpair=en|fr"
        tr_response = requests.get(tr_url, timeout=5)
        if tr_response.status_code == 200:
            data = tr_response.json()
            translated = data.get("responseData", {}).get("translatedText")
            if translated:
                return translated
    except Exception:
        pass
    return text

# ---------------- Analyse des symptômes ----------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_symptoms(request):
    serializer = SubmitSymptomsSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    symptoms = serializer.validated_data['symptoms']
    patient_name = serializer.validated_data.get('patientName', 'Inconnu')
    age = serializer.validated_data.get('age', 0)

    normalized_symptoms = [normalize_text(s).capitalize() for s in symptoms]

    # Prédiction
    try:
        disease, prob = predict_disease(normalized_symptoms)
        disease_fr = translate_to_french(disease)
    except Exception as e:
        return Response({'error': f'Erreur modèle : {str(e)}'}, status=500)

    # Scrap web
    snippets = []
    try:
        symptoms_fr = [translate_to_french(s) for s in normalized_symptoms]
        query = build_query(symptoms_fr, disease_fr)
        links = search_web_serpapi(query, num_results=3)

        if not links:
            snippets.append({
                'title': 'Aucun résultat trouvé',
                'url': '',
                'snippet': f'Impossible de récupérer un résultat pour la query "{query}"'
            })

        for title, url in links:
            try:
                snippet_text = fetch_snippet(url)
            except Exception as e:
                snippet_text = f"Impossible de récupérer l'extrait ({str(e)})"
            snippets.append({'title': title, 'url': url, 'snippet': snippet_text})

    except Exception as e:
        snippets.append({'title': 'Erreur', 'url': '', 'snippet': f'Impossible de récupérer les résultats ({str(e)})'})

    diagnostic_text = (
        f"Le patient {patient_name} présente des symptômes compatibles avec {disease_fr}. "
        f"La probabilité estimée est de {round(prob * 100, 1)}%. "
        "Les informations ci-dessous sont tirées de sources médicales francophones."
    )

    return Response({
        'diagnostic': {
            'disease': disease_fr,
            'probability': prob * 100,
            'patientName': patient_name,
            'age': age,
            'date': datetime.now(),
            'summary': diagnostic_text
        },
        'web_results': snippets
    })

# ---------------- Soumission des symptômes ----------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_symptoms(request):
    serializer = SubmitSymptomsSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    patient_id = serializer.validated_data['patient_id']
    symptoms = serializer.validated_data['symptoms']
    patient_name = serializer.validated_data.get('patientName')
    sex = serializer.validated_data.get('sex', 'male')

    patient, created = Patient.objects.get_or_create(
        id=patient_id,
        defaults={'full_name': patient_name or "Inconnu", 'sex': sex}
    )
    if not created:
        if patient_name:
            patient.full_name = patient_name
        if sex:
            patient.sex = sex
        patient.save()

    normalized_symptoms = [normalize_text(s).capitalize() for s in symptoms]

    # Ajout des symptômes
    for s in normalized_symptoms:
        Symptom.objects.get_or_create(patient=patient, name=s)

    # Diagnostic
    today = datetime.today().date()
    existing_diag = Diagnostic.objects.filter(patient=patient, date__date=today).first()

    if existing_diag:
        existing_symptoms = set(normalize_text(s).capitalize() for s in existing_diag.patient.symptoms.values_list('name', flat=True))
        if existing_symptoms == set(normalized_symptoms):
            diag = existing_diag
        else:
            disease, prob = predict_disease(normalized_symptoms)
            disease_fr = translate_to_french(disease)
            diag = Diagnostic.objects.create(patient=patient, disease=disease_fr, probability=prob)
    else:
        disease, prob = predict_disease(normalized_symptoms)
        disease_fr = translate_to_french(disease)
        diag = Diagnostic.objects.create(patient=patient, disease=disease_fr, probability=prob)

    # Scrap web
    snippets = []
    try:
        symptoms_fr = [translate_to_french(s) for s in normalized_symptoms]
        query = build_query(symptoms_fr, diag.disease)
        links = search_web_serpapi(query, num_results=3)

        if not links:
            snippets.append({
                'title': 'Aucun résultat trouvé',
                'url': '',
                'snippet': f'Impossible de récupérer un résultat pour la query "{query}"'
            })

        for title, url in links:
            try:
                snippet_text = fetch_snippet(url)
            except Exception as e:
                snippet_text = f"Impossible de récupérer l'extrait ({str(e)})"
            snippets.append({'title': title, 'url': url, 'snippet': snippet_text})

    except Exception as e:
        snippets.append({'title': 'Erreur', 'url': '', 'snippet': f'Impossible de récupérer les résultats ({str(e)})'})

    return Response({
        'diagnostic': DiagnosticSerializer(diag).data,
        'web_results': snippets
    })

# ---------------- Création patient ----------------
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def create_patient(request):
    if request.method == 'GET':
        patients = Patient.objects.all().order_by('full_name')
        serializer = PatientSerializer(patients, many=True)
        return Response(serializer.data)
    
    # Sinon POST pour création
    serializer = PatientSerializer(data=request.data)
    if serializer.is_valid():
        patient = serializer.save()
        return Response(PatientSerializer(patient).data, status=201)
    return Response(serializer.errors, status=400)

# ---------------- Historique patient ----------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_history(request, patient_id):
    try:
        patient = Patient.objects.get(id=patient_id)
        diagnostics = patient.diagnostics.all()
        response_data = []
        for diag in diagnostics:
            symptomes = [translate_to_french(s.name) for s in patient.symptoms.filter(created_at__lte=diag.date)]
            response_data.append({
                'id': diag.id,
                'patient': PatientSerializer(patient).data,
                'symptomes': symptomes,
                'disease': diag.disease,
                'probability': diag.probability,
                'date': diag.date,
            })
        return Response(response_data)
    except Patient.DoesNotExist:
        return Response({'error': 'Patient non trouvé.'}, status=404)

# ---------------- Liste diagnostics ----------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def diagnostics_list(request):
    diagnostics = Diagnostic.objects.all()
    response_data = []
    for diag in diagnostics:
        symptomes = [translate_to_french(s.name) for s in diag.patient.symptoms.filter(created_at__lte=diag.date)]
        response_data.append({
            'id': diag.id,
            'patient': PatientSerializer(diag.patient).data,
            'symptomes': symptomes,
            'disease': diag.disease,
            'probability': diag.probability,
            'date': diag.date,
        })
    return Response(response_data)

# ---------------- Statistiques diagnostics ----------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def diagnostic_stats(request):
    diagnostics = Diagnostic.objects.select_related('patient').all()
    stats_dict = {}

    for diag in diagnostics:
        key = (diag.disease, diag.patient.sex)
        age = None
        if diag.patient.date_of_birth:
            today = datetime.today()
            dob = diag.patient.date_of_birth
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

        if key not in stats_dict:
            stats_dict[key] = {
                'disease': diag.disease,
                'sex': diag.patient.sex,
                'count': 0,
                'sumSeverity': 0.0,
                'ages': []
            }
        stats_dict[key]['count'] += 1
        stats_dict[key]['sumSeverity'] += diag.probability
        if age is not None:
            stats_dict[key]['ages'].append(age)

    stats_list = []
    for stat in stats_dict.values():
        avg_age = round(sum(stat['ages']) / len(stat['ages'])) if stat['ages'] else None
        stats_list.append({
            'disease': stat['disease'],
            'sex': stat['sex'],
            'count': stat['count'],
            'averageSeverity': stat['sumSeverity'] / stat['count'] * 100,
            'age': avg_age
        })

    return Response(stats_list)

# ---------------- Export CSV patients ----------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_patients(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="patients_export.csv"'
    writer = csv.writer(response)
    writer.writerow(['ID', 'Nom', 'Date de naissance', 'Symptômes', 'Diagnostic', 'Probabilité', 'Date'])

    patients = Patient.objects.all()
    for patient in patients:
        symptoms = ', '.join([translate_to_french(s.name) for s in patient.symptoms.all()])
        for diag in patient.diagnostics.all():
            writer.writerow([
                patient.id,
                patient.full_name,
                patient.date_of_birth,
                symptoms,
                diag.disease,
                diag.probability,
                diag.date,
            ])
    return response
# patients/search
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_patients(request):
    name = request.GET.get('search')
    diagnostic_term = request.GET.get('diagnostic')
    date = request.GET.get('date')

    queryset = Patient.objects.all()

    # 🔹 Recherche par nom
    if name:
        queryset = queryset.filter(full_name__icontains=name.strip()).distinct()

    # 🔹 Recherche par diagnostic (précédents résultats)
    if diagnostic_term:
        term_normalized = normalize_text(diagnostic_term.strip()).capitalize()
        # On filtre les patients ayant au moins un diagnostic correspondant
        queryset = queryset.filter(diagnostics__disease__icontains=term_normalized).distinct()

    # 🔹 Recherche par date de diagnostic
    if date:
        try:
            date_obj = datetime.strptime(date, "%Y-%m-%d").date()
            queryset = queryset.filter(diagnostics__date__date=date_obj).distinct()
        except ValueError:
            return Response({'error': 'Format de date invalide (YYYY-MM-DD attendu).'}, status=400)

    serializer = PatientSerializer(queryset, many=True)
    return Response(serializer.data)
# ---------------- Scanner IA (images / vidéos) ----------------
from rest_framework.parsers import MultiPartParser, FormParser
from PIL import Image
import numpy as np
import random  # remplacer par ton modèle ML réel
from datetime import datetime

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Patient, Diagnostic
from .serializers import DiagnosticSerializer, SubmitSymptomsSerializer
from django.utils.dateparse import parse_date

class AIDiagnosisAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # nécessite token JWT

    def post(self, request, format=None):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'Aucun fichier fourni'}, status=status.HTTP_400_BAD_REQUEST)

        # Récupérer les infos patient
        patient_name = request.data.get('patientName')
        sex = request.data.get('sex', 'male')
        dob_str = request.data.get('date_of_birth')
        date_of_birth = parse_date(dob_str) if dob_str else None

        # Créer ou récupérer le patient
        patient, created = Patient.objects.get_or_create(
            full_name=patient_name or "Inconnu",
            defaults={'sex': sex, 'date_of_birth': date_of_birth or "2000-01-01"}
        )

        # 🔹 Ici tu appelles ton IA pour analyser le fichier
        # Exemple fictif :
        import random
        disease = "ExampleDisease"
        probability = round(random.uniform(70, 99), 2)

        # Créer le diagnostic
        diag = Diagnostic.objects.create(
            patient=patient,
            disease=disease,
            probability=probability
        )

        serializer = DiagnosticSerializer(diag)
        return Response({'result': serializer.data['disease'], 'probability': serializer.data['probability']})
