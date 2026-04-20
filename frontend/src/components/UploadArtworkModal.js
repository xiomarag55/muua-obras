import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { artworkService } from '../services/apiService';
import '../styles/Modal.css';

const EMPTY = { title: '', artistName: '', technique: '', dimensions: '', year: '', description: '', image: '' };

export const UploadArtworkModal = ({ onClose, onUploaded }) => {
    const { token } = useAuth();
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.artistName.trim()) {
            setError('El título y el artista son obligatorios.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const payload = {
                ...form,
                year: form.year ? parseInt(form.year, 10) : null,
            };
            const created = await artworkService.create(payload, token);
            onUploaded(created);
            onClose();
        } catch (err) {
            setError('Error al guardar la obra. Verifica que el backend esté activo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box modal-box--upload" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <h2 className="modal-title">Agregar obra</h2>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Título *</label>
                            <input type="text" value={form.title} onChange={set('title')} placeholder="Título de la obra" />
                        </div>
                        <div className="form-group">
                            <label>Artista *</label>
                            <input type="text" value={form.artistName} onChange={set('artistName')} placeholder="Nombre del artista" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Técnica</label>
                            <input type="text" value={form.technique} onChange={set('technique')} placeholder="Ej: Óleo sobre lienzo" />
                        </div>
                        <div className="form-group">
                            <label>Año</label>
                            <input type="number" value={form.year} onChange={set('year')} placeholder="Ej: 1920" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Dimensiones</label>
                        <input type="text" value={form.dimensions} onChange={set('dimensions')} placeholder="Ej: 100 x 80 cm" />
                    </div>

                    <div className="form-group">
                        <label>URL de la imagen</label>
                        <input type="url" value={form.image} onChange={set('image')} placeholder="https://..." />
                    </div>

                    <div className="form-group">
                        <label>Descripción</label>
                        <textarea value={form.description} onChange={set('description')} rows={3} placeholder="Descripción de la obra..." />
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Guardando...' : 'Agregar obra'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadArtworkModal;
