import { useState, useEffect } from 'react';
import { X, Award } from 'lucide-react';
import api from '../services/api';

const GanadoresSemanalesModal = ({ isOpen, onClose }) => {
  const [winnersData, setWinnersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchWinners();
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

  const fetchWinners = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/winners/weekly/');
      setWinnersData(response.data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los ganadores semanales.');
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
      <div className="eco-modal-content" style={{ width: '100%', maxWidth: '640px' }}>
        {/* Header */}
        <div className="eco-modal-header">
          <h2 className="eco-modal-title">
            🥇 Ganadores de Cada Semana
          </h2>
          <button onClick={onClose} className="eco-modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="eco-modal-body">
          {loading && (
            <div className="text-center" style={{ padding: '2rem 0', fontWeight: 'bold', color: '#64748b' }}>
              Calculando ganadores de la historia... ⏳
            </div>
          )}

          {error && (
            <div className="alert-box alert-danger">
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && winnersData.length === 0 && (
            <div className="text-center" style={{ padding: '3rem 1rem', color: '#94a3b8' }}>
              <p style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 0.5rem 0', color: '#64748b' }}>¡Aún no hay registros de botellas para esta semana! 🍼</p>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', margin: 0 }}>¡Sé el primero en reciclar y conviértete en el héroe de la semana!</p>
            </div>
          )}

          {!loading && !error && winnersData.length > 0 && (
            <div className="eco-table-container">
              <table className="eco-table">
                <thead>
                  <tr>
                    <th>Semana</th>
                    <th>Héroe Semanal</th>
                    <th>Familia</th>
                    <th>Salón</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {winnersData.map((winner, index) => (
                    <tr key={index}>
                      <td data-label="Semana">
                        <span style={{ fontWeight: '800', color: '#334155', display: 'block' }}>
                          Semana {winner.semana_num}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>
                          {winner.rango_fechas.replace('Semana del ', '')}
                        </span>
                      </td>
                      <td data-label="Héroe" style={{ fontWeight: '800', color: '#15803d' }}>
                        👑 {winner.nombre}
                      </td>
                      <td data-label="Familia" style={{ fontWeight: '700', color: '#475569' }}>
                        {winner.familia}
                      </td>
                      <td data-label="Salón">
                        <span style={{
                          padding: '4px 10px',
                          backgroundColor: '#fffbeb',
                          color: '#b45309',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          borderRadius: '9999px',
                          border: '1px solid #fef08a'
                        }}>
                          {winner.salon}
                        </span>
                      </td>
                      <td data-label="Total" className="text-right" style={{ fontWeight: '900', color: '#16a34a', fontSize: '1.1rem' }}>
                        {winner.botellas} 🍼
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

export default GanadoresSemanalesModal;
