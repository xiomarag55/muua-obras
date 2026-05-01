import React from 'react';
import { useTheme } from '../context/ThemeContext';
import '../styles/Modal.css';
import '../styles/Settings.css';

const SettingsModal = ({ onClose }) => {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box settings-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <h2 className="modal-title">Configuración</h2>

                <div className="settings-section">
                    <h3 className="settings-section-title">Apariencia</h3>

                    <div className="settings-item">
                        <div className="settings-item-info">
                            <span className="settings-item-label">
                                {darkMode ? '🌙 Tema oscuro' : '☀️ Tema claro'}
                            </span>
                            <span className="settings-item-desc">
                                Cambia la apariencia de la galería
                            </span>
                        </div>
                        <button
                            className={`theme-toggle ${darkMode ? 'theme-toggle--active' : ''}`}
                            onClick={toggleDarkMode}
                            aria-label="Cambiar tema"
                        >
                            <span className="theme-toggle-knob" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
