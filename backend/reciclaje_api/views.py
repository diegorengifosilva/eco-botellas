import random
from datetime import datetime, timedelta
from django.db import models
from django.db.models import Sum
from django.db.models.functions import Coalesce
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Alumno, RegistroBotellas
from .serializers import AlumnoSerializer, RegisterSerializer, RegistroBotellasSerializer

# Frases ecológicas para el Header animado
ECO_FRASES = [
    "¡Cada botella que reciclas ayuda a salvar un árbol! 🌳",
    "¡Eres un súper héroe del planeta! 🌎⚡",
    "¡Los animales del mar te dan las gracias! 🐢🐳",
    "¡Pequeñas acciones generan grandes cambios! 🌱",
    "¡Sigue así, el planeta brilla más gracias a ti! ⭐",
    "¡Reciclar es darles una segunda vida a las cosas! ♻️",
    "¡Con cada botella, limpias un pedacito de nuestro hogar! 🏠💚",
    "¡El planeta Tierra está feliz con tu ayuda! 🌎❤️",
    "¡Menos botellas en la basura, más árboles en la selva! 🌴",
    "¡Tu esfuerzo hace que las flores crezcan felices! 🌸🌻",
    "¡Cuidar el agua y las plantas nos hace amigos de la naturaleza! 💦🌿",
    "¡Cada botella cuenta para hacer un mundo feliz! 🌟",
    "¡Reciclar es divertido y llena de colores la Tierra! 🎨🌎",
    "¡Un planeta limpio es el mejor lugar para jugar! 🧸🎈",
    "¡Eres el guardián de los bosques y ríos! 🦊🍃",
    "¡Juntos pintamos de verde nuestro futuro! 🖌️🌱",
    "¡Gracias por cuidar a los animalitos reciclando! 🦁🐼",
    "¡El reciclaje es magia que transforma botellas en sonrisas! 🪄✨"
]

