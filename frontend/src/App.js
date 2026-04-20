import React, { useState, useCallback } from 'react';
import Gallery from './components/Gallery';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import './styles/App.css';

function App() {
    const [uploadedCallback, setUploadedCallback] = useState(null);

    const receiveCallback = useCallback((fn) => {
        setUploadedCallback(() => fn);
    }, []);

    const handleUploaded = useCallback((obra) => {
        if (uploadedCallback) uploadedCallback(obra);
    }, [uploadedCallback]);

    return (
        <AuthProvider>
            <div className="app">
                <Navbar onUploaded={handleUploaded} />
                <Gallery onUploaded={receiveCallback} />
            </div>
        </AuthProvider>
    );
}

export default App;
