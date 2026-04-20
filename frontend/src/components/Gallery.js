/**
 * Componente Gallery
 * Galería principal que muestra artistas y obras con búsqueda y filtros
 */

import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import ArtworkCard from './ArtworkCard';
import ArtistCard from './ArtistCard';
import DemoBanner from './DemoBanner';
import { demoArtists, demoArtworks, filterOptions, getEnrichedArtworks } from '../data/demoData';
import '../styles/Gallery.css';

export const Gallery = () => {
    const [view, setView] = useState('artworks'); // 'artworks' o 'artists'
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({});
    const [filteredData, setFilteredData] = useState([]);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [loading, setLoading] = useState(false);

    // Efecto para filtrar datos cuando cambia la búsqueda o los filtros
    useEffect(() => {
        setLoading(true);

        setTimeout(() => {
            let result = [];

            try {
                if (view === 'artworks') {
                    const artworks = getEnrichedArtworks();
                    result = filterArtworks(artworks, searchQuery, filters, selectedArtist);
                } else {
                    result = filterArtists(demoArtists, searchQuery, filters);
                }

                // Asegurar que result siempre sea un array
                if (!Array.isArray(result)) {
                    console.error('Filtered result is not an array:', result);
                    result = [];
                }
            } catch (error) {
                console.error('Error filtering data:', error);
                result = [];
            }

            setFilteredData(result);
            setLoading(false);
        }, 300);
    }, [searchQuery, filters, view, selectedArtist]);

    const filterArtworks = (artworks, query, filters, artistId) => {
        return artworks.filter(artwork => {
            // Filtro por búsqueda
            if (query) {
                const searchTerm = query.toLowerCase();
                const matchesSearch =
                    artwork.title.toLowerCase().includes(searchTerm) ||
                    (artwork.artist?.name || '').toLowerCase().includes(searchTerm) ||
                    artwork.technique.toLowerCase().includes(searchTerm) ||
                    artwork.description.toLowerCase().includes(searchTerm);

                if (!matchesSearch) return false;
            }

            // Filtro por artista seleccionado
            if (artistId && artwork.artistId !== artistId) return false;

            // Filtro por técnica
            if (filters.technique && filters.technique.length > 0) {
                if (!filters.technique.includes(artwork.technique)) return false;
            }

            // Filtro por año
            if (filters.year && filters.year.length > 0) {
                if (!filters.year.includes(artwork.year)) return false;
            }

            return true;
        });
    };

    const filterArtists = (artists, query, filters) => {
        return artists.filter(artist => {
            // Filtro por búsqueda
            if (query) {
                const searchTerm = query.toLowerCase();
                const matchesSearch =
                    artist.name.toLowerCase().includes(searchTerm) ||
                    artist.region.toLowerCase().includes(searchTerm) ||
                    artist.technique.toLowerCase().includes(searchTerm) ||
                    artist.bio.toLowerCase().includes(searchTerm);

                if (!matchesSearch) return false;
            }

            // Filtro por región
            if (filters.region && filters.region.length > 0) {
                if (!filters.region.includes(artist.region)) return false;
            }

            // Filtro por técnica
            if (filters.technique && filters.technique.length > 0) {
                if (!filters.technique.includes(artist.technique)) return false;
            }

            return true;
        });
    };

    const getArtworkCountForArtist = (artistId) => {
        return demoArtworks.filter(a => a.artistId === artistId).length;
    };

    const handleViewChange = (newView) => {
        setView(newView);
        setSelectedArtist(null);
    };

    const handleArtistClick = (artistId) => {
        setView('artworks');
        setSelectedArtist(artistId);
    };

    const handleBackFromArtist = () => {
        setSelectedArtist(null);
    };

    return (
        <div className="gallery-container">
            <DemoBanner />

            <div className="gallery-header">
                <h1>MUUA - Galería Virtual</h1>
                <p>Museo de la Universidad de Antioquia</p>
            </div>

            <div className="gallery-controls">
                <SearchBar
                    onSearch={setSearchQuery}
                    placeholder={view === 'artworks' ? 'Buscar obras u artistas...' : 'Buscar artistas...'}
                />

                <div className="view-switcher">
                    <button
                        className={`view-btn ${view === 'artworks' ? 'active' : ''}`}
                        onClick={() => handleViewChange('artworks')}
                    >
                        Obras ({demoArtworks.length})
                    </button>
                    <button
                        className={`view-btn ${view === 'artists' ? 'active' : ''}`}
                        onClick={() => handleViewChange('artists')}
                    >
                        Artistas ({demoArtists.length})
                    </button>
                </div>
            </div>

            <div className="gallery-content">
                <div className="gallery-sidebar">
                    <FilterPanel
                        filters={filters}
                        onFilterChange={setFilters}
                        techniques={filterOptions.techniques}
                        regions={filterOptions.regions}
                        years={filterOptions.years}
                    />
                </div>

                <div className="gallery-main">
                    {selectedArtist && (
                        <div className="artist-detail-header">
                            <button className="back-btn" onClick={handleBackFromArtist}>
                                ← Volver
                            </button>
                            <h2>Obras de {demoArtists.find(a => a.id === selectedArtist)?.name}</h2>
                        </div>
                    )}

                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                            <p>Cargando...</p>
                        </div>
                    ) : (
                        <>
                            <div className="results-info">
                                <p>{filteredData.length} resultados</p>
                            </div>

                            {filteredData.length === 0 ? (
                                <div className="empty-state">
                                    <p>No se encontraron resultados. Intenta modificar tu búsqueda o filtros.</p>
                                </div>
                            ) : (
                                <div className={`gallery-grid ${view}`}>
                                    {view === 'artworks' ? (
                                        Array.isArray(filteredData) && filteredData.map(artwork => (
                                            <ArtworkCard
                                                key={artwork.id}
                                                artwork={artwork}
                                                onArtistClick={handleArtistClick}
                                            />
                                        ))
                                    ) : (
                                        Array.isArray(filteredData) && filteredData.map(artist => (
                                            <ArtistCard
                                                key={artist.id}
                                                artist={artist}
                                                artworkCount={getArtworkCountForArtist(artist.id)}
                                                onClick={() => handleArtistClick(artist.id)}
                                            />
                                        ))
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Gallery;
