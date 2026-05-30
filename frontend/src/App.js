import React, { useState, useCallback } from 'react';
import Gallery from './components/Gallery';
import Navbar from './components/Navbar';
import AppLoader from './components/AppLoader';
import WelcomeModal from './components/WelcomeModal';
import DocsModal from './components/DocsModal';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './styles/App.css';

function App() {
    const [loading, setLoading] = useState(true);
    const [showWelcome, setShowWelcome] = useState(true);
    const [showDocs, setShowDocs] = useState(false);
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

    const handleCloseWelcome = () => {
        setShowWelcome(false);
    };

    const handleOpenDocs = () => setShowDocs(true);

    const handleWelcomeToDocs = () => {
        handleCloseWelcome();
        handleOpenDocs();
    };

    return (
        <ThemeProvider>
            <AuthProvider>
                {loading && <AppLoader onDone={() => setLoading(false)} />}
                <div className="app">
                    <Navbar
                        onUploaded={handleUploaded}
                        onExcelUploaded={handleExcelUploaded}
                        onOpenDocs={handleOpenDocs}
                    />
                    <Gallery
                        onUploaded={receiveCallback}
                        onExcelUploaded={receiveExcelCallback}
                    />
                </div>
                {!loading && showWelcome && (
                    <WelcomeModal
                        onClose={handleCloseWelcome}
                        onOpenDocs={handleWelcomeToDocs}
                    />
                )}
                {showDocs && <DocsModal onClose={() => setShowDocs(false)} />}
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
