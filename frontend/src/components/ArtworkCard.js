import React, { useState } from 'react';
import '../styles/ArtworkCard.css';

export const ArtworkCard = ({ artwork, onArtistClick, onClick, onDelete }) => {
    const [imageError, setImageError] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setConfirmDelete(true);
    };

    const handleConfirm = (e) => {
        e.stopPropagation();
        setConfirmDelete(false);
        onDelete(artwork.id);
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        setConfirmDelete(false);
    };

    return (
        <div className="artwork-card" onClick={onClick} style={onClick ? { cursor: 'pointer' } : undefined}>
            <div className="artwork-image-container">
                {!imageError ? (
                    <img
                        src={artwork.image}
                        alt={artwork.title}
                        className="artwork-image"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="artwork-image-placeholder">
                        <span>Imagen no disponible</span>
                    </div>
                )}

                {onDelete && (
                    <div className="artwork-card-actions">
                        {confirmDelete ? (
                            <div className="delete-confirm" onClick={e => e.stopPropagation()}>
                                <span>¿Eliminar?</span>
                                <button className="btn-confirm-yes" onClick={handleConfirm}>Sí</button>
                                <button className="btn-confirm-no" onClick={handleCancel}>No</button>
                            </div>
                        ) : (
                            <button className="btn-delete" onClick={handleDeleteClick} title="Eliminar obra">
                                🗑
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="artwork-info">
                <h3 className="artwork-title">{artwork.title}</h3>

                <div className="artwork-artist">
                    <strong>Artista:</strong>
                    <span
                        className="artist-link"
                        onClick={(e) => { e.stopPropagation(); onArtistClick && onArtistClick(artwork.artistId); }}
                    >
                        {artwork.artist?.name || 'Artista desconocido'}
                    </span>
                </div>

                <div className="artwork-details">
                    <div className="detail-item">
                        <strong>Técnica:</strong>
                        <span>{artwork.technique}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Dimensiones:</strong>
                        <span>{artwork.dimensions}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Año:</strong>
                        <span>{artwork.year}</span>
                    </div>
                </div>

                {artwork.description && (
                    <p className="artwork-description">{artwork.description}</p>
                )}
            </div>
        </div>
    );
};

export default ArtworkCard;
