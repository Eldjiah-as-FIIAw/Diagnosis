import os, joblib
import pandas as pd

BASE = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE, 'model.joblib')

# Charge un tuple (model, x_train) pour récupérer feature_names
try:
    model, x_train = joblib.load(MODEL_PATH)
except:
    # ancien format : seul le model
    loaded = joblib.load(MODEL_PATH)
    model, x_train = loaded, None

def normalize_symptom(symptom: str) -> str:
    """Met en minuscules et supprime les espaces inutiles"""
    return symptom.strip().lower()

def predict_disease(symptoms_list):
    """
    Prédit la maladie et la probabilité :
    - symptoms_list : liste de strings
    """
    # Normalisation
    symptoms_list = [normalize_symptom(s) for s in symptoms_list]

    if x_train is None:
        # Si pas de x_train, on concatène les symptômes
        df = pd.DataFrame({"symptoms_text": [" ".join(symptoms_list)]})
    else:
        # Crée un DataFrame avec toutes les colonnes du modèle
        take_input = {f: (1 if f in symptoms_list else 0) for f in x_train.columns}
        df = pd.DataFrame([take_input])

    # Debug : vérifier l'entrée pour le modèle
    # print("Input ML DataFrame:\n", df)

    proba = model.predict_proba(df)[0]
    idx = proba.argmax()
    disease = model.classes_[idx]
    return disease, float(proba[idx])
