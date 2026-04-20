/**
 * Componente ArtworkCard
 * Tarjeta para mostrar información de una obra de arte
 */

import React, { useState } from 'react';
import '../styles/ArtworkCard.css';

export const ArtworkCard = ({ artwork, onArtistClick }) => {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <div className="artwork-card">
            <div className="artwork-image-container">
                {!imageError ? (
                    <img
                        src={artwork.image}
                        alt={artwork.title}
                        className="artwork-image"
                        onError={handleImageError}
                    />
                ) : (
                    <div className="artwork-image-placeholder">
                        <span>Imagen no disponible</span>
                    </div>
                )}
            </div>

            <div className="artwork-info">
                <h3 className="artwork-title">{artwork.title}</h3>

                <div className="artwork-artist">
                    <strong>Artista:</strong>
                    <span
                        className="artist-link"
                        onClick={() => onArtistClick && onArtistClick(artwork.artistId)}
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
