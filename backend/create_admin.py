import sys
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from reciclaje_api.models import Alumno

def make_admin(username, password="admin"):
    try:
        user = Alumno.objects.get(usuario=username)
        user.is_admin = True
        user.save()
        print(f"SUCCESS: Promoted existing user '{username}' to administrator.")
    except Alumno.DoesNotExist:
        # Create a new superuser
        user = Alumno.objects.create_superuser(
            usuario=username,
            nombre="Administrador",
            familia="Eco-Direccion",
            salon="5 anos",
            password=password
        )
        print(f"SUCCESS: Created new admin user '{username}' with password '{password}'.")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        username = sys.argv[1]
        password = sys.argv[2] if len(sys.argv) > 2 else "admin"
        make_admin(username, password=password)
    else:
        # Default admin
        make_admin("admin", password="admin")
