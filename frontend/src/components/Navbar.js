import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import UploadArtworkModal from './UploadArtworkModal';
import '../styles/Navbar.css';

export const Navbar = ({ onUploaded }) => {
    const { isLoggedIn, user, logout } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [showUpload, setShowUpload] = useState(false);

    return (
        <>
            <nav className="navbar">
                <div className="navbar-brand">
                    <span className="navbar-logo">MUUA</span>
                    <span className="navbar-sub">Galería Virtual</span>
                </div>

                <div className="navbar-actions">
                    {isLoggedIn ? (
                        <>
                            <button className="navbar-btn navbar-btn--upload" onClick={() => setShowUpload(true)}>
                                <span className="btn-icon">+</span> Agregar obra
                            </button>
                            <div className="navbar-user">
                                <span className="user-avatar">{user[0].toUpperCase()}</span>
                                <span className="user-name">{user}</span>
                            </div>
                            <button className="navbar-btn navbar-btn--logout" onClick={logout}>
                                Salir
                            </button>
                        </>
                    ) : (
                        <button className="navbar-btn navbar-btn--login" onClick={() => setShowLogin(true)}>
                            Iniciar sesión
                        </button>
                    )}
                </div>
            </nav>

            {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
            {showUpload && (
                <UploadArtworkModal
                    onClose={() => setShowUpload(false)}
                    onUploaded={(obra) => { onUploaded(obra); setShowUpload(false); }}
                />
            )}
        </>
    );
};

export default Navbar;
