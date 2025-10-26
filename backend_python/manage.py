#!/usr/bin/env python
import os
import sys

def main():
    """Lance les commandes Django via l’interface en ligne de commande."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'diagnosis_api.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Impossible d’importer Django. Vérifie ton environnement virtuel."
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
