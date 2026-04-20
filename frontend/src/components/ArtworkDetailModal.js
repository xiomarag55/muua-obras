import React, { useState } from 'react';
import '../styles/Modal.css';

export const ArtworkDetailModal = ({ artwork, onClose }) => {
    const [imageError, setImageError] = useState(false);

    if (!artwork) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box modal-box--detail" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

                <div className="detail-layout">
                    <div className="detail-image-wrap">
                        {artwork.image && !imageError ? (
                            <img
                                src={artwork.image}
                                alt={artwork.title}
                                className="detail-image"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="detail-image-placeholder">
                                <span>Imagen no disponible</span>
                            </div>
                        )}
                    </div>

                    <div className="detail-info">
                        <h2 className="detail-title">{artwork.title}</h2>

                        <div className="detail-meta">
                            <div className="detail-row">
                                <span className="detail-label">Artista</span>
                                <span className="detail-value">{artwork.artist?.name || 'Desconocido'}</span>
                            </div>
                            {artwork.technique && (
                                <div className="detail-row">
                                    <span className="detail-label">Técnica</span>
                                    <span className="detail-value">{artwork.technique}</span>
                                </div>
                            )}
                            {artwork.dimensions && artwork.dimensions !== '—' && (
                                <div className="detail-row">
                                    <span className="detail-label">Dimensiones</span>
                                    <span className="detail-value">{artwork.dimensions}</span>
                                </div>
                            )}
                            {artwork.year && (
                                <div className="detail-row">
                                    <span className="detail-label">Fecha</span>
                                    <span className="detail-value">{artwork.year}</span>
                                </div>
                            )}
                        </div>

                        {artwork.description && (
                            <div className="detail-description">
                                <h3>Descripción</h3>
                                <p>{artwork.description}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtworkDetailModal;
