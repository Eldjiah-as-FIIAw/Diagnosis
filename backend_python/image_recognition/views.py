from django.shortcuts import render

# image_recognition/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from PIL import Image
import numpy as np
from tensorflow.keras.models import load_model

# Charger le modèle au démarrage pour éviter de le recharger à chaque requête
from keras.layers import InputLayer
custom_objects = {'InputLayer': InputLayer}

model = load_model(
    'F:/Image Recognition/chapter3/diagnosis_test/diagnosis.keras',
    custom_objects=custom_objects
)

CLASS_NAMES = ['COVID19', 'LUNG_OPACITY', 'NORMAL', 'PNEUMONIA', 'TUBERCULOSIS']

@api_view(['POST'])
def ai_diagnosis(request):
    """
    Endpoint pour recevoir une image et retourner la prédiction + probabilités
    """
    if 'file' not in request.FILES:
        return Response({"error": "Aucun fichier fourni"}, status=400)
    
    file = request.FILES['file']

    try:
        # Charger et prétraiter l'image
        image = Image.open(file)
        image = image.convert('L')  # niveaux de gris
        image = image.resize((224, 224))
        image_array = np.array(image) / 255.0
        image_array = np.expand_dims(image_array, axis=-1)  # (224,224,1)
        image_array = np.expand_dims(image_array, axis=0)   # (1,224,224,1)
        
        # Prédiction
        predictions = model.predict(image_array)[0]
        predicted_idx = int(np.argmax(predictions))
        predicted_class = CLASS_NAMES[predicted_idx]
        confidence = float(predictions[predicted_idx])
        
        # Retourner toutes les probabilités
        probs = {CLASS_NAMES[i]: float(predictions[i]) for i in range(len(CLASS_NAMES))}
        
        return Response({
            "result": predicted_class,
            "probability": round(confidence*100, 2),
            "probabilities": probs
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)