def get_iso_week_range(year, week):
    """Retorna fecha de inicio (lunes) y fin (domingo) para un año y semana ISO."""
    first_day = datetime(year, 1, 4)
    first_monday = first_day - timedelta(days=first_day.isoweekday() - 1)
    lunes = first_monday + timedelta(weeks=week - 1)
    domingo = lunes + timedelta(days=6)
    return lunes.date(), domingo.date()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Personalizar el token JWT de login para incluir detalles del alumno."""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Campos personalizados en el token
        token['nombre'] = user.nombre
        token['usuario'] = user.usuario
        token['salon'] = user.salon
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = AlumnoSerializer(self.user).data
        return data

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            alumno = serializer.save()
            return Response({
                "message": "¡Registro exitoso! Ya puedes iniciar sesión.",
                "user": AlumnoSerializer(alumno).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # 1. Frase ecológica aleatoria
        frase = random.choice(ECO_FRASES)

        # 2. KPIs
        # - Mis botellas
        mis_botellas = RegistroBotellas.objects.filter(alumno=user).aggregate(total=Sum('cantidad'))['total'] or 0

        # - Todos los alumnos anotados con su total de botellas > 0 (para posiciones y tops)
        alumnos_ranking = Alumno.objects.annotate(
            total_botellas=Coalesce(Sum('registros_botellas__cantidad'), 0)
        ).filter(total_botellas__gt=0).order_by('-total_botellas', 'nombre')

        # - Mi posición (S/P si no ha reciclado nada)
        if mis_botellas == 0:
            mi_posicion = "S/P"
        else:
            count_better = Alumno.objects.annotate(
                total_botellas=Coalesce(Sum('registros_botellas__cantidad'), 0)
            ).filter(total_botellas__gt=mis_botellas).count()
            mi_posicion = count_better + 1

        # - Total General
        total_general = RegistroBotellas.objects.aggregate(total=Sum('cantidad'))['total'] or 0

        # - TOP 1 Niño
        top_kid = alumnos_ranking.first()
        top_kid_data = {
            "nombre": top_kid.nombre if top_kid else "Sin registros",
            "botellas": top_kid.total_botellas if top_kid else 0
        }

        # - TOP 1 Familia
        familias_ranking = Alumno.objects.values('familia').annotate(
            total_botellas=Coalesce(Sum('registros_botellas__cantidad'), 0)
        ).order_by('-total_botellas')
        top_family = familias_ranking.first()
        top_family_data = {
            "familia": top_family['familia'] if top_family else "Sin registros",
            "botellas": top_family['total_botellas'] if top_family else 0
        }

        # - TOP 1 Salón
        salones_ranking = Alumno.objects.values('salon').annotate(
            total_botellas=Coalesce(Sum('registros_botellas__cantidad'), 0)
        ).order_by('-total_botellas')
        top_salon = salones_ranking.first()
        
        def friendly_salon_name(val):
            if val == '3 anos': return '3 Años'
            if val == '4 anos': return '4 Años'
            if val == '5 anos': return '5 Años'
            return val or "Sin registros"

        top_salon_data = {
            "salon": friendly_salon_name(top_salon['salon']) if top_salon else "Sin registros",
            "botellas": top_salon['total_botellas'] if top_salon else 0
        }

        # 3. Lista "Héroes del Reciclaje" (Top 10 alumnos)
        top_heroes = []
        for i, alumno in enumerate(alumnos_ranking[:10]):
            top_heroes.append({
                "puesto": i + 1,
                "nombre": alumno.nombre,
                "familia": alumno.familia,
                "salon": friendly_salon_name(alumno.salon),
                "botellas": alumno.total_botellas
            })

        return Response({
            "alumno": AlumnoSerializer(user).data,
            "frase_eco": frase,
            "kpis": {
                "mis_botellas": mis_botellas,
                "mi_posicion": mi_posicion,
                "total_general": total_general,
                "top_1_nino": top_kid_data,
                "top_1_familia": top_family_data,
                "top_1_salon": top_salon_data
            },
            "heroes": top_heroes
        })

class AddBotellasView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        cantidad = request.data.get('cantidad')
        if not cantidad or int(cantidad) <= 0:
            return Response({"error": "La cantidad debe ser mayor a 0"}, status=status.HTTP_400_BAD_REQUEST)
        
        registro = RegistroBotellas.objects.create(
            alumno=request.user,
            cantidad=int(cantidad)
        )
        
        return Response({
            "message": f"¡Excelente! Has agregado {cantidad} botellas.",
            "registro": RegistroBotellasSerializer(registro).data
        }, status=status.HTTP_201_CREATED)

class RankingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        tipo = request.query_params.get('tipo', 'ninos') # ninos, familias, salones
        
        def friendly_salon_name(val):
            if val == '3 anos': return '3 Años'
            if val == '4 anos': return '4 Años'
            if val == '5 anos': return '5 Años'
            return val or ""

        if tipo == 'ninos':
            alumnos = Alumno.objects.annotate(
                total_botellas=Coalesce(Sum('registros_botellas__cantidad'), 0)
            ).filter(total_botellas__gt=0).order_by('-total_botellas', 'nombre')
            
            data = []
            for i, a in enumerate(alumnos):
                data.append({
                    "puesto": i + 1,
                    "nombre": a.nombre,
                    "familia": a.familia,
                    "salon": friendly_salon_name(a.salon),
                    "botellas": a.total_botellas
                })
            return Response(data)

        elif tipo == 'familias':
            familias = Alumno.objects.values('familia').annotate(
                total_botellas=Coalesce(Sum('registros_botellas__cantidad'), 0)
            ).filter(total_botellas__gt=0).order_by('-total_botellas')
            
            data = []
            for i, f in enumerate(familias):
                data.append({
                    "puesto": i + 1,
                    "familia": f['familia'],
                    "botellas": f['total_botellas']
                })
            return Response(data)

        elif tipo == 'salones':
            salones = Alumno.objects.values('salon').annotate(
                total_botellas=Coalesce(Sum('registros_botellas__cantidad'), 0)
            ).filter(total_botellas__gt=0).order_by('-total_botellas')
            
            data = []
            for i, s in enumerate(salones):
                data.append({
                    "puesto": i + 1,
                    "salon": friendly_salon_name(s['salon']),
                    "botellas": s['total_botellas']
                })
            return Response(data)

        return Response({"error": "Tipo de ranking no válido"}, status=status.HTTP_400_BAD_REQUEST)

class HistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        registros = RegistroBotellas.objects.filter(alumno=request.user)
        serializer = RegistroBotellasSerializer(registros, many=True)
        return Response(serializer.data)

class WeeklyWinnersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        registros = RegistroBotellas.objects.select_related('alumno').all()
        
        # Agrupar botellas por (año, semana) y alumno
        semanas = {}
        for r in registros:
            dt = r.fecha_hora
            year, week, _ = dt.isocalendar()
            key = (year, week)
            if key not in semanas:
                semanas[key] = {}
            
            alumno_id = r.alumno.id
            if alumno_id not in semanas[key]:
                semanas[key][alumno_id] = {
                    "alumno": r.alumno,
                    "botellas": 0
                }
            semanas[key][alumno_id]["botellas"] += r.cantidad
            
        winners = []
        for (year, week) in sorted(semanas.keys(), reverse=True):
            week_data = semanas[(year, week)]
            best_alumno_id = max(week_data, key=lambda k: week_data[k]["botellas"])
            winner_info = week_data[best_alumno_id]
            
            lunes, domingo = get_iso_week_range(year, week)
            
            def friendly_salon_name(val):
                if val == '3 anos': return '3 Años'
                if val == '4 anos': return '4 Años'
                if val == '5 anos': return '5 Años'
                return val or ""

            winners.append({
                "año": year,
                "semana_num": week,
                "rango_fechas": f"Semana del {lunes.strftime('%d/%m/%Y')} al {domingo.strftime('%d/%m/%Y')}",
                "nombre": winner_info["alumno"].nombre,
                "familia": winner_info["alumno"].familia,
                "salon": friendly_salon_name(winner_info["alumno"].salon),
                "botellas": winner_info["botellas"]
            })
            
        return Response(winners)
