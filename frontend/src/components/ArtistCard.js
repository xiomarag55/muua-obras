/**
 * Componente ArtistCard
 * Tarjeta para mostrar información de un artista
 */

import React, { useState } from 'react';
import '../styles/ArtistCard.css';

export const ArtistCard = ({ artist, artworkCount = 0, onClick }) => {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <div className="artist-card" onClick={onClick}>
            <div className="artist-image-container">
                {!imageError ? (
                    <img
                        src={artist.image}
                        alt={artist.name}
                        className="artist-image"
                        onError={handleImageError}
                    />
                ) : (
                    <div className="artist-image-placeholder">
                        <span>{artist.name.charAt(0)}</span>
                    </div>
                )}
            </div>

            <div className="artist-info">
                <h3 className="artist-name">{artist.name}</h3>

                <div className="artist-details">
                    <div className="detail-item">
                        <strong>Región:</strong>
                        <span>{artist.region}</span>
                    </div>
                    <div className="detail-item">
                        <strong>Técnica:</strong>
                        <span>{artist.technique}</span>
                    </div>
                    {artworkCount > 0 && (
                        <div className="detail-item">
                            <strong>Obras:</strong>
                            <span>{artworkCount}</span>
                        </div>
                    )}
                </div>

                {artist.bio && (
                    <p className="artist-bio">{artist.bio}</p>
                )}
            </div>
        </div>
    );
};

export default ArtistCard;
