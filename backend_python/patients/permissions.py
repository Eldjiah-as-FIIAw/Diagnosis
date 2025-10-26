# E:\DiagnosisProject-main\patients\permissions.py
from rest_framework.permissions import BasePermission

class IsPractitioner(BasePermission):
    """
    Autorise uniquement les utilisateurs appartenant au groupe 'Médecins'.
    """
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.groups.filter(name="Médecins").exists()
        )
