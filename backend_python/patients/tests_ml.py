# E:\DiagnosisProject-main\patients\tests_ml.py
import pytest
from .ml import predict_disease

@pytest.mark.parametrize("symptoms", [
    ["fièvre","toux"],
    ["maux de tête"]
])
def test_predict(symptoms):
    disease, prob = predict_disease(symptoms)
    assert isinstance(disease, str)
    assert 0.0 <= prob <= 1.0
