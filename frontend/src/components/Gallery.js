import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import ArtworkCard from './ArtworkCard';
import ArtistCard from './ArtistCard';
import ArtworkDetailModal from './ArtworkDetailModal';
import InventarioExcel from './InventarioExcel';
import { filterOptions as demoFilterOptions, getEnrichedArtworks } from '../data/demoData';
import { artworkService, articService, excelService, filterService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { USE_DEMO_FALLBACK } from '../config/env';
import '../styles/Gallery.css';

const cleanStr = (s) => (s || '').trim().replace(/\.+$/, '').trim();

const mapBackendArtwork = (a) => ({
    id: a.id,
    title: a.title,
    artist: a.artist,
    artistId: a.artist?.id,
    technique: cleanStr(a.technique),
    dimensions: a.dimensions,
    year: a.year,
    description: a.description,
    image: a.image,
});

const mapInventarioArtwork = (item) => {
    const artistName = [item.nombre, item.apellido].filter(Boolean).join(' ') || 'Artista desconocido';
    return {
        id: `excel-${item.id}`,
        title: item.titulo || 'Sin título',
        artist: { name: artistName },
        artistId: `name-${artistName}`,
        technique: cleanStr(item.tecnica) || '—',
        dimensions: item.dimensiones || '—',
        year: item.fechaObra || item.anioIngreso || '—',
        description: item.observaciones || item.tema || '',
        image: item.fotoUrl || excelService.getFotoUrl(item.id),
        isExcel: true,
    };
};

const ARTWORKS_PER_PAGE = 12;
const MUSEUM_PAGE_SIZE = 80;

export const Gallery = ({ onUploaded: _onUploaded, onExcelUploaded: _onExcelUploaded }) => {
    const { isLoggedIn, token } = useAuth();
    const [view, setView] = useState('artworks');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({});
    const [filteredData, setFilteredData] = useState([]);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [artworksPage, setArtworksPage] = useState(1);

    const [localArtworks, setLocalArtworks] = useState([]);
    const [artworksLoaded, setArtworksLoaded] = useState(false);

    const derivedArtists = useMemo(() => {
        const map = new Map();
        localArtworks.forEach(a => {
            const key = a.artistId != null ? String(a.artistId) : null;
            if (!key || map.has(key)) return;
            map.set(key, {
                id: a.artistId,
                name: a.artist?.name || 'Artista desconocido',
                technique: a.technique !== '—' ? a.technique : '',
                region: a.artist?.region || '',
                bio: a.artist?.bio || '',
                image: a.artist?.image || null,
            });
        });
        return [...map.values()];
    }, [localArtworks]);

    const [dynamicFilters, setDynamicFilters] = useState(demoFilterOptions);

    useEffect(() => {
        filterService.getFilterOptions()
            .then(data => {
                if (data) {
                    setDynamicFilters({
                        techniques: (data.techniques?.length ? data.techniques : demoFilterOptions.techniques)
                            .map(cleanStr)
                            .filter(Boolean),
                        regions: (data.regions?.length ? data.regions : demoFilterOptions.regions)
                            .map(cleanStr)
                            .filter(Boolean),
                        years: (data.years?.length ? data.years : demoFilterOptions.years).map(String),
                    });
                }
            })
            .catch(() => { /* demoFilterOptions */ });
    }, []);

    useEffect(() => {
        if (!artworksLoaded) return;
        const extraYears = [...new Set(
            localArtworks.map(a => a.year).filter(y => y && y !== '—')
        )];
        setDynamicFilters(prev => ({
            ...prev,
            years: [...new Set([...prev.years, ...extraYears.map(String)])].sort(),
        }));
    }, [localArtworks, artworksLoaded]);

    const [inventario, setInventario] = useState([]);
    const [inventarioLoading, setInventarioLoading] = useState(false);
    const [inventarioError, setInventarioError] = useState(null);

    const [museumLoadProgress, setMuseumLoadProgress] = useState(null);
    const [collectionError, setCollectionError] = useState(null);
    const [collectionNotice, setCollectionNotice] = useState(null);

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

    const [articPage, setArticPage] = useState(1);
    const [articLimit] = useState(12);
    const [articPagination, setArticPagination] = useState(null);
    const [articArtworks, setArticArtworks] = useState([]);
    const [articError, setArticError] = useState(null);

    const loadLocalArtworks = useCallback(async () => {
        setCollectionError(null);
        setCollectionNotice(null);
        setMuseumLoadProgress({ loaded: 0, total: null });

        const MAX_PAGES = 400;

        const fetchMuseumPaged = async () => {
            const aggregated = [];
            let page = 0;
            let last = false;
            let totalElements = null;
            while (!last && page < MAX_PAGES) {
                const data = await artworkService.getPaged({ page, size: MUSEUM_PAGE_SIZE });
                if (!data || !Array.isArray(data.content)) {
                    throw new Error('Invalid paged response');
                }
                if (totalElements === null) {
                    totalElements = data.totalElements ?? null;
                }
                aggregated.push(...data.content.map(mapBackendArtwork));
                setMuseumLoadProgress({ loaded: aggregated.length, total: totalElements });
                last = data.last === true;
                page += 1;
                if (data.content.length === 0) {
                    last = true;
                }
            }
            return aggregated;
        };

        const fetchMuseumAllFallback = async () => {
            const all = await artworkService.getAll();
            return Array.isArray(all) ? all.map(mapBackendArtwork) : [];
        };

        const museumPromise = (async () => {
            try {
                return { ok: true, v: await fetchMuseumPaged() };
            } catch (e) {
                console.warn('[Gallery] /artworks/paged falló, reintentando con GET /artworks', e);
                try {
                    const v = await fetchMuseumAllFallback();
                    return { ok: true, v };
                } catch (e2) {
                    console.warn('[Gallery] GET /artworks falló', e2);
                    return { ok: false };
                }
            }
        })();

        const excelPromise = excelService.getAll()
            .then(v => ({ ok: true, v }))
            .catch(() => ({ ok: false }));

        try {
            const [museumRes, excelRes] = await Promise.all([museumPromise, excelPromise]);

            let base = [];
            if (museumRes.ok) {
                base = museumRes.v;
            } else if (USE_DEMO_FALLBACK) {
                base = getEnrichedArtworks();
                if (process.env.NODE_ENV === 'development') {
                    console.info('[MUUA] API del museo no disponible — mostrando datos de demostración.');
                } else {
                    setCollectionNotice('Colección de demostración: el API no respondió.');
                }
            } else {
                setCollectionError('Sin conexión al API del museo. Activa REACT_APP_USE_DEMO_FALLBACK=true en el build o configura el backend.');
            }

            const excelArtworks =
                excelRes.ok && Array.isArray(excelRes.v) ? excelRes.v.map(mapInventarioArtwork) : [];

            if (excelRes.ok && Array.isArray(excelRes.v)) {
                setInventario(excelRes.v);
            }

            setLocalArtworks([...base, ...excelArtworks]);
        } finally {
            setMuseumLoadProgress(null);
            setArtworksLoaded(true);
        }
    }, []);

    useEffect(() => {
        loadLocalArtworks();
    }, [loadLocalArtworks]);

    const handleUploaded = useCallback((newArtwork) => {
        setLocalArtworks(prev => [mapBackendArtwork(newArtwork), ...prev]);
        setView('artworks');
    }, []);

    useEffect(() => {
        if (_onUploaded) _onUploaded(handleUploaded);
    }, [_onUploaded, handleUploaded]);

    const handleExcelUploaded = useCallback(() => {
        setView('inventario');
        loadInventario();
        loadLocalArtworks();
    }, [loadInventario, loadLocalArtworks]);

    useEffect(() => {
        if (_onExcelUploaded) _onExcelUploaded(handleExcelUploaded);
    }, [_onExcelUploaded, handleExcelUploaded]);

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

    useEffect(() => {
        if (view === 'artic' || !artworksLoaded) return;
        setLoading(true);
        const timer = setTimeout(() => {
            let result = [];
            try {
                if (view === 'artworks') {
                    result = filterArtworks(localArtworks, searchQuery, filters, selectedArtist);
                } else {
                    result = filterArtists(derivedArtists, searchQuery, filters);
                }
                if (!Array.isArray(result)) result = [];
            } catch {
                result = [];
            }
            setFilteredData(result);
            setArtworksPage(1);
            setLoading(false);
        }, 250);
        return () => clearTimeout(timer);
    }, [searchQuery, filters, view, selectedArtist, localArtworks, artworksLoaded, derivedArtists]);

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
            if (filters.year?.length && !filters.year.some(y => String(y) === String(a.year))) return false;
            return true;
        });

    const filterArtists = (artists, query, filters) =>
        artists.filter(a => {
            if (query) {
                const t = query.toLowerCase();
                if (!((a.name || '').toLowerCase().includes(t) ||
                    (a.region || '').toLowerCase().includes(t) ||
                    (a.technique || '').toLowerCase().includes(t) ||
                    (a.bio || '').toLowerCase().includes(t))) return false;
            }
            if (filters.region?.length && !filters.region.includes(a.region)) return false;
            if (filters.technique?.length && !filters.technique.includes(a.technique)) return false;
            return true;
        });

    const getArtworkCountForArtist = (artistId) =>
        localArtworks.filter(a => String(a.artistId) === String(artistId)).length;

    const handleViewChange = (newView) => {
        setView(newView);
        setSelectedArtist(null);
        setArtworksPage(1);
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

    const handleExcelDelete = useCallback(async (id) => {
        try {
            await excelService.deleteById(id, token);
            setInventario(prev => prev.filter(o => o.id !== id));
            setLocalArtworks(prev => prev.filter(a => a.id !== `excel-${id}`));
        } catch {
            alert('No se pudo eliminar la obra del inventario.');
        }
    }, [token]);

    const handleExcelUpdate = useCallback((updated) => {
        setInventario(prev => prev.map(o => o.id === updated.id ? updated : o));
        setLocalArtworks(prev => prev.map(a =>
            a.id === `excel-${updated.id}` ? mapInventarioArtwork(updated) : a
        ));
    }, []);

    useEffect(() => {
        if (!isLoggedIn && view === 'inventario') setView('artworks');
    }, [isLoggedIn, view]);

    const artworksTotalPages = Math.ceil(filteredData.length / ARTWORKS_PER_PAGE);
    const pagedArtworks = filteredData.slice((artworksPage - 1) * ARTWORKS_PER_PAGE, artworksPage * ARTWORKS_PER_PAGE);

    const scrollToCollection = () => {
        document.getElementById('coleccion')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const clearSearchAndFilters = () => {
        setSearchQuery('');
        setFilters({});
    };

    return (
        <div className="gallery-container">
            <header className="gallery-header" role="banner">
                <div className="gallery-header__overlay" aria-hidden />
                <div className="gallery-header__inner">
                    <span className="gallery-header__badge">Museo Universidad de Antioquia</span>
                    <h1 className="gallery-header__title">Colección de artes visuales</h1>
                    <p className="gallery-header__lead">
                        Explora obras y artistas, filtra por técnica y procedencia y descubre piezas locales e internacionales — todo en una sola experiencia.
                    </p>
                    <button type="button" className="gallery-header__cta" onClick={scrollToCollection}>
                        Explorar colección
                    </button>
                </div>
            </header>

            <section id="coleccion" className="gallery-controls" aria-labelledby="gallery-main-heading">
                <h2 id="gallery-main-heading" className="visually-hidden">
                    Búsqueda y vistas de la colección
                </h2>
                <SearchBar
                    onSearch={setSearchQuery}
                    placeholder={view === 'artists' ? 'Buscar artistas por nombre o región...' : 'Buscar por título, artista o técnica...'}
                />
                <div className="view-switcher" role="tablist" aria-label="Cambiar vista de la galería">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={view === 'artworks'}
                        aria-controls="gallery-main-panel"
                        id="tab-artworks"
                        className={`view-btn ${view === 'artworks' ? 'active' : ''}`}
                        onClick={() => handleViewChange('artworks')}
                    >
                        <span className="view-btn__label">Obras</span>
                        <span className="view-btn__count">{localArtworks.length}</span>
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={view === 'artists'}
                        aria-controls="gallery-main-panel"
                        id="tab-artists"
                        className={`view-btn ${view === 'artists' ? 'active' : ''}`}
                        onClick={() => handleViewChange('artists')}
                    >
                        <span className="view-btn__label">Artistas</span>
                        <span className="view-btn__count">{derivedArtists.length}</span>
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={view === 'artic'}
                        aria-controls="gallery-main-panel"
                        id="tab-artic"
                        className={`view-btn ${view === 'artic' ? 'active' : ''}`}
                        onClick={() => handleViewChange('artic')}
                    >
                        Art Institute
                    </button>
                    {isLoggedIn && (
                        <button
                            type="button"
                            role="tab"
                            aria-selected={view === 'inventario'}
                            aria-controls="gallery-main-panel"
                            id="tab-inventario"
                            className={`view-btn ${view === 'inventario' ? 'active' : ''}`}
                            onClick={() => handleViewChange('inventario')}
                        >
                            <span className="view-btn__label">Inventario</span>
                            {inventario.length > 0 && <span className="view-btn__count">{inventario.length}</span>}
                        </button>
                    )}
                </div>
            </section>

            {(collectionError || collectionNotice || museumLoadProgress) && (
                <div className="gallery-notices gallery-container__notices" role="region" aria-label="Estado de carga de la colección">
                    {collectionError && (
                        <p className="gallery-alert gallery-alert--error" role="alert">
                            {collectionError}
                        </p>
                    )}
                    {collectionNotice && (
                        <p className="gallery-alert gallery-alert--demo" role="status">
                            {collectionNotice}
                        </p>
                    )}
                    {museumLoadProgress && (
                        <p className="gallery-alert gallery-alert--info" aria-live="polite">
                            Cargando colección del museo…{' '}
                            {museumLoadProgress.total != null
                                ? `${museumLoadProgress.loaded.toLocaleString()} / ${museumLoadProgress.total.toLocaleString()}`
                                : `${museumLoadProgress.loaded.toLocaleString()} obras`}
                        </p>
                    )}
                </div>
            )}

            <div className="gallery-content" role="main">
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

                <div
                    id="gallery-main-panel"
                    role="tabpanel"
                    aria-labelledby={`tab-${view === 'inventario' ? 'inventario' : view === 'artic' ? 'artic' : view}`}
                    className={`gallery-main ${view === 'artic' || view === 'inventario' ? 'gallery-main--full' : ''}`}
                >
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
                                token={token}
                                onDelete={handleExcelDelete}
                                onUpdate={handleExcelUpdate}
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
                                <div className="loading">
                                    <div className="spinner spinner--lg" aria-hidden />
                                    <p>Cargando obras del Art Institute…</p>
                                </div>
                            ) : articError ? (
                                <div className="empty-state empty-state--error">
                                    <p className="empty-state__title">No pudimos cargar esta sección</p>
                                    <p className="empty-state__hint">{articError}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="gallery-grid artworks">
                                        {articArtworks.map(artwork => (
                                            <ArtworkCard key={artwork.id} artwork={artwork} onClick={() => setSelectedArtwork(artwork)} onDelete={isLoggedIn ? handleDelete : undefined} />
                                        ))}
                                    </div>
                                    {articPagination && (
                                        <div className="pagination">
                                            <button type="button" className="pagination-btn" onClick={() => handleArticPageChange(articPage - 1)} disabled={articPage <= 1}>
                                                ← Anterior
                                            </button>
                                            <span className="pagination-info">
                                                Página {articPagination.currentPage ?? articPage} de {(articPagination.totalPages ?? 0).toLocaleString()}
                                            </span>
                                            <button type="button" className="pagination-btn" onClick={() => handleArticPageChange(articPage + 1)} disabled={articPage >= (articPagination.totalPages ?? Infinity)}>
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
                                    <button type="button" className="back-btn" onClick={() => setSelectedArtist(null)}>
                                        ← Volver a artistas
                                    </button>
                                    <h2>Obras de {derivedArtists.find(a => String(a.id) === String(selectedArtist))?.name}</h2>
                                </div>
                            )}

                            {loading ? (
                                <div className="loading">
                                    <div className="spinner spinner--lg" aria-hidden />
                                    <p>Preparando resultados…</p>
                                </div>
                            ) : (
                                <>
                                    <div className="results-info">
                                        <span className="results-info__pill" aria-live="polite">
                                            {filteredData.length} resultado{filteredData.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    {filteredData.length === 0 ? (
                                        <div className="empty-state">
                                            <div className="empty-state__icon" aria-hidden />
                                            <p className="empty-state__title">Nada coincide con tu búsqueda</p>
                                            <p className="empty-state__hint">
                                                Prueba otras palabras o quita algunos filtros para ver más piezas de la colección.
                                            </p>
                                            {(searchQuery || Object.values(filters).some(v => (Array.isArray(v) ? v.length > 0 : v))) && (
                                                <button type="button" className="empty-state__cta" onClick={clearSearchAndFilters}>
                                                    Limpiar búsqueda y filtros
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <div className={`gallery-grid ${view}`}>
                                                {view === 'artworks'
                                                    ? pagedArtworks.map(artwork => (
                                                        <ArtworkCard
                                                            key={artwork.id}
                                                            artwork={artwork}
                                                            onArtistClick={(id) => { setView('artworks'); setSelectedArtist(id); }}
                                                            onClick={() => setSelectedArtwork(artwork)}
                                                            onDelete={isLoggedIn && !artwork.isExcel ? handleDelete : undefined}
                                                        />
                                                    ))
                                                    : pagedArtworks.map(artist => (
                                                        <ArtistCard
                                                            key={artist.id}
                                                            artist={artist}
                                                            artworkCount={getArtworkCountForArtist(artist.id)}
                                                            onClick={() => { setView('artworks'); setSelectedArtist(artist.id); }}
                                                        />
                                                    ))
                                                }
                                            </div>
                                            {artworksTotalPages > 1 && (
                                                <div className="pagination">
                                                    <button type="button" className="pagination-btn" onClick={() => { setArtworksPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={artworksPage <= 1}>
                                                        ← Anterior
                                                    </button>
                                                    <span className="pagination-info">
                                                        Página {artworksPage} de {artworksTotalPages}
                                                    </span>
                                                    <button type="button" className="pagination-btn" onClick={() => { setArtworksPage(p => Math.min(artworksTotalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={artworksPage >= artworksTotalPages}>
                                                        Siguiente →
                                                    </button>
                                                </div>
                                            )}
                                        </>
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
