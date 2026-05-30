import React, { useState } from 'react';
import { FiMoon, FiSun, FiSettings, FiBookOpen } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LoginModal from './LoginModal';
import UploadArtworkModal from './UploadArtworkModal';
import UploadExcelModal from './UploadExcelModal';
import SettingsModal from './SettingsModal';
import '../styles/Navbar.css';

export const Navbar = ({ onUploaded, onExcelUploaded, onOpenDocs }) => {
    const { isLoggedIn, user, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const [showLogin, setShowLogin] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [showExcel, setShowExcel] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    return (
        <>
            <nav className="navbar" aria-label="Navegación principal">
                <div className="navbar-brand">
                    <span className="navbar-logo">MUUA</span>
                    <span className="navbar-sub">Colección de artes visuales</span>
                </div>

                <div className="navbar-actions">
                    <button
                        type="button"
                        className="navbar-btn navbar-btn--docs"
                        onClick={onOpenDocs}
                        aria-label="Documentación"
                        title="Documentación"
                    >
                        <FiBookOpen aria-hidden /> Docs
                    </button>
                    {isLoggedIn ? (
                        <>
                            <button type="button" className="navbar-btn navbar-btn--excel" onClick={() => setShowExcel(true)}>
                                Cargar inventario
                            </button>
                            <button type="button" className="navbar-btn navbar-btn--upload" onClick={() => setShowUpload(true)}>
                                <span className="btn-icon">+</span> Agregar obra
                            </button>
                            <div className="navbar-user">
                                <span className="user-avatar">{(user && user[0]) ? user[0].toUpperCase() : '?'}</span>
                                <span className="user-name">{user}</span>
                            </div>
                            <button type="button" className="navbar-btn navbar-btn--logout" onClick={logout}>
                                Salir
                            </button>
                        </>
                    ) : (
                        <button type="button" className="navbar-btn navbar-btn--login" onClick={() => setShowLogin(true)}>
                            Iniciar sesión
                        </button>
                    )}
                    <button
                        type="button"
                        className="navbar-btn navbar-btn--theme"
                        onClick={toggleDarkMode}
                        aria-label={darkMode ? 'Activar tema claro' : 'Activar tema oscuro'}
                        title={darkMode ? 'Tema claro' : 'Tema oscuro'}
                    >
                        {darkMode ? <FiSun aria-hidden /> : <FiMoon aria-hidden />}
                    </button>
                    <button
                        type="button"
                        className="navbar-btn navbar-btn--settings"
                        onClick={() => setShowSettings(true)}
                        aria-label="Configuración"
                        title="Configuración"
                    >
                        <FiSettings aria-hidden />
                    </button>
                </div>
            </nav>

            {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
            {showUpload && (
                <UploadArtworkModal
                    onClose={() => setShowUpload(false)}
                    onUploaded={(obra) => { onUploaded(obra); setShowUpload(false); }}
                />
            )}
            {showExcel && (
                <UploadExcelModal
                    onClose={() => setShowExcel(false)}
                    onUploaded={() => { setShowExcel(false); if (onExcelUploaded) onExcelUploaded(); }}
                />
            )}
            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
        </>
    );
};

export default Navbar;
