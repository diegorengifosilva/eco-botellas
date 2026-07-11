import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restaurar sesión desde localStorage al cargar la app
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (usuario, password) => {
    try {
      const response = await api.post('/auth/login/', { usuario, password });
      const { access, user: userProfile } = response.data;
      
      localStorage.setItem('token', access);
      localStorage.setItem('user', JSON.stringify(userProfile));
      setUser(userProfile);
      return { success: true };
    } catch (error) {
      console.error("Error de login:", error);
      const errMsg = error.response?.data?.detail || "Usuario o contraseña incorrectos";
      return { success: false, error: errMsg };
    }
  };

  const register = async (nombre, familia, salon, usuario, password) => {
    try {
      const response = await api.post('/auth/register/', {
        nombre,
        familia,
        salon,
        usuario,
        password
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Error de registro:", error);
      // Mapear los errores que devuelva Django REST
      let errMsg = "No se pudo registrar. Por favor, verifica los campos.";
      if (error.response?.data) {
        const errors = error.response.data;
        if (errors.usuario) {
          errMsg = "Este usuario ya existe. ¡Elige otro!";
        } else {
          // Obtener el primer error disponible
          const firstKey = Object.keys(errors)[0];
          const firstError = errors[firstKey];
          errMsg = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      }
      return { success: false, error: errMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
