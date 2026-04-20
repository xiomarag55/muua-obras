/**
 * Componente Gallery
 * Galería principal que muestra artistas y obras con búsqueda y filtros
 */

import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import ArtworkCard from './ArtworkCard';
import ArtistCard from './ArtistCard';
import DemoBanner from './DemoBanner';
import { demoArtists, demoArtworks, filterOptions, getEnrichedArtworks } from '../data/demoData';
import { articService } from '../services/apiService';
import '../styles/Gallery.css';

export const Gallery = () => {
    const [view, setView] = useState('artworks'); // 'artworks', 'artists', 'artic'
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({});
    const [filteredData, setFilteredData] = useState([]);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [loading, setLoading] = useState(false);

    // Estado de paginación para la API externa
    const [articPage, setArticPage] = useState(1);
    const [articLimit] = useState(12);
    const [articPagination, setArticPagination] = useState(null);
    const [articArtworks, setArticArtworks] = useState([]);
    const [articError, setArticError] = useState(null);

    // Carga obras de Art Institute con paginación
    const loadArticArtworks = useCallback(async (page) => {
        setLoading(true);
        setArticError(null);
        try {
            const response = await articService.getArtworks(page, articLimit);
            const mapped = (response.data || []).map(mapArticArtwork);
            setArticArtworks(mapped);
            setArticPagination(response.pagination);
        } catch (err) {
            setArticError('No se pudieron cargar las obras. Verifica que el backend esté corriendo.');
        } finally {
            setLoading(false);
        }
    }, [articLimit]);

    useEffect(() => {
        if (view === 'artic') {
            loadArticArtworks(articPage);
        }
    }, [view, articPage, loadArticArtworks]);

    // Mapea un artwork de la API de Art Institute al formato esperado por ArtworkCard
    const mapArticArtwork = (item) => ({
        id: item.id,
        title: item.title || 'Sin título',
        artist: { name: item.artistDisplay || 'Artista desconocido' },
        technique: item.mediumDisplay || 'Técnica desconocida',
        dimensions: item.dimensions || '—',
        year: item.dateDisplay || '—',
        description: item.description ? stripHtml(item.description) : '',
        image: item.imageUrl || null,
    });

    const stripHtml = (html) => {
        if (!html) return '';
        return html.replace(/<[^>]*>/g, '').trim();
    };

    // Efecto para filtrar datos locales cuando cambia la búsqueda o los filtros
    useEffect(() => {
        if (view === 'artic') return;
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

                if (!Array.isArray(result)) {
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
            if (query) {
                const searchTerm = query.toLowerCase();
                const matchesSearch =
                    artwork.title.toLowerCase().includes(searchTerm) ||
                    (artwork.artist?.name || '').toLowerCase().includes(searchTerm) ||
                    artwork.technique.toLowerCase().includes(searchTerm) ||
                    artwork.description.toLowerCase().includes(searchTerm);

                if (!matchesSearch) return false;
            }

            if (artistId && artwork.artistId !== artistId) return false;

            if (filters.technique && filters.technique.length > 0) {
                if (!filters.technique.includes(artwork.technique)) return false;
            }

            if (filters.year && filters.year.length > 0) {
                if (!filters.year.includes(artwork.year)) return false;
            }

            return true;
        });
    };

    const filterArtists = (artists, query, filters) => {
        return artists.filter(artist => {
            if (query) {
                const searchTerm = query.toLowerCase();
                const matchesSearch =
                    artist.name.toLowerCase().includes(searchTerm) ||
                    artist.region.toLowerCase().includes(searchTerm) ||
                    artist.technique.toLowerCase().includes(searchTerm) ||
                    artist.bio.toLowerCase().includes(searchTerm);

                if (!matchesSearch) return false;
            }

            if (filters.region && filters.region.length > 0) {
                if (!filters.region.includes(artist.region)) return false;
            }

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
        if (newView === 'artic') setArticPage(1);
    };

    const handleArtistClick = (artistId) => {
        setView('artworks');
        setSelectedArtist(artistId);
    };

    const handleBackFromArtist = () => {
        setSelectedArtist(null);
    };

    const handleArticPageChange = (newPage) => {
        setArticPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                    <button
                        className={`view-btn ${view === 'artic' ? 'active' : ''}`}
                        onClick={() => handleViewChange('artic')}
                    >
                        Art Institute
                    </button>
                </div>
            </div>

            <div className="gallery-content">
                {view !== 'artic' && (
                    <div className="gallery-sidebar">
                        <FilterPanel
                            filters={filters}
                            onFilterChange={setFilters}
                            techniques={filterOptions.techniques}
                            regions={filterOptions.regions}
                            years={filterOptions.years}
                        />
                    </div>
                )}

                <div className={`gallery-main ${view === 'artic' ? 'gallery-main--full' : ''}`}>
                    {view === 'artic' ? (
                        <>
                            <div className="artic-header">
                                <h2>Art Institute of Chicago</h2>
                                {articPagination && (
                                    <p className="artic-total">
                                        {(articPagination.total ?? 0).toLocaleString()} obras en total
                                    </p>
                                )}
                            </div>

                            {loading ? (
                                <div className="loading">
                                    <div className="spinner"></div>
                                    <p>Cargando obras...</p>
                                </div>
                            ) : articError ? (
                                <div className="empty-state">
                                    <p>{articError}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="gallery-grid artworks">
                                        {articArtworks.map(artwork => (
                                            <ArtworkCard
                                                key={artwork.id}
                                                artwork={artwork}
                                            />
                                        ))}
                                    </div>

                                    {articPagination && (
                                        <div className="pagination">
                                            <button
                                                className="pagination-btn"
                                                onClick={() => handleArticPageChange(articPage - 1)}
                                                disabled={articPage <= 1}
                                            >
                                                ← Anterior
                                            </button>

                                            <span className="pagination-info">
                                                Página {articPagination.currentPage ?? articPage} de {(articPagination.totalPages ?? 0).toLocaleString()}
                                            </span>

                                            <button
                                                className="pagination-btn"
                                                onClick={() => handleArticPageChange(articPage + 1)}
                                                disabled={articPage >= (articPagination.totalPages ?? Infinity)}
                                            >
                                                Siguiente →
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Gallery;
