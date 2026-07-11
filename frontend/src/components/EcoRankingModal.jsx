import { useState, useEffect } from 'react';
import { X, Trophy } from 'lucide-react';
import api from '../services/api';

const EcoRankingModal = ({ isOpen, onClose, title, tipo }) => {
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchRanking();
    }
  }, [isOpen, tipo]);

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

  const fetchRanking = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/rankings/?tipo=${tipo}`);
      setRankingData(response.data);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar el ranking.');
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

  const renderMedal = (puesto) => {
    if (puesto === 1) return <span className="medal-container medal-oro">1</span>;
    if (puesto === 2) return <span className="medal-container medal-plata">2</span>;
    if (puesto === 3) return <span className="medal-container medal-bronce">3</span>;
    return <span className="medal-container medal-none">{puesto}</span>;
  };

  return (
    <div className="eco-modal-overlay" onClick={handleOverlayClick}>
      <div className="eco-modal-content" style={{ width: '100%', maxWidth: '640px' }}>
        {/* Header */}
        <div className="eco-modal-header">
          <h2 className="eco-modal-title">
            {title}
          </h2>
          <button onClick={onClose} className="eco-modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="eco-modal-body">
          {loading && (
            <div className="text-center" style={{ padding: '2rem 0', fontWeight: 'bold', color: '#64748b' }}>
              Cargando posiciones... ⏳
            </div>
          )}

          {error && (
            <div className="alert-box alert-danger">
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && rankingData.length === 0 && (
            <div className="text-center" style={{ padding: '2rem 0', color: '#94a3b8', fontWeight: '500' }}>
              ¡Aún no hay botellas recicladas en esta categoría! 🌱
            </div>
          )}

          {!loading && !error && rankingData.length > 0 && (
            <div className="eco-table-container">
              <table className="eco-table">
                <thead>
                  <tr>
                    <th>Puesto</th>
                    {tipo === 'ninos' && (
                      <>
                        <th>Nombre</th>
                        <th>Familia</th>
                        <th>Salón</th>
                      </>
                    )}
                    {tipo === 'familias' && <th>Familia</th>}
                    {tipo === 'salones' && <th>Salón</th>}
                    <th>Botellas</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingData.map((item, index) => (
                    <tr key={index}>
                      <td data-label="Puesto">{renderMedal(item.puesto)}</td>
                      {tipo === 'ninos' && (
                        <>
                          <td data-label="Nombre" style={{ fontWeight: '800', color: '#334155' }}>{item.nombre}</td>
                          <td data-label="Familia" style={{ fontWeight: '700', color: '#475569' }}>{item.familia}</td>
                          <td data-label="Salón">
                            <span style={{
                              padding: '4px 10px',
                              backgroundColor: '#f0fdf4',
                              color: '#15803d',
                              fontSize: '0.75rem',
                              fontWeight: '800',
                              borderRadius: '9999px',
                              border: '1px solid #bbf7d0'
                            }}>
                              {item.salon}
                            </span>
                          </td>
                        </>
                      )}
                      {tipo === 'familias' && (
                        <td data-label="Familia" style={{ fontWeight: '800', color: '#334155' }}>Familia {item.familia}</td>
                      )}
                      {tipo === 'salones' && (
                        <td data-label="Salón" style={{ fontWeight: '800', color: '#334155' }}>{item.salon}</td>
                      )}
                      <td data-label="Botellas" className="text-right" style={{ fontWeight: '900', color: '#16a34a', fontSize: '1.1rem' }}>
                        {item.botellas} 🍼
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

export default EcoRankingModal;
