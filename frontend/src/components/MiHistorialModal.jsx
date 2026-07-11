import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import api from '../services/api';

const MiHistorialModal = ({ isOpen, onClose }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/history/');
      setHistoryData(response.data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar tu historial.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('eco-modal-overlay')) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="eco-modal-overlay" onClick={handleOverlayClick}>
      <div className="eco-modal-content" style={{ width: '100%', maxWidth: '500px' }}>
        {/* Header */}
        <div className="eco-modal-header">
          <h2 className="eco-modal-title">
            📅 Mi Historial de Reciclaje
          </h2>
          <button onClick={onClose} className="eco-modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="eco-modal-body">
          {loading && (
            <div className="text-center" style={{ padding: '2rem 0', fontWeight: 'bold', color: '#64748b' }}>
              Cargando tu historial... 🎒
            </div>
          )}

          {error && (
            <div className="alert-box alert-danger">
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && historyData.length === 0 && (
            <div className="text-center" style={{ padding: '3rem 1rem', color: '#94a3b8' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 0.5rem 0', color: '#64748b' }}>¡Aún no has registrado botellas! 🍼</p>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', margin: 0 }}>¡Comienza a reciclar para ver tu historial aquí!</p>
            </div>
          )}

          {!loading && !error && historyData.length > 0 && (
            <div className="eco-table-container">
              <table className="eco-table">
                <thead>
                  <tr>
                    <th>Fecha y Hora</th>
                    <th>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((item, index) => (
                    <tr key={item.id || index}>
                      <td data-label="Fecha y Hora" style={{ fontWeight: '700', color: '#475569' }}>
                        {item.fecha_hora_formateada}
                      </td>
                      <td data-label="Cantidad" className="text-right" style={{ fontWeight: '900', color: '#16a34a', fontSize: '1.1rem' }}>
                        +{item.cantidad} 🍼
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiHistorialModal;
