import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { LogOut, Leaf, Trophy, Plus, Calendar, Award, User, Lock, Users, School, Globe, Minus, Recycle } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import confetti from 'canvas-confetti';
import api from './services/api';

// Modales
import EcoRankingModal from './components/EcoRankingModal';
import MiHistorialModal from './components/MiHistorialModal';
import GanadoresSemanalesModal from './components/GanadoresSemanalesModal';
import AdminPanel from './components/AdminPanel';

/* ==========================================
   COMPONENTE: HOJAS FLOTANTES DE FONDO
   ========================================== */
const LeafBackground = () => {
  const [bubbles, setBubbles] = useState([]);

  // Lista de emojis ecológicos y divertidos para los niños
  const EMOJIS = ['🌎', '🍃', '🍼', '🌱', '✨', '🎈', '⭐', '🧸', '🌸', '🍀', '🍎', '🌈'];

  // Eliminar burbuja del estado
  const removeBubble = (id) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  };

  // Reventar burbuja y lanzar explosión local de confeti
  const popBubble = (e, id) => {
    e.stopPropagation();

    // Obtener coordenadas de clic exactas para orientar la explosión de confeti
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    // Lanzar confeti en el lugar del clic
    confetti({
      particleCount: 15,
      spread: 45,
      origin: { x, y },
      colors: ['#4ade80', '#22c55e', '#3b82f6', '#facc15', '#ec4899', '#f43f5e', '#a855f7']
    });

    // Quitar la burbuja
    removeBubble(id);
  };

  // Iniciar conjunto de burbujas en pantalla e ir agregando nuevas progresivamente
  useEffect(() => {
    const getResponsiveBubbleSize = () => {
      const width = window.innerWidth;
      if (width < 600) {
        return Math.random() * 0.6 + 0.8; // 0.8rem a 1.4rem (Celular)
      } else if (width < 1024) {
        return Math.random() * 0.7 + 1.1; // 1.1rem a 1.8rem (Tablet)
      } else {
        return Math.random() * 1.0 + 1.4; // 1.4rem a 2.4rem (Desktop)
      }
    };

    const initialBubbles = [];
    // 6 burbujas iniciales ya flotando a media pantalla
    for (let i = 0; i < 6; i++) {
      initialBubbles.push({
        id: Math.random(),
        x: Math.random() * 85 + 5, // 5% a 90%
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        size: getResponsiveBubbleSize(),
        speed: Math.random() * 8 + 11, // 11s a 19s
        delay: `-${Math.random() * 10}s`, // retraso negativo para empezar iniciados en vertical
        driftX: Math.random() * 180 - 90 // deriva horizontal de -90px a +90px
      });
    }
    setBubbles(initialBubbles);

    // Intervalo de spawn cada 2.5 segundos
    const interval = setInterval(() => {
      setBubbles((prev) => {
        if (prev.length >= 12) return prev; // Límite de 12 burbujas activas
        return [
          ...prev,
          {
            id: Math.random(),
            x: Math.random() * 85 + 5,
            emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
            size: getResponsiveBubbleSize(),
            speed: Math.random() * 8 + 11,
            delay: '0s', // empiezan desde abajo de la pantalla
            driftX: Math.random() * 180 - 90
          }
        ];
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="bubble-wrapper"
          onAnimationEnd={() => removeBubble(b.id)}
          onClick={(e) => popBubble(e, b.id)}
          style={{
            left: `${b.x}%`,
            width: `${b.size * 1.5}rem`,
            height: `${b.size * 1.5}rem`,
            fontSize: `${b.size}rem`,
            animation: `drift ${b.speed}s linear infinite`,
            animationDelay: b.delay,
            pointerEvents: 'auto',
            '--drift-x': `${b.driftX}px`
          }}
        >
          {b.emoji}
        </div>
      ))}
    </div>
  );
};

/* ==========================================
   PANTALLA DE INICIO DE SESIÓN (LOGIN)
   ========================================== */
const Login = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/eco-botellas');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usuario || !password) {
      setError('Por favor, ingresa tu usuario y contraseña.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(usuario, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
    } else {
      navigate('/eco-botellas');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ position: 'relative', zIndex: 10 }}>
        <div className="auth-header">
          <div className="auth-logo-icon">🌎</div>
          <h2>Eco Botellas</h2>
          <p>Reciclaje Escolar</p>
        </div>

        <div className="auth-body">
          {error && (
            <div className="alert-box alert-danger">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Usuario</label>
              <div className="relative-input-container">
                <span className="input-icon">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="eco-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div className="relative-input-container">
                <span className="input-icon">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="eco-input"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-eco-primary"
              style={{ width: '100%', marginTop: '0.8rem', padding: '13px' }}
            >
              {loading ? 'Entrando...' : 'Iniciar Sesión 🚀'}
            </button>
          </form>

          <div className="auth-divider">
            ¿No tienes cuenta?
          </div>

          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button type="button" className="btn-eco-secondary" style={{ width: '100%', padding: '13px' }}>
              Registrarme 📝
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

/* ==========================================
   PANTALLA DE REGISTRO (REGISTER)
   ========================================== */
const Register = () => {
  const [nombre, setNombre] = useState('');
  const [familia, setFamilia] = useState('');
  const [salon, setSalon] = useState('3 anos');
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/eco-botellas');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !familia || !usuario || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    
    const result = await register(nombre, familia, salon, usuario, password);
    
    if (!result.success) {
      setLoading(false);
      setError(result.error);
    } else {
      setSuccess("¡Registro exitoso! Iniciando sesión automáticamente... 🚀");
      // Auto login inmediato
      const loginResult = await login(usuario, password);
      setLoading(false);
      if (loginResult.success) {
        navigate('/eco-botellas');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ position: 'relative', zIndex: 10 }}>
        <div className="auth-header">
          <div className="auth-logo-icon">♻️</div>
          <h2>Registro de Niño</h2>
          <p>Crear nueva cuenta</p>
        </div>

        <div className="auth-body">
          {error && (
            <div className="alert-box alert-danger">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="alert-box alert-success">
              🎉 {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nombre del Niño</label>
              <input
                type="text"
                placeholder="Ej. Diego"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="eco-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Familia</label>
              <input
                type="text"
                placeholder="Ej. González Pérez"
                value={familia}
                onChange={(e) => setFamilia(e.target.value)}
                className="eco-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Salón</label>
              <select
                value={salon}
                onChange={(e) => setSalon(e.target.value)}
                className="eco-input"
              >
                <option value="3 anos">3 Años</option>
                <option value="4 anos">4 Años</option>
                <option value="5 anos">5 Años</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Usuario</label>
              <input
                type="text"
                placeholder="Ej. diego123"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="eco-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                placeholder="Ingresa una contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="eco-input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-eco-primary"
              style={{ width: '100%', marginTop: '0.8rem', padding: '13px' }}
            >
              {loading ? 'Registrando...' : 'Registrarme 💚'}
            </button>
          </form>

          <div className="auth-divider">
            ¿Ya tienes cuenta?
          </div>

          <Link to="/" style={{ textDecoration: 'none' }}>
            <button type="button" className="btn-eco-secondary" style={{ width: '100%', padding: '13px' }}>
              Ya tengo cuenta 🔑
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

/* ==========================================
   PANTALLA PRINCIPAL (DASHBOARD)
   ========================================== */
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados del agregador directo de botellas
  const [cantidad, setCantidad] = useState(1);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Estados de Modales
  const [modalRankingOpen, setModalRankingOpen] = useState(false);
  const [modalRankingTitle, setModalRankingTitle] = useState('');
  const [modalRankingTipo, setModalRankingTipo] = useState('ninos');
  const [modalHistorialOpen, setModalHistorialOpen] = useState(false);
  const [modalGanadoresOpen, setModalGanadoresOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/');
      setData(response.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los datos del dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = () => setCantidad(prev => prev + 1);
  const handleDecrement = () => setCantidad(prev => (prev > 1 ? prev - 1 : 1));
  const handleQuickAdd = (value) => setCantidad(prev => prev + value);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (cantidad <= 0) return;

    setAddLoading(true);
    setAddError('');

    try {
      await api.post('/botellas/add/', { cantidad });
      
      // Lanzar confeti espectacular en pantalla
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#22c55e', '#4ade80', '#3b82f6', '#facc15', '#ec4899']
      });

      // Recargar datos para actualizar KPIs y ranking al instante
      await fetchDashboardData();
      setCantidad(1);

    } catch (err) {
      console.error(err);
      setAddError(err.response?.data?.error || 'No se pudo guardar.');
    } finally {
      setAddLoading(false);
    }
  };

  const getSalonFriendly = (val) => {
    if (val === '3 anos') return '3 Años';
    if (val === '4 anos') return '4 Años';
    if (val === '5 anos') return '5 Años';
    return val;
  };

  const getAvatarForName = (fullName) => {
    if (!fullName) return '👦';
    // Obtener el primer nombre en minúsculas y sin acentos
    const firstName = fullName.trim().split(' ')[0].toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Quita tildes

    // Listado de nombres masculinos comunes que terminan en 'a' o similares
    const exceptionsMale = [
      'luca', 'luka', 'bautista', 'josue', 'rene', 'misael', 'abdiel', 'ariel', 
      'alexis', 'angel', 'daniel', 'gabriel', 'manuel', 'miguel', 'samuel'
    ];

    // Listado de nombres femeninos comunes que no terminan en 'a'
    const exceptionsFemale = [
      'isabel', 'carmen', 'beatriz', 'ines', 'rocio', 'raquel', 'belen', 'abigail', 
      'rut', 'ruth', 'sol', 'pilar', 'luz', 'iris', 'anabel', 'miriam', 'ester', 'esther'
    ];

    // Si está en la lista explícita de mujeres
    if (exceptionsFemale.includes(firstName)) {
      return '👧';
    }

    // Si está en la lista explícita de hombres
    if (exceptionsMale.includes(firstName)) {
      return '👦';
    }

    // Regla general de terminación en español
    // La gran mayoría de nombres femeninos terminan en 'a'
    if (firstName.endsWith('a')) {
      return '👧';
    }

    // Por defecto, asumimos niño
    return '👦';
  };

  const openRanking = (title, tipo) => {
    setModalRankingTitle(title);
    setModalRankingTipo(tipo);
    setModalRankingOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <Globe className="text-green-600" size={48} style={{ animation: 'float 2s ease-in-out infinite' }} />
        <span className="loading-text">Cargando Eco-Mundo... 🌎</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-wrapper" style={{ padding: '1rem' }}>
        <div className="eco-card text-center" style={{ padding: '1.8rem', maxWidth: '380px', width: '100%' }}>
          <p style={{ color: '#ef4444', fontWeight: '800', fontSize: '1.05rem', margin: '0 0 1.2rem 0' }}>⚠️ {error}</p>
          <button onClick={fetchDashboardData} className="btn-eco-primary">Reintentar</button>
        </div>
      </div>
    );
  }

  const { alumno, frase_eco, kpis, heroes } = data;

  const renderMedal = (puesto) => {
    if (puesto === 1) return <span className="medal-container medal-oro"><Trophy size={14} /></span>;
    if (puesto === 2) return <span className="medal-container medal-plata"><Trophy size={14} /></span>;
    if (puesto === 3) return <span className="medal-container medal-bronce"><Trophy size={14} /></span>;
    return <span className="medal-container medal-none">{puesto}</span>;
  };

  return (
    <div className="eco-app-layout">
      {/* COLUMNA IZQUIERDA: PERFIL Y REGISTRO RÁPIDO */}
      <div className="eco-sidebar" style={{ position: 'relative', zIndex: 10 }}>
        {/* Tarjeta Perfil */}
        <div className="eco-card profile-card">
          <div className="profile-header-area">
            <div className="profile-avatar">
              {getAvatarForName(alumno.nombre)}
            </div>
            <div className="profile-details">
              <h3 style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '5px', margin: 0 }}>
                {alumno.nombre} 
                {alumno.is_admin && (
                  <span style={{ fontSize: '0.65rem', padding: '2px 6px', backgroundColor: '#fee2e2', color: '#ef4444', borderRadius: '9999px', border: '1px solid #fca5a5', fontWeight: 'bold' }}>
                    Admin 🛠️
                  </span>
                )}
              </h3>
              <p>👪 Familia: {alumno.familia}</p>
              <p>🏫 Salón: {getSalonFriendly(alumno.salon)}</p>
            </div>
          </div>
          
          {/* Globo de diálogo Mágico de la Mascota Ecológica */}
          <div className="mascot-bubble-area">
            <div className="mascot-avatar">🌳</div>
            <div className="mascot-bubble">
              {frase_eco}
            </div>
          </div>
        </div>

        {/* Agregador Directo de Botellas (Reduce clics y elimina el modal) */}
        <div className="eco-card direct-adder-card">
          <h3 style={{ margin: '0 0 0.8rem 0', fontSize: '1.1rem', color: '#15803d', fontWeight: 900, textAlign: 'center' }}>
            🌱 Reciclar Botellas
          </h3>
          <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Selector de cantidad */}
            <div className="counter-section">
              <button
                type="button"
                onClick={handleDecrement}
                className="counter-btn"
              >
                <Minus size={18} strokeWidth={3} />
              </button>

              <div className="counter-display">
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setCantidad(isNaN(val) ? 0 : Math.max(1, Math.min(val, 999)));
                  }}
                  className="counter-input"
                  min="1"
                  max="999"
                />
                <span className="counter-unit">
                  {cantidad === 1 ? 'Botella' : 'Botellas'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleIncrement}
                className="counter-btn"
              >
                <Plus size={18} strokeWidth={3} />
              </button>
            </div>

            {/* Selector rápido (Reduce clics) */}
            <div className="quick-add-container">
              <span className="quick-add-label">Sumado Rápido ⚡</span>
              <div className="quick-add-row">
                <button
                  type="button"
                  onClick={() => handleQuickAdd(1)}
                  className="quick-add-bubble quick-add-1"
                >
                  +1 🍼
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(5)}
                  className="quick-add-bubble quick-add-5"
                >
                  +5 🍼
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(10)}
                  className="quick-add-bubble quick-add-10"
                >
                  +10 🧪
                </button>
              </div>
            </div>

            {addError && (
              <div className="alert-box alert-danger" style={{ width: '100%' }}>
                ⚠️ {addError}
              </div>
            )}

            {/* Botón Guardar */}
            <button
              type="submit"
              disabled={addLoading}
              className="btn-eco-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              <Leaf size={16} />
              {addLoading ? 'Guardando...' : '¡Reciclar ahora! 🌎'}
            </button>
          </form>
        </div>
      </div>

      {/* COLUMNA DERECHA: METRICAS Y RANKING PRINCIPAL */}
      <div className="eco-main-content" style={{ position: 'relative', zIndex: 10 }}>
        {/* Rejilla Unificada de KPIs y Rankings */}
        <div className="kpis-grid">
          {/* KPI: Mis botellas */}
          <div className="compact-top-card top-card-green">
            <span className="compact-top-icon">♻️</span>
            <div className="compact-top-info">
              <span className="compact-top-label">Mis Botellas</span>
              <strong className="compact-top-name">{kpis.mis_botellas}</strong>
              <span className="compact-top-value">Acumuladas</span>
            </div>
          </div>

          {/* KPI: Mi posición */}
          <div className="compact-top-card top-card-orange">
            <span className="compact-top-icon">🏆</span>
            <div className="compact-top-info">
              <span className="compact-top-label">Mi Posición</span>
              <strong className="compact-top-name">
                {kpis.mi_posicion === 'S/P' ? 'S/P 🍃' : `#${kpis.mi_posicion}`}
              </strong>
              <span className="compact-top-value">
                {kpis.mi_posicion === 'S/P' ? '¡A reciclar!' : 'En el colegio'}
              </span>
            </div>
          </div>

          {/* KPI: Total general */}
          <div className="compact-top-card top-card-blue">
            <span className="compact-top-icon">🌎</span>
            <div className="compact-top-info">
              <span className="compact-top-label">Total Colegio</span>
              <strong className="compact-top-name">{kpis.total_general}</strong>
              <span className="compact-top-value">Botellas colectadas</span>
            </div>
          </div>

          {/* KPI: Top 1 niño */}
          <div className="compact-top-card top-card-gold">
            <span className="compact-top-icon">🥇</span>
            <div className="compact-top-info">
              <span className="compact-top-label">Niño Top</span>
              <strong className="compact-top-name">{kpis.top_1_nino.nombre}</strong>
              <span className="compact-top-value">{kpis.top_1_nino.botellas} botellas</span>
            </div>
          </div>

          {/* KPI: Top 1 familia */}
          <div className="compact-top-card top-card-purple">
            <span className="compact-top-icon">👪</span>
            <div className="compact-top-info">
              <span className="compact-top-label">Familia Top</span>
              <strong className="compact-top-name">Fam. {kpis.top_1_familia.familia}</strong>
              <span className="compact-top-value">{kpis.top_1_familia.botellas} botellas</span>
            </div>
          </div>

          {/* KPI: Top 1 salón */}
          <div className="compact-top-card top-card-cyan">
            <span className="compact-top-icon">🏫</span>
            <div className="compact-top-info">
              <span className="compact-top-label">Salón Top</span>
              <strong className="compact-top-name">{kpis.top_1_salon.salon}</strong>
              <span className="compact-top-value">{kpis.top_1_salon.botellas} botellas</span>
            </div>
          </div>
        </div>

        {/* Tabla principal "Héroes del Reciclaje" */}
        <div className="heroes-card">
          <div className="heroes-card-header">
            <h2>🏆 HÉROES DEL RECICLAJE</h2>
          </div>
          <div className="table-scrollable-container">
            {heroes.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0', fontWeight: 'bold' }}>
                ¡Aún no hay alumnos con botellas registradas! 🌱
              </p>
            ) : (
              <table className="eco-table">
                <thead>
                  <tr>
                    <th>Puesto</th>
                    <th>Nombre</th>
                    <th>Familia</th>
                    <th>Aula</th>
                    <th>Botellas</th>
                  </tr>
                </thead>
                <tbody>
                  {heroes.map((hero) => (
                    <tr key={hero.puesto}>
                      <td data-label="Puesto">{renderMedal(hero.puesto)}</td>
                      <td data-label="Nombre" style={{ fontWeight: '850', color: '#334155' }}>{hero.nombre}</td>
                      <td data-label="Familia" style={{ fontWeight: '700', color: '#475569' }}>{hero.familia}</td>
                      <td data-label="Aula">
                        <span style={{
                          padding: '4px 10px',
                          backgroundColor: '#f0fdf4',
                          color: '#15803d',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          borderRadius: '9999px',
                          border: '1px solid #bbf7d0'
                        }}>
                          {hero.salon}
                        </span>
                      </td>
                      <td data-label="Botellas" className="text-right" style={{ fontWeight: '900', color: '#16a34a', fontSize: '1.05rem' }}>
                        {hero.botellas} 🍼
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Dock de Acciones inferior (Diseño Premium Original) */}
        <div className="actions-dock">
          <button onClick={() => openRanking('🏆 Eco-Ranking Niños', 'ninos')} className="dock-btn dock-btn-ninos">
            <div className="dock-btn-icon"><Trophy size={18} /></div>
            <span className="dock-btn-label">Ranking Niños</span>
          </button>

          <button onClick={() => openRanking('🏆 Eco-Ranking Familias', 'familias')} className="dock-btn dock-btn-familias">
            <div className="dock-btn-icon"><Trophy size={18} /></div>
            <span className="dock-btn-label">Ranking Familias</span>
          </button>

          <button onClick={() => openRanking('🏆 Eco-Ranking Salones', 'salones')} className="dock-btn dock-btn-salones">
            <div className="dock-btn-icon"><Trophy size={18} /></div>
            <span className="dock-btn-label">Ranking Salones</span>
          </button>

          <button onClick={() => setModalGanadoresOpen(true)} className="dock-btn dock-btn-ganadores">
            <div className="dock-btn-icon"><Award size={18} /></div>
            <span className="dock-btn-label">Ganadores</span>
          </button>

          <button onClick={() => setModalHistorialOpen(true)} className="dock-btn dock-btn-historial">
            <div className="dock-btn-icon"><Calendar size={18} /></div>
            <span className="dock-btn-label">Mi Historial</span>
          </button>

          {alumno.is_admin && (
            <button onClick={() => navigate('/admin-panel')} className="dock-btn" style={{ border: '2px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)', cursor: 'pointer' }}>
              <div className="dock-btn-icon" style={{ color: '#ef4444' }}><Users size={18} /></div>
              <span className="dock-btn-label" style={{ color: '#ef4444', fontWeight: 'bold' }}>Panel Admin</span>
            </button>
          )}

          <button onClick={handleLogout} className="dock-btn dock-btn-salir">
            <div className="dock-btn-icon"><LogOut size={18} /></div>
            <span className="dock-btn-label">Salir</span>
          </button>
        </div>
      </div>

      {/* MODALES DETALLADOS */}
      <EcoRankingModal
        isOpen={modalRankingOpen}
        onClose={() => setModalRankingOpen(false)}
        title={modalRankingTitle}
        tipo={modalRankingTipo}
      />

      <MiHistorialModal
        isOpen={modalHistorialOpen}
        onClose={() => setModalHistorialOpen(false)}
      />

      <GanadoresSemanalesModal
        isOpen={modalGanadoresOpen}
        onClose={() => setModalGanadoresOpen(false)}
      />
    </div>
  );
};

/* ==========================================
   RUTA PROTEGIDA
   ========================================== */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-wrapper">
        <Globe className="text-green-600" size={48} style={{ animation: 'float 2s ease-in-out infinite' }} />
        <span className="loading-text">Cargando...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/* ==========================================
   RUTA ADMINISTRADOR PROTEGIDA
   ========================================== */
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || !user.is_admin) {
    return <Navigate to="/eco-botellas" replace />;
  }
  return children;
};

/* ==========================================
   APLICACIÓN PRINCIPAL
   ========================================== */
function App() {
  return (
    <AuthProvider>
      <Router>
        <LeafBackground />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/eco-botellas"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-panel"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
