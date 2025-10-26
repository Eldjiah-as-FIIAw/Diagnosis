# E:\DiagnosisProject-main\patients\tests_api.py
import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User

@pytest.fixture
def api_client(db):
    user = User.objects.create_user('m','m')
    client = APIClient()
    token = client.post('/api/token/',{'username':'m','password':'m'}).data['access']
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    return client

def test_submit_symptoms(api_client):
    res = api_client.post('/api/symptoms/',{'symptoms':['fièvre']},format='json')
    assert res.status_code == 200
    assert 'diagnostic' in res.data
    assert 'web_results' in res.data