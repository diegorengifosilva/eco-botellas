import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, Trash2, Edit3, Search, PlusCircle, ArrowLeft, 
  RefreshCw, Plus, Minus, Key, Award, Calendar, Trophy 
} from 'lucide-react';
import api from '../services/api';

const AdminPanel = () => {
  const navigate = useNavigate();

  // Estados de datos generales
  const [alumnos, setAlumnos] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pestaña activa: 'alumnos' o 'registros'
  const [activeTab, setActiveTab] = useState('alumnos');

  // Filtros de búsqueda
  const [searchAlumno, setSearchAlumno] = useState('');
  const [searchRegistro, setSearchRegistro] = useState('');

  // Modales
  const [alumnoModalOpen, setAlumnoModalOpen] = useState(false);
  const [selectedAlumno, setSelectedAlumno] = useState(null); // null para crear, objeto para editar

  const [registroModalOpen, setRegistroModalOpen] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState(null); // null para crear, objeto para editar

  // Campos de formulario Alumno
  const [alumnoNombre, setAlumnoNombre] = useState('');
  const [alumnoFamilia, setAlumnoFamilia] = useState('');
  const [alumnoSalon, setAlumnoSalon] = useState('3 anos');
  const [alumnoUsuario, setAlumnoUsuario] = useState('');
  const [alumnoPassword, setAlumnoPassword] = useState('');
  const [alumnoIsAdmin, setAlumnoIsAdmin] = useState(false);
  const [alumnoFormError, setAlumnoFormError] = useState('');

  // Campos de formulario Registro
  const [regAlumnoId, setRegAlumnoId] = useState('');
  const [regCantidad, setRegCantidad] = useState(1);
  const [regFormError, setRegFormError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [resAlumnos, resRegistros] = await Promise.all([
        api.get('/admin/alumnos/'),
        api.get('/admin/registros/')
      ]);
      setAlumnos(resAlumnos.data);
      setRegistros(resRegistros.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar datos de administración. Verifica que tu sesión siga activa.');
    } finally {
      setLoading(false);
    }
  };

  // --- CONTROL ALUMNOS ---
  const handleOpenAlumnoModal = (alumno = null) => {
    setAlumnoFormError('');
    if (alumno) {
      setSelectedAlumno(alumno);
      setAlumnoNombre(alumno.nombre);
      setAlumnoFamilia(alumno.familia);
      setAlumnoSalon(alumno.salon);
      setAlumnoUsuario(alumno.usuario);
      setAlumnoPassword(''); // Vacío para no cambiarla a menos que se escriba
      setAlumnoIsAdmin(alumno.is_admin);
    } else {
      setSelectedAlumno(null);
      setAlumnoNombre('');
      setAlumnoFamilia('');
      setAlumnoSalon('3 anos');
      setAlumnoUsuario('');
      setAlumnoPassword('');
      setAlumnoIsAdmin(false);
    }
    setAlumnoModalOpen(true);
  };

  const handleSaveAlumno = async (e) => {
    e.preventDefault();
    setAlumnoFormError('');
    if (!alumnoNombre || !alumnoFamilia || !alumnoUsuario) {
      setAlumnoFormError('Por favor completa todos los campos obligatorios.');
      return;
    }
    if (!selectedAlumno && !alumnoPassword) {
      setAlumnoFormError('La contraseña es obligatoria para nuevos alumnos.');
      return;
    }

    const payload = {
      nombre: alumnoNombre,
      familia: alumnoFamilia,
      salon: alumnoSalon,
      usuario: alumnoUsuario,
      is_admin: alumnoIsAdmin
    };
    if (alumnoPassword) {
      payload.password = alumnoPassword;
    }

    try {
      if (selectedAlumno) {
        // Editar
        await api.put(`/admin/alumnos/${selectedAlumno.id}/`, payload);
        showTemporarySuccess('Datos del alumno actualizados correctamente.');
      } else {
        // Crear
        await api.post('/admin/alumnos/', payload);
        showTemporarySuccess('¡Alumno registrado con éxito!');
      }
      setAlumnoModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setAlumnoFormError(err.response?.data?.usuario?.[0] || 'Error al guardar los datos del alumno. El usuario podría estar duplicado.');
    }
  };

  const handleDeleteAlumno = async (id, nombre) => {
    const confirmDelete = window.confirm(
      `⚠️ ¡CUIDADO SUPERADMIN! ⚠️\n\n¿Estás seguro de eliminar al alumno "${nombre}"?\n\nAl hacerlo, TODOS sus registros de botellas asociados se eliminarán automáticamente de la base de datos (eliminación en cascada). Esta acción no se puede deshacer.`
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/admin/alumnos/${id}/`);
      showTemporarySuccess(`El alumno "${nombre}" y todos sus registros de botellas asociados fueron eliminados.`);
      fetchData();
    } catch (err) {
      console.error(err);
      setError('No se pudo eliminar al alumno.');
    }
  };

  // --- CONTROL REGISTROS ---
  const handleOpenRegistroModal = (registro = null) => {
    setRegFormError('');
    if (registro) {
      setSelectedRegistro(registro);
      setRegAlumnoId(registro.alumno_id);
      setRegCantidad(registro.cantidad);
    } else {
      setSelectedRegistro(null);
      // Seleccionar el primer alumno de la lista por defecto si existe
      setRegAlumnoId(alumnos.length > 0 ? alumnos[0].id : '');
      setRegCantidad(1);
    }
    setRegistroModalOpen(true);
  };

  const handleSaveRegistro = async (e) => {
    e.preventDefault();
    setRegFormError('');
    if (!regAlumnoId || regCantidad <= 0) {
      setRegFormError('Por favor selecciona un alumno y una cantidad mayor a 0.');
      return;
    }

    const payload = {
      alumno_id: parseInt(regAlumnoId),
      cantidad: parseInt(regCantidad)
    };

    try {
      if (selectedRegistro) {
        // Editar
        await api.put(`/admin/registros/${selectedRegistro.id}/`, { cantidad: payload.cantidad });
        showTemporarySuccess('Registro de botellas actualizado con éxito.');
      } else {
        // Crear
        await api.post('/admin/registros/', payload);
        showTemporarySuccess('Registro de botellas agregado con éxito.');
      }
      setRegistroModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setRegFormError('No se pudo guardar el registro de botellas.');
    }
  };

  const handleDeleteRegistro = async (id, nombre, cantidad) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar el registro de ${cantidad} botellas del alumno "${nombre}"?`
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/admin/registros/${id}/`);
      showTemporarySuccess(`Registro de ${cantidad} botellas eliminado con éxito.`);
      fetchData();
    } catch (err) {
      console.error(err);
      setError('No se pudo eliminar el registro de botellas.');
    }
  };

  const showTemporarySuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  // --- FILTROS DE CLIENTE ---
  const filteredAlumnos = alumnos.filter(a => 
    a.nombre.toLowerCase().includes(searchAlumno.toLowerCase()) ||
    a.familia.toLowerCase().includes(searchAlumno.toLowerCase()) ||
    a.usuario.toLowerCase().includes(searchAlumno.toLowerCase())
  );

  const filteredRegistros = registros.filter(r => 
    r.alumno_nombre.toLowerCase().includes(searchRegistro.toLowerCase()) ||
    r.alumno_familia.toLowerCase().includes(searchRegistro.toLowerCase()) ||
    r.alumno_salon.toLowerCase().includes(searchRegistro.toLowerCase())
  );

  // --- CALCULAR KPIs ADMIN ---
  const totalAlumnos = alumnos.length;
  const totalEntregas = registros.length;
  const totalBotellas = registros.reduce((sum, r) => sum + r.cantidad, 0);

  // Salón top
  const salonesCount = registros.reduce((acc, r) => {
    const s = r.alumno_salon;
    acc[s] = (acc[s] || 0) + r.cantidad;
    return acc;
  }, {});
  let topSalon = 'Sin registros';
  let maxBotellas = 0;
  Object.keys(salonesCount).forEach(s => {
    if (salonesCount[s] > maxBotellas) {
      maxBotellas = salonesCount[s];
      topSalon = s;
    }
  });

  const getSalonFriendly = (val) => {
    if (val === '3 anos') return '3 Años';
    if (val === '4 anos') return '4 Años';
    if (val === '5 anos') return '5 Años';
    return val || 'N/A';
  };

  const getAvatarForName = (fullName) => {
    if (!fullName) return '👦';
    const firstName = fullName.trim().split(' ')[0].toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const exceptionsFemale = [
      'isabel', 'carmen', 'beatriz', 'ines', 'rocio', 'raquel', 'belen', 'abigail', 
      'rut', 'ruth', 'sol', 'pilar', 'luz', 'iris', 'anabel', 'miriam', 'ester', 'esther'
    ];
    if (exceptionsFemale.includes(firstName)) return '👧';
    if (firstName.endsWith('a')) return '👧';
    return '👦';
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <RefreshCw className="text-green-600 animate-spin" size={48} />
        <span className="loading-text">Cargando Panel Superadmin... 🛠️</span>
      </div>
    );
  }

  return (
    <div className="eco-app-layout" style={{ display: 'block', maxWidth: '1200px', margin: '0 auto', height: '100vh', overflowY: 'auto', paddingBottom: '3rem' }}>
      
      {/* HEADER DE ADMINISTRACIÓN */}
      <div className="eco-card" style={{ padding: '1.2rem', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ fontSize: '2rem' }}>🛠️</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#15803d', fontWeight: 900 }}>Panel de Control Superadmin</h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Gestión total de alumnos y registros de reciclaje</p>
          </div>
        </div>
        <Link to="/eco-botellas" style={{ textDecoration: 'none' }}>
          <button className="btn-eco-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}>
            <ArrowLeft size={16} />
            Volver al Dashboard
          </button>
        </Link>
      </div>

      {/* METRICAS TOTALES (KPIs ADMIN) */}
      <div className="kpis-grid" style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="compact-top-card top-card-green" style={{ minHeight: 'auto', padding: '15px' }}>
          <span className="compact-top-icon"><Users size={22} /></span>
          <div className="compact-top-info">
            <span className="compact-top-label">Alumnos Totales</span>
            <strong className="compact-top-name">{totalAlumnos}</strong>
            <span className="compact-top-value">Niños inscritos</span>
          </div>
        </div>

        <div className="compact-top-card top-card-orange" style={{ minHeight: 'auto', padding: '15px' }}>
          <span className="compact-top-icon"><Calendar size={22} /></span>
          <div className="compact-top-info">
            <span className="compact-top-label">Entregas Totales</span>
            <strong className="compact-top-name">{totalEntregas}</strong>
            <span className="compact-top-value">Registros en historial</span>
          </div>
        </div>

        <div className="compact-top-card top-card-blue" style={{ minHeight: 'auto', padding: '15px' }}>
          <span className="compact-top-icon">🍼</span>
          <div className="compact-top-info">
            <span className="compact-top-label">Botellas Totales</span>
            <strong className="compact-top-name">{totalBotellas}</strong>
            <span className="compact-top-value">Recicladas en total</span>
          </div>
        </div>

        <div className="compact-top-card top-card-gold" style={{ minHeight: 'auto', padding: '15px' }}>
          <span className="compact-top-icon"><Trophy size={22} /></span>
          <div className="compact-top-info">
            <span className="compact-top-label">Salón Líder</span>
            <strong className="compact-top-name">{getSalonFriendly(topSalon)}</strong>
            <span className="compact-top-value">{maxBotellas} botellas</span>
          </div>
        </div>
      </div>

      {/* MENSAJES DE ALERTA */}
      {error && (
        <div className="alert-box alert-danger" style={{ marginBottom: '1.2rem' }}>
          ⚠️ {error}
        </div>
      )}
      {successMsg && (
        <div className="alert-box alert-success" style={{ marginBottom: '1.2rem' }}>
          🎉 {successMsg}
        </div>
      )}

      {/* TABS DE SELECCIÓN */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
        <button 
          onClick={() => setActiveTab('alumnos')} 
          className={activeTab === 'alumnos' ? 'btn-eco-primary' : 'btn-eco-secondary'}
          style={{ flex: 1, padding: '10px', fontSize: '0.95rem' }}
        >
          👦 Alumnos ({totalAlumnos})
        </button>
        <button 
          onClick={() => setActiveTab('registros')} 
          className={activeTab === 'registros' ? 'btn-eco-primary' : 'btn-eco-secondary'}
          style={{ flex: 1, padding: '10px', fontSize: '0.95rem' }}
        >
          🍼 Registros de Botellas ({totalEntregas})
        </button>
      </div>

      {/* CONTENIDO TAB: ALUMNOS */}
      {activeTab === 'alumnos' && (
        <div className="eco-card" style={{ padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
            <div className="relative-input-container" style={{ flex: 1, minWidth: '250px' }}>
              <span className="input-icon"><Search size={16} /></span>
              <input 
                type="text" 
                placeholder="Buscar por nombre, familia o usuario..." 
                value={searchAlumno}
                onChange={(e) => setSearchAlumno(e.target.value)}
                className="eco-input"
                style={{ paddingLeft: '38px', margin: 0 }}
              />
            </div>
            <button 
              onClick={() => handleOpenAlumnoModal(null)} 
              className="btn-eco-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontSize: '0.9rem' }}
            >
              <PlusCircle size={18} />
              Agregar Nuevo Alumno
            </button>
          </div>

          <div className="table-scrollable-container">
            {filteredAlumnos.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', fontWeight: 'bold', padding: '2rem' }}>No se encontraron alumnos. 🍃</p>
            ) : (
              <table className="eco-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Nombre</th>
                    <th>Familia</th>
                    <th>Aula</th>
                    <th>Botellas</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlumnos.map((alumno) => (
                    <tr key={alumno.id}>
                      <td data-label="Usuario" style={{ fontWeight: '800', color: '#1e293b' }}>
                        @{alumno.usuario}
                      </td>
                      <td data-label="Nombre" style={{ fontWeight: '850', color: '#334155' }}>
                        <span style={{ marginRight: '6px' }}>{getAvatarForName(alumno.nombre)}</span>
                        {alumno.nombre}
                      </td>
                      <td data-label="Familia" style={{ fontWeight: '750' }}>{alumno.familia}</td>
                      <td data-label="Aula">
                        <span style={{
                          padding: '3px 8px',
                          backgroundColor: '#f0fdf4',
                          color: '#15803d',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          borderRadius: '9999px',
                          border: '1px solid #bbf7d0'
                        }}>
                          {getSalonFriendly(alumno.salon)}
                        </span>
                      </td>
                      <td data-label="Botellas" style={{ fontWeight: '900', color: '#16a34a' }}>
                        {alumno.total_botellas} 🍼
                      </td>
                      <td data-label="Rol">
                        {alumno.is_admin ? (
                          <span style={{ padding: '3px 8px', backgroundColor: '#fee2e2', color: '#ef4444', fontSize: '0.72rem', fontWeight: '800', borderRadius: '9999px', border: '1px solid #fca5a5' }}>
                            Admin 🛠️
                          </span>
                        ) : (
                          <span style={{ padding: '3px 8px', backgroundColor: '#e0f2fe', color: '#0284c7', fontSize: '0.72rem', fontWeight: '800', borderRadius: '9999px', border: '1px solid #7dd3fc' }}>
                            Alumno
                          </span>
                        )}
                      </td>
                      <td data-label="Acciones" className="actions-cell">
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => handleOpenAlumnoModal(alumno)} 
                            className="btn-admin-action-edit"
                            title="Editar Alumno"
                          >
                            <Edit3 size={14} />
                            <span>Editar</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteAlumno(alumno.id, alumno.nombre)} 
                            className="btn-admin-action-delete"
                            title="Eliminar Alumno"
                          >
                            <Trash2 size={14} />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* CONTENIDO TAB: REGISTROS */}
      {activeTab === 'registros' && (
        <div className="eco-card" style={{ padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
            <div className="relative-input-container" style={{ flex: 1, minWidth: '250px' }}>
              <span className="input-icon"><Search size={16} /></span>
              <input 
                type="text" 
                placeholder="Buscar por nombre, familia o aula..." 
                value={searchRegistro}
                onChange={(e) => setSearchRegistro(e.target.value)}
                className="eco-input"
                style={{ paddingLeft: '38px', margin: 0 }}
              />
            </div>
            <button 
              onClick={() => handleOpenRegistroModal(null)} 
              className="btn-eco-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontSize: '0.9rem' }}
            >
              <PlusCircle size={18} />
              Agregar Registro Manual
            </button>
          </div>

          <div className="table-scrollable-container">
            {filteredRegistros.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', fontWeight: 'bold', padding: '2rem' }}>No se encontraron registros. 🌱</p>
            ) : (
              <table className="eco-table">
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th>Aula</th>
                    <th>Cantidad</th>
                    <th>Fecha y Hora</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistros.map((registro) => (
                    <tr key={registro.id}>
                      <td data-label="Alumno" style={{ fontWeight: '850', color: '#334155' }}>
                        {registro.alumno_nombre} 
                        <span style={{ fontWeight: '600', color: '#64748b', fontSize: '0.85rem', block: 'block' }}>
                          {" "}(Fam. {registro.alumno_familia})
                        </span>
                      </td>
                      <td data-label="Aula">
                        <span style={{
                          padding: '3px 8px',
                          backgroundColor: '#f0fdf4',
                          color: '#15803d',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          borderRadius: '9999px',
                          border: '1px solid #bbf7d0'
                        }}>
                          {getSalonFriendly(registro.alumno_salon)}
                        </span>
                      </td>
                      <td data-label="Cantidad" style={{ fontWeight: '900', color: '#16a34a', fontSize: '1.05rem' }}>
                        +{registro.cantidad} 🍼
                      </td>
                      <td data-label="Fecha y Hora" style={{ fontWeight: '600', color: '#475569' }}>
                        {registro.fecha_hora_formateada}
                      </td>
                      <td data-label="Acciones" className="actions-cell">
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => handleOpenRegistroModal(registro)} 
                            className="btn-admin-action-edit"
                            title="Editar cantidad"
                          >
                            <Edit3 size={14} />
                            <span>Editar</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteRegistro(registro.id, registro.alumno_nombre, registro.cantidad)} 
                            className="btn-admin-action-delete"
                            title="Eliminar Registro"
                          >
                            <Trash2 size={14} />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
         MODAL: CREAR / EDITAR ALUMNO
         ========================================== */}
      {alumnoModalOpen && (
        <div className="eco-modal-overlay" onClick={(e) => e.target.classList.contains('eco-modal-overlay') && setAlumnoModalOpen(false)}>
          <form 
            onSubmit={handleSaveAlumno} 
            className="eco-modal-content" 
            style={{ width: '100%', maxWidth: '500px' }}
          >
            <div className="eco-modal-header">
              <h2 className="eco-modal-title">
                {selectedAlumno ? '✏️ Editar Datos de Alumno' : '📝 Agregar Nuevo Alumno'}
              </h2>
              <button type="button" onClick={() => setAlumnoModalOpen(false)} className="eco-modal-close-btn">&times;</button>
            </div>
            <div className="eco-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {alumnoFormError && (
                <div className="alert-box alert-danger">
                  ⚠️ {alumnoFormError}
                </div>
              )}

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Nombre del Alumno *</label>
                <input 
                  type="text" 
                  value={alumnoNombre}
                  onChange={(e) => setAlumnoNombre(e.target.value)}
                  placeholder="Ej. Dieguito"
                  className="eco-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Familia *</label>
                <input 
                  type="text" 
                  value={alumnoFamilia}
                  onChange={(e) => setAlumnoFamilia(e.target.value)}
                  placeholder="Ej. Rengifo Silva"
                  className="eco-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Salón / Aula *</label>
                <select 
                  value={alumnoSalon} 
                  onChange={(e) => setAlumnoSalon(e.target.value)} 
                  className="eco-input"
                >
                  <option value="3 anos">3 Años</option>
                  <option value="4 anos">4 Años</option>
                  <option value="5 anos">5 Años</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Usuario de Ingreso *</label>
                <input 
                  type="text" 
                  value={alumnoUsuario}
                  onChange={(e) => setAlumnoUsuario(e.target.value)}
                  placeholder="Ej. dieguito10"
                  className="eco-input"
                  required
                  disabled={!!selectedAlumno} // No permitir cambiar usuario a los creados para evitar problemas
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>
                  {selectedAlumno ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
                </label>
                <div className="relative-input-container">
                  <span className="input-icon"><Key size={16} /></span>
                  <input 
                    type="password" 
                    value={alumnoPassword}
                    onChange={(e) => setAlumnoPassword(e.target.value)}
                    placeholder={selectedAlumno ? 'Ingresa una nueva contraseña' : 'Ej. clave123'}
                    className="eco-input"
                    style={{ paddingLeft: '38px' }}
                    required={!selectedAlumno}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                <input 
                  type="checkbox" 
                  id="isAdminCheck"
                  checked={alumnoIsAdmin}
                  onChange={(e) => setAlumnoIsAdmin(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="isAdminCheck" style={{ fontWeight: '800', color: '#ef4444', cursor: 'pointer' }}>
                  ¿Hacer Administrador (Superadmin)? 🛠️
                </label>
              </div>

            </div>
            <div className="eco-modal-header" style={{ borderTop: '1px solid #e2e8f0', borderBottom: 'none', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
              <button type="button" onClick={() => setAlumnoModalOpen(false)} className="btn-eco-secondary" style={{ padding: '8px 16px' }}>
                Cancelar
              </button>
              <button type="submit" className="btn-eco-primary" style={{ padding: '8px 20px' }}>
                {selectedAlumno ? 'Actualizar Alumno' : 'Registrar Alumno'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==========================================
         MODAL: CREAR / EDITAR REGISTRO BOTELLAS
         ========================================== */}
      {registroModalOpen && (
        <div className="eco-modal-overlay" onClick={(e) => e.target.classList.contains('eco-modal-overlay') && setRegistroModalOpen(false)}>
          <form 
            onSubmit={handleSaveRegistro} 
            className="eco-modal-content" 
            style={{ width: '100%', maxWidth: '450px' }}
          >
            <div className="eco-modal-header">
              <h2 className="eco-modal-title">
                {selectedRegistro ? '✏️ Editar Cantidad de Botellas' : '➕ Agregar Registro de Botellas'}
              </h2>
              <button type="button" onClick={() => setRegistroModalOpen(false)} className="eco-modal-close-btn">&times;</button>
            </div>
            <div className="eco-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {regFormError && (
                <div className="alert-box alert-danger">
                  ⚠️ {regFormError}
                </div>
              )}

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Alumno *</label>
                {selectedRegistro ? (
                  <div className="eco-input" style={{ backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    {selectedRegistro.alumno_nombre} (Fam. {selectedRegistro.alumno_familia})
                  </div>
                ) : (
                  <select 
                    value={regAlumnoId} 
                    onChange={(e) => setRegAlumnoId(e.target.value)} 
                    className="eco-input"
                    required
                  >
                    <option value="" disabled>Selecciona un alumno...</option>
                    {alumnos.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre} (Fam. {a.familia}) - {getSalonFriendly(a.salon)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Cantidad de Botellas *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button 
                    type="button" 
                    onClick={() => setRegCantidad(prev => Math.max(1, prev - 1))}
                    style={{ width: '38px', height: '38px', borderRadius: '50%', border: 'none', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    <Minus size={16} />
                  </button>
                  <input 
                    type="number" 
                    value={regCantidad}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setRegCantidad(isNaN(val) ? 0 : Math.max(1, val));
                    }}
                    className="eco-input" 
                    style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', flex: 1, margin: 0 }}
                    min="1"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setRegCantidad(prev => prev + 1)}
                    style={{ width: '38px', height: '38px', borderRadius: '50%', border: 'none', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

            </div>
            <div className="eco-modal-header" style={{ borderTop: '1px solid #e2e8f0', borderBottom: 'none', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
              <button type="button" onClick={() => setRegistroModalOpen(false)} className="btn-eco-secondary" style={{ padding: '8px 16px' }}>
                Cancelar
              </button>
              <button type="submit" className="btn-eco-primary" style={{ padding: '8px 20px' }}>
                {selectedRegistro ? 'Actualizar Cantidad' : 'Registrar Botellas'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
