from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from reciclaje_api.views import (
    LoginView,
    RegisterView,
    DashboardView,
    AddBotellasView,
    RankingsView,
    HistoryView,
    WeeklyWinnersView,
    AdminAlumnosView,
    AdminAlumnoDetailView,
    AdminRegistrosView,
    AdminRegistroDetailView
)

urlpatterns = [
    # Autenticación
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Dashboard y Acciones
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('botellas/add/', AddBotellasView.as_view(), name='add_botellas'),
    
    # Rankings e Historiales
    path('rankings/', RankingsView.as_view(), name='rankings'),
    path('history/', HistoryView.as_view(), name='history'),
    path('winners/weekly/', WeeklyWinnersView.as_view(), name='winners_weekly'),

    # Panel de Administración
    path('admin/alumnos/', AdminAlumnosView.as_view(), name='admin_alumnos'),
    path('admin/alumnos/<int:pk>/', AdminAlumnoDetailView.as_view(), name='admin_alumno_detail'),
    path('admin/registros/', AdminRegistrosView.as_view(), name='admin_registros'),
    path('admin/registros/<int:pk>/', AdminRegistroDetailView.as_view(), name='admin_registro_detail'),
]

