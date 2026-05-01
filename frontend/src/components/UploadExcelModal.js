import React, { useEffect, useRef, useState } from 'react';
import { excelService } from '../services/apiService';
import '../styles/Modal.css';

const POLL_MS = 3000;

const FASE_LABEL = {
    LEYENDO_EXCEL:     { icon: '📖', texto: 'Fase 1/2 — Leyendo y preparando registros…' },
    SUBIENDO_IMAGENES: { icon: '☁️', texto: 'Fase 2/2 — Subiendo imágenes a Cloudinary…' },
    COMPLETADO:        { icon: '✅', texto: 'Proceso completado' },
    FALLIDO:           { icon: '❌', texto: 'El proceso falló en el servidor' },
};

export const UploadExcelModal = ({ onClose, onUploaded }) => {
    const [file,     setFile]     = useState(null);
    const [status,   setStatus]   = useState('idle');   // idle|uploading|processing|success|error
    const [progress, setProgress] = useState(null);     // objeto del status endpoint
    const [message,  setMessage]  = useState('');
    const inputRef = useRef();
    const pollRef  = useRef(null);

    useEffect(() => () => stopPolling(), []);

    const stopPolling = () => {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };

    const startPolling = (jobId) => {
        pollRef.current = setInterval(async () => {
            try {
                const data = await excelService.getBatchStatus(jobId);
                setProgress(data);

                if (data.fase === 'COMPLETADO') {
                    stopPolling();
                    setStatus('success');
                    setMessage(
                        `${data.guardados ?? 0} obra(s) guardadas` +
                        (data.omitidos > 0 ? `, ${data.omitidos} omitidas (duplicadas)` : '') + '.'
                    );
                    if (onUploaded) onUploaded();
                } else if (data.fase === 'FALLIDO') {
                    stopPolling();
                    setStatus('error');
                    setMessage('El procesamiento falló. Revisa los logs del backend.');
                }
            } catch { /* errores de red transitorios — ignorar */ }
        }, POLL_MS);
    };

    const handleFile = (f) => {
        if (!f) return;
        if (!f.name.endsWith('.xlsx') && !f.name.endsWith('.xls')) {
            setMessage('Solo se aceptan archivos .xlsx o .xls');
            setStatus('error');
            return;
        }
        setFile(f);
        setStatus('idle');
        setMessage('');
        setProgress(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) { setMessage('Selecciona un archivo primero.'); setStatus('error'); return; }
        setStatus('uploading');
        setMessage('');
        setProgress(null);
        try {
            const { jobId } = await excelService.upload(file);
            setStatus('processing');
            startPolling(jobId);
        } catch (err) {
            setStatus('error');
            setMessage(err?.response?.data?.error || 'Error al subir el archivo.');
        }
    };

    const handleClose = () => { stopPolling(); onClose(); };
    const isWorking   = status === 'uploading' || status === 'processing';

    const faseInfo    = progress ? (FASE_LABEL[progress.fase] ?? FASE_LABEL.LEYENDO_EXCEL) : null;
    const porcentaje  = progress?.porcentaje ?? 0;
    const total       = progress?.total ?? 0;
    const guardados   = progress?.guardados ?? 0;

    return (
        <div className="modal-overlay" onClick={isWorking ? undefined : handleClose}>
            <div className="modal-box modal-box--upload" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={handleClose} disabled={isWorking}>✕</button>
                <h2 className="modal-title">Cargar inventario Excel</h2>

                <form onSubmit={handleSubmit} className="modal-form">

                    {/* Zona de drop */}
                    <div
                        className="excel-drop-zone"
                        style={{ cursor: isWorking ? 'default' : 'pointer', opacity: isWorking ? 0.55 : 1 }}
                        onDragOver={e => e.preventDefault()}
                        onDrop={isWorking ? undefined : e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                        onClick={isWorking ? undefined : () => inputRef.current.click()}
                    >
                        <input ref={inputRef} type="file" accept=".xlsx,.xls"
                               style={{ display: 'none' }} disabled={isWorking}
                               onChange={e => handleFile(e.target.files[0])} />
                        {file ? (
                            <>
                                <span className="excel-icon">📄</span>
                                <p className="excel-filename">{file.name}</p>
                                <p className="excel-filesize">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </>
                        ) : (
                            <>
                                <span className="excel-icon">📂</span>
                                <p className="excel-drop-text">Arrastra el archivo aquí o haz clic</p>
                                <p className="excel-drop-hint">Formatos: .xlsx, .xls</p>
                            </>
                        )}
                    </div>

                    {/* Uploading spinner */}
                    {status === 'uploading' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#555', marginTop: 8 }}>
                            <div className="spinner" />
                            <span>Subiendo archivo al servidor…</span>
                        </div>
                    )}

                    {/* Progreso del job */}
                    {status === 'processing' && faseInfo && (
                        <div style={{ marginTop: 12, padding: '14px 16px', background: '#f0f7ff', borderRadius: 8, border: '1px solid #b3d4ff' }}>
                            {/* Encabezado de fase */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                <span style={{ fontWeight: 600, color: '#1a5fb4', fontSize: 14 }}>
                                    {faseInfo.icon} {faseInfo.texto}
                                </span>
                            </div>

                            {/* Barra de progreso (sólo en fase 2) */}
                            {progress.fase === 'SUBIENDO_IMAGENES' && total > 0 && (
                                <>
                                    <div style={{
                                        height: 8, background: '#dce8ff', borderRadius: 4,
                                        overflow: 'hidden', marginBottom: 6
                                    }}>
                                        <div style={{
                                            width: `${porcentaje}%`, height: '100%',
                                            background: '#1a5fb4', borderRadius: 4,
                                            transition: 'width 0.5s ease'
                                        }} />
                                    </div>
                                    <div style={{ fontSize: 13, color: '#444', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{guardados.toLocaleString()} / {total.toLocaleString()} imágenes</span>
                                        <span style={{ fontWeight: 700, color: '#1a5fb4' }}>{porcentaje}%</span>
                                    </div>
                                </>
                            )}

                            {/* Contadores fase 1 */}
                            {progress.fase === 'LEYENDO_EXCEL' && (
                                <p style={{ fontSize: 13, color: '#444', margin: 0 }}>
                                    {progress.total?.toLocaleString() ?? '—'} registros preparados hasta ahora…
                                </p>
                            )}

                            <p style={{ fontSize: 11, color: '#888', margin: '8px 0 0' }}>
                                Puedes cerrar — el proceso continúa en el servidor.
                            </p>
                        </div>
                    )}

                    {/* Éxito */}
                    {status === 'success' && (
                        <div style={{ marginTop: 12, padding: '12px 16px', background: '#eafaf1', borderRadius: 8, border: '1px solid #a9dfbf' }}>
                            <p style={{ fontWeight: 700, color: '#27ae60', margin: '0 0 4px' }}>
                                ✅ ¡Proceso completado!
                            </p>
                            <p style={{ fontSize: 13, color: '#333', margin: 0 }}>{message}</p>
                        </div>
                    )}

                    {/* Error */}
                    {status === 'error' && (
                        <p className="form-error">{message}</p>
                    )}

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={handleClose}>
                            {status === 'success' ? 'Cerrar' : 'Cancelar'}
                        </button>
                        <button type="submit" className="btn-primary"
                                disabled={isWorking || !file || status === 'success'}>
                            {status === 'uploading'  ? 'Subiendo…'    :
                             status === 'processing' ? 'Procesando…'  :
                             'Cargar inventario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadExcelModal;
