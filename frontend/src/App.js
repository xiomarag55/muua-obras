import React, { useState, useCallback } from 'react';
import Gallery from './components/Gallery';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './styles/App.css';

function App() {
    const [uploadedCallback, setUploadedCallback] = useState(null);
    const [excelCallback, setExcelCallback] = useState(null);

    const receiveCallback = useCallback((fn) => {
        setUploadedCallback(() => fn);
    }, []);

    const receiveExcelCallback = useCallback((fn) => {
        setExcelCallback(() => fn);
    }, []);

    const handleUploaded = useCallback((obra) => {
        if (uploadedCallback) uploadedCallback(obra);
    }, [uploadedCallback]);

    const handleExcelUploaded = useCallback(() => {
        if (excelCallback) excelCallback();
    }, [excelCallback]);

    return (
        <ThemeProvider>
            <AuthProvider>
                <div className="app">
                    <Navbar onUploaded={handleUploaded} onExcelUploaded={handleExcelUploaded} />
                    <Gallery onUploaded={receiveCallback} onExcelUploaded={receiveExcelCallback} />
                </div>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
