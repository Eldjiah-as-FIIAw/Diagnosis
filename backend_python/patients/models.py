from django.db import models
from datetime import date

class Patient(models.Model):
    full_name = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    sex = models.CharField(
        max_length=6, 
        choices=[('male', 'male'), ('female', 'female')], 
        default='male'
    )

    def __str__(self):
        return self.full_name

    @property
    def age(self) -> int:
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )

class Symptom(models.Model):
    patient = models.ForeignKey(Patient, related_name='symptoms', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.patient})"

class Diagnostic(models.Model):
    patient = models.ForeignKey(Patient, related_name='diagnostics', on_delete=models.CASCADE)
    disease = models.CharField(max_length=255)
    probability = models.FloatField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.disease} ({self.patient})"
