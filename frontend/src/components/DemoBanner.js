/**
 * Componente DemoBanner
 * Muestra un banner indicando que se está usando datos de demostración
 */

import React from 'react';
import '../styles/DemoBanner.css';

export const DemoBanner = () => {
    return (
        <div className="demo-banner">
            <div className="demo-banner-content">
                <span className="demo-badge">⚙️ Datos de demostración</span>
                <span className="demo-text">Contenido en construcción — Estos datos serán reemplazados con información real</span>
            </div>
        </div>
    );
};

export default DemoBanner;
