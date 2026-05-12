import React from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import '../styles/Modal.css';
import '../styles/Settings.css';

const SettingsModal = ({ onClose }) => {
    const { darkMode } = useTheme();

    return (
        <div className="modal-overlay" onClick={onClose} role="presentation">
            <div
                className="modal-box settings-modal"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-labelledby="settings-title"
                aria-describedby="settings-theme-hint"
            >
                <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar configuración">
                    ✕
                </button>
                <h2 id="settings-title" className="modal-title">
                    Configuración
                </h2>

                <div className="settings-brand">
                    <span className="settings-brand-logo">MUUA</span>
                    <span className="settings-brand-sub">Universidad de Antioquia</span>
                </div>

                <div className="settings-section settings-section--flush">
                    <h3 className="settings-section-title">Tema de la pantalla</h3>
                    <p id="settings-theme-hint" className="settings-hint">
                        Para no repetir opciones: el modo claro u oscuro se cambia desde el{' '}
                        <strong className="settings-hint-strong">icono junto a esta ruedita</strong> en la barra superior
                        (sol o luna).
                    </p>
                    <div className="settings-current-theme" aria-live="polite">
                        <span className="settings-current-theme-icons" aria-hidden>
                            {darkMode ? <FiMoon size={18} /> : <FiSun size={18} />}
                        </span>
                        <span>{darkMode ? 'Modo oscuro activo' : 'Modo claro activo'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
