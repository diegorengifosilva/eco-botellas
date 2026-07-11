from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class AlumnoManager(BaseUserManager):
    def create_user(self, usuario, nombre, familia, salon, password=None):
        if not usuario:
            raise ValueError('El usuario es obligatorio')
        user = self.model(
            usuario=usuario,
            nombre=nombre,
            familia=familia,
            salon=salon
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, usuario, nombre, familia, salon, password=None):
        user = self.create_user(usuario, nombre, familia, salon, password)
        user.is_admin = True
        user.save(using=self._db)
        return user

class Alumno(AbstractBaseUser):
    nombre = models.CharField(max_length=150)
    familia = models.CharField(max_length=150)
    
    SALON_CHOICES = [
        ('3 anos', '3 Años'),
        ('4 anos', '4 Años'),
        ('5 anos', '5 Años'),
    ]
    salon = models.CharField(max_length=50, choices=SALON_CHOICES)
    usuario = models.CharField(max_length=50, unique=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    objects = AlumnoManager()

    USERNAME_FIELD = 'usuario'
    REQUIRED_FIELDS = ['nombre', 'familia', 'salon']

    def __str__(self):
        return f"{self.nombre} - {self.salon}"

    @property
    def is_staff(self):
        return self.is_admin

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

class RegistroBotellas(models.Model):
    alumno = models.ForeignKey(Alumno, on_delete=models.CASCADE, related_name='registros_botellas')
    cantidad = models.IntegerField()
    fecha_hora = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Registros de Botellas"
        ordering = ['-fecha_hora']

    def __str__(self):
        return f"{self.alumno.nombre} - {self.cantidad} botellas - {self.fecha_hora.strftime('%d/%m/%Y %H:%M')}"
