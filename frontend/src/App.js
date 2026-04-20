/**
 * Componente App
 * Componente raíz de la aplicación
 */

import React from 'react';
import Gallery from './components/Gallery';
import './styles/App.css';

function App() {
    return (
        <div className="app">
            <Gallery />
        </div>
    );
}

export default App;
