from rest_framework import serializers
from .models import Alumno, RegistroBotellas
from django.utils import timezone

class AlumnoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alumno
        fields = ['id', 'nombre', 'familia', 'salon', 'usuario', 'fecha_registro']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Alumno
        fields = ['nombre', 'familia', 'salon', 'usuario', 'password']

    def create(self, validated_data):
        alumno = Alumno.objects.create_user(
            usuario=validated_data['usuario'],
            nombre=validated_data['nombre'],
            familia=validated_data['familia'],
            salon=validated_data['salon'],
            password=validated_data['password']
        )
        return alumno

class RegistroBotellasSerializer(serializers.ModelSerializer):
    fecha_hora_formateada = serializers.SerializerMethodField()

    class Meta:
        model = RegistroBotellas
        fields = ['id', 'cantidad', 'fecha_hora', 'fecha_hora_formateada']

    def get_fecha_hora_formateada(self, obj):
        # Convert to local timezone (America/Lima) before formatting
        local_dt = timezone.localtime(obj.fecha_hora)
        return local_dt.strftime("%d/%m/%Y %I:%M %p")
