import React from 'react';
import '../styles/ArtistCard.css';

const getInitials = (name) =>
    (name || '?').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();

export const ArtistCard = ({ artist, artworkCount = 0, onClick }) => {
    const initials = getInitials(artist.name);
    const hasTechnique = artist.technique && artist.technique !== '—' && artist.technique !== '';
    const hasRegion = artist.region && artist.region !== '—' && artist.region !== '';

    const handleKey = (e) => {
        if (!onClick) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(e);
        }
    };

    return (
        <article
            className="artist-card"
            onClick={onClick}
            onKeyDown={handleKey}
            tabIndex={0}
            role="button"
            aria-label={`Artista ${artist.name}, ver sus obras`}
        >
            <div className="artist-avatar-section" aria-hidden>
                <div className="artist-avatar">{initials}</div>
            </div>

            <div className="artist-info">
                <h3 className="artist-name">{artist.name}</h3>

                {(hasTechnique || hasRegion) && (
                    <div className="artist-tags">
                        {hasTechnique && <span className="artist-tag">{artist.technique}</span>}
                        {hasRegion && <span className="artist-tag artist-tag--region">{artist.region}</span>}
                    </div>
                )}

                {artworkCount > 0 && (
                    <div className="artist-works-count">
                        <span className="artist-works-num">{artworkCount}</span>
                        <span className="artist-works-label">obra{artworkCount !== 1 ? 's' : ''}</span>
                    </div>
                )}

                {artist.bio && <p className="artist-bio">{artist.bio}</p>}

                <span className="artist-view-link">Ver obras →</span>
            </div>
        </article>
    );
};

export default ArtistCard;
