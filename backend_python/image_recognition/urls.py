# image_recognition/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('ai-diagnosis/', views.ai_diagnosis, name='ai_diagnosis'),
]
