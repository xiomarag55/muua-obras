import React, { useState, useEffect } from 'react';
import '../styles/AppLoader.css';

const AppLoader = ({ onDone }) => {
    const [out, setOut] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => setOut(true), 750);
        const t2 = setTimeout(() => onDone(), 1100);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [onDone]);

    return (
        <div className={`app-loader${out ? ' app-loader--out' : ''}`} aria-hidden="true">
            <div className="app-loader-inner">
                <span className="app-loader-logo">MUUA</span>
                <span className="app-loader-sub">Colección de artes visuales</span>
                <div className="app-loader-track">
                    <div className="app-loader-fill" />
                </div>
            </div>
        </div>
    );
};

export default AppLoader;
