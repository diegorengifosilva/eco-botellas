import { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Plus, Minus, Leaf } from 'lucide-react';
import api from '../services/api';

const AgregarBotellasModal = ({ isOpen, onClose, onSuccess }) => {
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleIncrement = () => setCantidad(prev => prev + 1);
  const handleDecrement = () => setCantidad(prev => (prev > 1 ? prev - 1 : 1));

  const handleQuickAdd = (value) => {
    setCantidad(prev => prev + value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cantidad <= 0) return;

    setLoading(true);
    setError('');

    try {
      await api.post('/botellas/add/', { cantidad });
      
      // Lanzar confeti espectacular
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#4ade80', '#3b82f6', '#facc15', '#ec4899']
      });

      // Recargar datos en el Dashboard
      onSuccess();

      // Cerrar modal automáticamente después de 1.2 segundos
      setTimeout(() => {
        onClose();
        setCantidad(1);
      }, 1200);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'No se pudo guardar la cantidad.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="eco-modal-overlay">
      <div className="eco-modal-content" style={{ width: '100%', maxWidth: '440px' }}>
        {/* Header */}
        <div className="eco-modal-header">
          <h2 className="eco-modal-title">
            🌱 Agregar Botellas
          </h2>
          <button onClick={onClose} className="eco-modal-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="eco-modal-body text-center">
          <form onSubmit={handleSubmit}>
            <p style={{ color: '#64748b', fontWeight: '600', marginBottom: '1.5rem', marginTop: 0 }}>
              ¡Agrega las botellas que trajiste hoy al colegio! 🎒
            </p>

            {/* Selector de cantidad */}
            <div className="counter-section">
              <button
                type="button"
                onClick={handleDecrement}
                className="counter-btn"
              >
                <Minus size={20} strokeWidth={3} />
              </button>

              <div className="counter-display">
                <span className="counter-number">
                  {cantidad}
                </span>
                <span className="counter-unit">
                  {cantidad === 1 ? 'Botella' : 'Botellas'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleIncrement}
                className="counter-btn"
              >
                <Plus size={20} strokeWidth={3} />
              </button>
            </div>

            {/* Botones de incremento rápido (Reduce clics) */}
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

            {error && (
              <div className="alert-box alert-danger">
                ⚠️ {error}
              </div>
            )}

            {/* Botón Guardar */}
            <button
              type="submit"
              disabled={loading}
              className="btn-eco-primary"
              style={{ width: '100%', padding: '16px' }}
            >
              <Leaf size={18} />
              {loading ? 'Guardando...' : '¡Reciclar ahora! 🌎'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgregarBotellasModal;
