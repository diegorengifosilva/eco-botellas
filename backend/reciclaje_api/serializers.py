from rest_framework import serializers
from .models import Alumno, RegistroBotellas
from django.utils import timezone

class AlumnoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alumno
        fields = ['id', 'nombre', 'familia', 'salon', 'usuario', 'fecha_registro', 'is_admin']

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

class AdminAlumnoSerializer(serializers.ModelSerializer):
    total_botellas = serializers.IntegerField(read_only=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Alumno
        fields = ['id', 'nombre', 'familia', 'salon', 'usuario', 'fecha_registro', 'is_admin', 'total_botellas', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        alumno = Alumno(**validated_data)
        if password:
            alumno.set_password(password)
        else:
            alumno.set_unusable_password()
        alumno.save()
        return alumno

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class AdminRegistroBotellasSerializer(serializers.ModelSerializer):
    alumno_nombre = serializers.ReadOnlyField(source='alumno.nombre')
    alumno_familia = serializers.ReadOnlyField(source='alumno.familia')
    alumno_salon = serializers.ReadOnlyField(source='alumno.salon')
    alumno_id = serializers.PrimaryKeyRelatedField(queryset=Alumno.objects.all(), source='alumno')
    fecha_hora_formateada = serializers.SerializerMethodField()

    class Meta:
        model = RegistroBotellas
        fields = ['id', 'alumno_id', 'alumno_nombre', 'alumno_familia', 'alumno_salon', 'cantidad', 'fecha_hora', 'fecha_hora_formateada']

    def get_fecha_hora_formateada(self, obj):
        local_dt = timezone.localtime(obj.fecha_hora)
        return local_dt.strftime("%d/%m/%Y %I:%M %p")

