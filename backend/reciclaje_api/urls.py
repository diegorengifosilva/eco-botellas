from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView,
    RegisterView,
    DashboardView,
    AddBotellasView,
    RankingsView,
    HistoryView,
    WeeklyWinnersView
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
]
