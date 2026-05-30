import React from 'react';
import { FiX, FiAlertTriangle, FiBookOpen, FiTool } from 'react-icons/fi';
import '../styles/WelcomeModal.css';

const WelcomeModal = ({ onClose, onOpenDocs }) => {
    const handleDocs = () => {
        onClose();
        onOpenDocs();
    };

    return (
        <div className="modal-overlay welcome-overlay" onClick={onClose}>
            <div
                className="welcome-modal"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="welcome-title"
            >
                <button className="welcome-close" onClick={onClose} aria-label="Cerrar">
                    <FiX />
                </button>

                <div className="welcome-header">
                    <div className="welcome-badge">
                        <FiTool aria-hidden /> En construcción
                    </div>
                    <h2 id="welcome-title" className="welcome-title">Bienvenido a MUUA</h2>
                    <p className="welcome-desc">
                        Plataforma de gestión y visualización de la colección de artes visuales — versión beta.
                    </p>
                </div>

                <div className="welcome-notices">
                    <div className="welcome-notice welcome-notice--warn">
                        <FiAlertTriangle className="notice-icon" aria-hidden />
                        <div>
                            <strong>Plataforma de prueba</strong>
                            <p>
                                Esta aplicación está en desarrollo activo. Algunas funciones
                                pueden cambiar o no estar disponibles temporalmente.
                            </p>
                        </div>
                    </div>
                    <div className="welcome-notice welcome-notice--info">
                        <span className="notice-icon notice-icon--emoji" aria-hidden>📊</span>
                        <div>
                            <strong>Límite de carga Excel</strong>
                            <p>
                                Por ahora se pueden cargar hasta <strong>100 obras</strong> en
                                el archivo Excel de inventario.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="welcome-actions">
                    <button className="welcome-btn-docs" onClick={handleDocs}>
                        <FiBookOpen aria-hidden /> Ver documentación
                    </button>
                    <button className="welcome-btn-close" onClick={onClose}>
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;
