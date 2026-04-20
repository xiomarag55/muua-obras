import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/apiService';
import '../styles/Modal.css';

export const LoginModal = ({ onClose }) => {
    const { login } = useAuth();
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setError('Completa todos los campos.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = mode === 'login'
                ? await authService.login(username, password)
                : await authService.register(username, password);
            login(response);
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || '';
            if (mode === 'register' && (msg.includes('ya existe') || err.response?.status === 400)) {
                setError('El usuario ya existe. Intenta con otro nombre.');
            } else if (err.response?.status === 401 || err.response?.status === 403) {
                setError('Credenciales incorrectas.');
            } else {
                setError('Error al conectar con el servidor.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <h2 className="modal-title">
                    {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                </h2>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Nombre de usuario"
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Contraseña"
                        />
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Registrarse'}
                    </button>
                </form>

                <p className="modal-switch">
                    {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                    <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
                        {mode === 'login' ? ' Regístrate' : ' Inicia sesión'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginModal;
