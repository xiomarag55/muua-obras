import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const savedToken = localStorage.getItem('muua_token');
        const savedUser = localStorage.getItem('muua_user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(savedUser);
        }
    }, []);

    const login = (authResponse) => {
        setToken(authResponse.token);
        setUser(authResponse.username);
        localStorage.setItem('muua_token', authResponse.token);
        localStorage.setItem('muua_user', authResponse.username);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('muua_token');
        localStorage.removeItem('muua_user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoggedIn: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
