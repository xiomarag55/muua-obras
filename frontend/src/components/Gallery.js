import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import ArtworkCard from './ArtworkCard';
import ArtistCard from './ArtistCard';
import DemoBanner from './DemoBanner';
import ArtworkDetailModal from './ArtworkDetailModal';
import InventarioExcel from './InventarioExcel';
import { demoArtists, filterOptions as demoFilterOptions, getEnrichedArtworks } from '../data/demoData';
import { artworkService, articService, excelService, filterService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import '../styles/Gallery.css';

const mapBackendArtwork = (a) => ({
    id: a.id,
    title: a.title,
    artist: a.artist,
    artistId: a.artist?.id,
    technique: a.technique,
    dimensions: a.dimensions,
    year: a.year,
    description: a.description,
    image: a.image,
});

const mapInventarioArtwork = (item) => ({
    id: `excel-${item.id}`,
    title: item.titulo || 'Sin título',
    artist: {
        name: [item.nombre, item.apellido].filter(Boolean).join(' ') || 'Artista desconocido',
    },
    technique: item.tecnica || '—',
    dimensions: item.dimensiones || '—',
    year: item.fechaObra || item.anioIngreso || '—',
    description: item.observaciones || item.tema || '',
    image: item.fotoUrl || excelService.getFotoUrl(item.id),
    isExcel: true,
});

export const Gallery = ({ onUploaded: _onUploaded, onExcelUploaded: _onExcelUploaded }) => {
    const { isLoggedIn, token } = useAuth();
    const [view, setView] = useState('artworks');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({});
    const [filteredData, setFilteredData] = useState([]);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedArtwork, setSelectedArtwork] = useState(null);

    // Obras de la pestaña "Obras" (backend + fallback demo)
    const [localArtworks, setLocalArtworks] = useState([]);
    const [artworksLoaded, setArtworksLoaded] = useState(false);

    // Opciones de filtro dinámicas (backend + demo fallback)
    const [dynamicFilters, setDynamicFilters] = useState(demoFilterOptions);

    useEffect(() => {
        filterService.getFilterOptions()
            .then(data => {
                if (data) {
                    setDynamicFilters({
                        techniques: data.techniques || demoFilterOptions.techniques,
                        regions: data.regions || demoFilterOptions.regions,
                        years: (data.years || demoFilterOptions.years).map(String),
                    });
                }
            })
            .catch(() => { /* usa demoFilterOptions como fallback */ });
    }, []);

    // Inventario Excel
    const [inventario, setInventario] = useState([]);
    const [inventarioLoading, setInventarioLoading] = useState(false);
    const [inventarioError, setInventarioError] = useState(null);

    const loadInventario = useCallback(async () => {
        setInventarioLoading(true);
        setInventarioError(null);
        try {
            const data = await excelService.getAll();
            setInventario(Array.isArray(data) ? data : []);
        } catch {
            setInventarioError('No se pudo cargar el inventario. Verifica que el backend esté corriendo.');
        } finally {
            setInventarioLoading(false);
        }
    }, []);

    useEffect(() => {
        if (view === 'inventario') loadInventario();
    }, [view, loadInventario]);

    // Paginación Art Institute
    const [articPage, setArticPage] = useState(1);
    const [articLimit] = useState(12);
    const [articPagination, setArticPagination] = useState(null);
    const [articArtworks, setArticArtworks] = useState([]);
    const [articError, setArticError] = useState(null);

    // Carga obras del backend + inventario Excel; si el backend falla usa demo data
    const loadLocalArtworks = useCallback(async () => {
        try {
            const [artworkResult, excelResult] = await Promise.allSettled([
                artworkService.getAll(),
                excelService.getAll(),
            ]);

            const base =
                artworkResult.status === 'fulfilled' &&
                Array.isArray(artworkResult.value) &&
                artworkResult.value.length > 0
                    ? artworkResult.value.map(mapBackendArtwork)
                    : getEnrichedArtworks();

            const excelArtworks =
                excelResult.status === 'fulfilled' && Array.isArray(excelResult.value)
                    ? excelResult.value.map(mapInventarioArtwork)
                    : [];

            if (excelResult.status === 'fulfilled' && Array.isArray(excelResult.value)) {
                setInventario(excelResult.value);
            }

            setLocalArtworks([...base, ...excelArtworks]);
        } catch {
            setLocalArtworks(getEnrichedArtworks());
        } finally {
            setArtworksLoaded(true);
        }
    }, []);

    useEffect(() => {
        loadLocalArtworks();
    }, [loadLocalArtworks]);

    // Expone función para que Navbar pueda notificar nueva obra subida
    const handleUploaded = useCallback((newArtwork) => {
        setLocalArtworks(prev => [mapBackendArtwork(newArtwork), ...prev]);
        setView('artworks');
    }, []);

    // Expone handleUploaded para App.js → Navbar
    useEffect(() => {
        if (_onUploaded) _onUploaded(handleUploaded);
    }, [_onUploaded, handleUploaded]);

    // Expone refresh de inventario Excel para App.js → Navbar
    const handleExcelUploaded = useCallback(() => {
        setView('inventario');
        loadInventario();
        loadLocalArtworks(); // refresca también la pestaña Obras
    }, [loadInventario, loadLocalArtworks]);

    useEffect(() => {
        if (_onExcelUploaded) _onExcelUploaded(handleExcelUploaded);
    }, [_onExcelUploaded, handleExcelUploaded]);

    // Art Institute
    const loadArticArtworks = useCallback(async (page) => {
        setLoading(true);
        setArticError(null);
        try {
            const response = await articService.getArtworks(page, articLimit);
            setArticArtworks((response.data || []).map(mapArticArtwork));
            setArticPagination(response.pagination);
        } catch {
            setArticError('No se pudieron cargar las obras. Verifica que el backend esté corriendo.');
        } finally {
            setLoading(false);
        }
    }, [articLimit]);

    useEffect(() => {
        if (view === 'artic') loadArticArtworks(articPage);
    }, [view, articPage, loadArticArtworks]);

    const mapArticArtwork = (item) => ({
        id: `artic-${item.id}`,
        title: item.title || 'Sin título',
        artist: { name: item.artistDisplay || 'Artista desconocido' },
        technique: item.mediumDisplay || '—',
        dimensions: item.dimensions || '—',
        year: item.dateDisplay || '—',
        description: item.description ? item.description.replace(/<[^>]*>/g, '').trim() : '',
        image: item.imageUrl || null,
    });

    // Filtrado local
    useEffect(() => {
        if (view === 'artic' || !artworksLoaded) return;
        setLoading(true);
        const timer = setTimeout(() => {
            let result = [];
            try {
                if (view === 'artworks') {
                    result = filterArtworks(localArtworks, searchQuery, filters, selectedArtist);
                } else {
                    result = filterArtists(demoArtists, searchQuery, filters);
                }
                if (!Array.isArray(result)) result = [];
            } catch {
                result = [];
            }
            setFilteredData(result);
            setLoading(false);
        }, 250);
        return () => clearTimeout(timer);
    }, [searchQuery, filters, view, selectedArtist, localArtworks, artworksLoaded]);

    const filterArtworks = (artworks, query, filters, artistId) =>
        artworks.filter(a => {
            if (query) {
                const t = query.toLowerCase();
                if (!(a.title?.toLowerCase().includes(t) ||
                    (a.artist?.name || '').toLowerCase().includes(t) ||
                    (a.technique || '').toLowerCase().includes(t) ||
                    (a.description || '').toLowerCase().includes(t))) return false;
            }
            if (artistId && a.artistId !== artistId) return false;
            if (filters.technique?.length && !filters.technique.includes(a.technique)) return false;
            if (filters.year?.length && !filters.year.includes(a.year)) return false;
            return true;
        });

    const filterArtists = (artists, query, filters) =>
        artists.filter(a => {
            if (query) {
                const t = query.toLowerCase();
                if (!(a.name.toLowerCase().includes(t) ||
                    a.region.toLowerCase().includes(t) ||
                    a.technique.toLowerCase().includes(t) ||
                    a.bio.toLowerCase().includes(t))) return false;
            }
            if (filters.region?.length && !filters.region.includes(a.region)) return false;
            if (filters.technique?.length && !filters.technique.includes(a.technique)) return false;
            return true;
        });

    const getArtworkCountForArtist = (artistId) =>
        localArtworks.filter(a => a.artistId === artistId).length;

    const handleViewChange = (newView) => {
        setView(newView);
        setSelectedArtist(null);
        if (newView === 'artic') setArticPage(1);
    };

    const handleArticPageChange = (page) => {
        setArticPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = useCallback(async (id) => {
        try {
            await artworkService.delete(id, token);
            setLocalArtworks(prev => prev.filter(a => a.id !== id));
        } catch {
            alert('No se pudo eliminar la obra. Intenta de nuevo.');
        }
    }, [token]);

    return (
        <div className="gallery-container">
            <DemoBanner />

            <div className="gallery-header">
                <h1>Colección de artes visuales</h1>
                <p>Museo de la Universidad de Antioquia</p>
            </div>

            <div className="gallery-controls">
                <SearchBar
                    onSearch={setSearchQuery}
                    placeholder={view === 'artists' ? 'Buscar artistas...' : 'Buscar obras...'}
                />
                <div className="view-switcher">
                    <button className={`view-btn ${view === 'artworks' ? 'active' : ''}`} onClick={() => handleViewChange('artworks')}>
                        Obras ({localArtworks.length})
                    </button>
                    <button className={`view-btn ${view === 'artists' ? 'active' : ''}`} onClick={() => handleViewChange('artists')}>
                        Artistas ({demoArtists.length})
                    </button>
                    <button className={`view-btn ${view === 'artic' ? 'active' : ''}`} onClick={() => handleViewChange('artic')}>
                        Art Institute
                    </button>
                    <button className={`view-btn ${view === 'inventario' ? 'active' : ''}`} onClick={() => handleViewChange('inventario')}>
                        Inventario {inventario.length > 0 ? `(${inventario.length})` : ''}
                    </button>
                </div>
            </div>

            <div className="gallery-content">
                {view !== 'artic' && view !== 'inventario' && (
                    <div className="gallery-sidebar">
                        <FilterPanel
                            filters={filters}
                            onFilterChange={setFilters}
                            techniques={dynamicFilters.techniques}
                            regions={dynamicFilters.regions}
                            years={dynamicFilters.years}
                        />
                    </div>
                )}

                <div className={`gallery-main ${view === 'artic' || view === 'inventario' ? 'gallery-main--full' : ''}`}>
                    {view === 'inventario' ? (
                        <>
                            <div className="artic-header">
                                <h2>Inventario MUUA</h2>
                                <p className="artic-total">Obras cargadas desde Excel</p>
                            </div>
                            <InventarioExcel
                                obras={inventario}
                                loading={inventarioLoading}
                                error={inventarioError}
                            />
                        </>
                    ) : view === 'artic' ? (
                        <>
                            <div className="artic-header">
                                <h2>Art Institute of Chicago</h2>
                                {articPagination && (
                                    <p className="artic-total">{(articPagination.total ?? 0).toLocaleString()} obras en total</p>
                                )}
                            </div>

                            {loading ? (
                                <div className="loading"><div className="spinner" /><p>Cargando obras...</p></div>
                            ) : articError ? (
                                <div className="empty-state"><p>{articError}</p></div>
                            ) : (
                                <>
                                    <div className="gallery-grid artworks">
                                        {articArtworks.map(artwork => (
                                            <ArtworkCard key={artwork.id} artwork={artwork} onClick={() => setSelectedArtwork(artwork)} onDelete={isLoggedIn ? handleDelete : undefined} />
                                        ))}
                                    </div>
                                    {articPagination && (
                                        <div className="pagination">
                                            <button className="pagination-btn" onClick={() => handleArticPageChange(articPage - 1)} disabled={articPage <= 1}>
                                                ← Anterior
                                            </button>
                                            <span className="pagination-info">
                                                Página {articPagination.currentPage ?? articPage} de {(articPagination.totalPages ?? 0).toLocaleString()}
                                            </span>
                                            <button className="pagination-btn" onClick={() => handleArticPageChange(articPage + 1)} disabled={articPage >= (articPagination.totalPages ?? Infinity)}>
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
                                    <button className="back-btn" onClick={() => setSelectedArtist(null)}>← Volver</button>
                                    <h2>Obras de {demoArtists.find(a => a.id === selectedArtist)?.name}</h2>
                                </div>
                            )}

                            {loading ? (
                                <div className="loading"><div className="spinner" /><p>Cargando...</p></div>
                            ) : (
                                <>
                                    <div className="results-info">
                                        <p>{filteredData.length} resultado{filteredData.length !== 1 ? 's' : ''}</p>
                                    </div>
                                    {filteredData.length === 0 ? (
                                        <div className="empty-state">
                                            <p>No se encontraron resultados.</p>
                                        </div>
                                    ) : (
                                        <div className={`gallery-grid ${view}`}>
                                            {view === 'artworks'
                                                ? filteredData.map(artwork => (
                                                    <ArtworkCard
                                                        key={artwork.id}
                                                        artwork={artwork}
                                                        onArtistClick={(id) => { setView('artworks'); setSelectedArtist(id); }}
                                                        onClick={() => setSelectedArtwork(artwork)}
                                                        onDelete={isLoggedIn && !artwork.isExcel ? handleDelete : undefined}
                                                    />
                                                ))
                                                : filteredData.map(artist => (
                                                    <ArtistCard
                                                        key={artist.id}
                                                        artist={artist}
                                                        artworkCount={getArtworkCountForArtist(artist.id)}
                                                        onClick={() => { setView('artworks'); setSelectedArtist(artist.id); }}
                                                    />
                                                ))
                                            }
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {selectedArtwork && <ArtworkDetailModal artwork={selectedArtwork} onClose={() => setSelectedArtwork(null)} />}
        </div>
    );
};

export default Gallery;
