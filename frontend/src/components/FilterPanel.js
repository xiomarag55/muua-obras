/**
 * Panel de filtros — UX tipo e-commerce / galerías culturales
 */

import React, { useState, useCallback, useMemo, useId } from 'react';
import {
    FiChevronDown,
    FiFilter,
    FiLayers,
    FiMapPin,
    FiCalendar,
    FiX,
    FiSearch,
    FiMaximize2,
    FiMinimize2,
} from 'react-icons/fi';
import '../styles/FilterPanel.css';

const countActiveIn = (filters, key) => {
    const v = filters[key];
    return Array.isArray(v) ? v.length : v ? 1 : 0;
};

const selectionIncludes = (arr, value) =>
    Array.isArray(arr) && arr.some(x => String(x) === String(value));

export const FilterPanel = ({
    filters = {},
    onFilterChange,
    techniques = [],
    regions = [],
    years = []
}) => {
    const baseId = useId();
    const [expandedSections, setExpandedSections] = useState({
        technique: true,
        region: true,
        year: false,
    });
    const [queryTech, setQueryTech] = useState('');
    const [queryRegion, setQueryRegion] = useState('');
    const [queryYear, setQueryYear] = useState('');

    const allExpanded = expandedSections.technique && expandedSections.region && expandedSections.year;
    const allCollapsed =
        !expandedSections.technique && !expandedSections.region && !expandedSections.year;

    const toggleSection = useCallback(section => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    }, []);

    const expandAll = useCallback(() => {
        setExpandedSections({ technique: true, region: true, year: true });
    }, []);

    const collapseAll = useCallback(() => {
        setExpandedSections({ technique: false, region: false, year: false });
    }, []);

    const handleFilterChange = useCallback((filterType, value) => {
        const currentFilter = filters[filterType] || [];
        let newFilter;

        if (Array.isArray(currentFilter)) {
            const has = currentFilter.some(x => String(x) === String(value));
            if (has) {
                newFilter = currentFilter.filter(item => String(item) !== String(value));
            } else {
                newFilter = [...currentFilter, value];
            }
        } else {
            newFilter = currentFilter === value ? null : value;
        }

        onFilterChange({
            ...filters,
            [filterType]: newFilter,
        });
    }, [filters, onFilterChange]);

    const clearSection = useCallback(
        filterType => {
            onFilterChange({
                ...filters,
                [filterType]: [],
            });
        },
        [filters, onFilterChange]
    );

    const selectAllVisible = useCallback(
        (filterType, visibleValues) => {
            const cur = filters[filterType] || [];
            const merged = [...(Array.isArray(cur) ? cur : [])];
            visibleValues.forEach(v => {
                if (!merged.some(x => String(x) === String(v))) merged.push(v);
            });
            onFilterChange({
                ...filters,
                [filterType]: merged,
            });
        },
        [filters, onFilterChange]
    );

    const handleClearFilters = useCallback(() => {
        setQueryTech('');
        setQueryRegion('');
        setQueryYear('');
        onFilterChange({});
    }, [onFilterChange]);

    const removeChip = useCallback(
        (filterType, value) => {
            const arr = filters[filterType];
            if (!Array.isArray(arr)) return;
            onFilterChange({
                ...filters,
                [filterType]: arr.filter(x => String(x) !== String(value)),
            });
        },
        [filters, onFilterChange]
    );

    const hasActiveFilters = Object.values(filters).some(value =>
        Array.isArray(value) ? value.length > 0 : value
    );

    const totalActive = useMemo(
        () =>
            countActiveIn(filters, 'technique') +
            countActiveIn(filters, 'region') +
            countActiveIn(filters, 'year'),
        [filters]
    );

    const filteredTechniques = useMemo(() => {
        const q = queryTech.trim().toLowerCase();
        if (!q) return techniques;
        return techniques.filter(t => (t || '').toLowerCase().includes(q));
    }, [techniques, queryTech]);

    const filteredRegions = useMemo(() => {
        const q = queryRegion.trim().toLowerCase();
        if (!q) return regions;
        return regions.filter(r => (r || '').toLowerCase().includes(q));
    }, [regions, queryRegion]);

    const filteredYears = useMemo(() => {
        const q = queryYear.trim().toLowerCase();
        if (!q) return years;
        return years.filter(y => String(y).toLowerCase().includes(q));
    }, [years, queryYear]);

    const techCount = countActiveIn(filters, 'technique');
    const regionCount = countActiveIn(filters, 'region');
    const yearCount = countActiveIn(filters, 'year');

    const activeChips = useMemo(() => {
        const chips = [];
        (filters.technique || []).forEach(v =>
            chips.push({
                key: `t-${v}`,
                type: 'technique',
                value: v,
                label: v,
                short: 'Téc.',
                chipClass: 'filter-chip--technique',
            })
        );
        (filters.region || []).forEach(v =>
            chips.push({
                key: `r-${v}`,
                type: 'region',
                value: v,
                label: v,
                short: 'Reg.',
                chipClass: 'filter-chip--region',
            })
        );
        (filters.year || []).forEach(v =>
            chips.push({
                key: `y-${v}`,
                type: 'year',
                value: v,
                label: String(v),
                short: 'Año',
                chipClass: 'filter-chip--year',
            })
        );
        return chips;
    }, [filters]);

    const needsSearchTech = techniques.length >= 5;
    const needsSearchRegion = regions.length >= 5;
    const needsSearchYear = years.length >= 5;

    const renderSectionFooter = (filterType, visibleList, countInSection, labelPlural) =>
        visibleList.length > 0 ? (
            <div className="filter-section-actions" aria-label={`Acciones de ${labelPlural}`}>
                <button
                    type="button"
                    className="filter-section-action"
                    onClick={() => selectAllVisible(filterType, visibleList)}
                    disabled={
                        visibleList.length > 0 &&
                        visibleList.every(v => selectionIncludes(filters[filterType], v))
                    }
                >
                    Incluir listado visible
                </button>
                {countInSection > 0 ? (
                    <button
                        type="button"
                        className="filter-section-action filter-section-action--muted"
                        onClick={() => clearSection(filterType)}
                    >
                        Quitar {labelPlural}
                    </button>
                ) : null}
            </div>
        ) : null;

    const sectionBodyId = suffix => `${baseId}-${suffix}`;

    return (
        <aside
            className="filter-panel"
            aria-labelledby="filters-heading"
            aria-describedby="filters-describe"
        >
            <header className="filter-header">
                <div className="filter-header-text">
                    <div className="filter-header-icon-row">
                        <span className="filter-header-accent" aria-hidden>
                            <FiFilter size={19} strokeWidth={2.2} />
                        </span>
                        <div className="filter-header-heading-block">
                            <h3 id="filters-heading">Filtros de colección</h3>
                            <p id="filters-describe" className="filter-header-desc">
                                En cada bloque (técnica, procedencia o año) puedes marcar varias opciones: se aplican como &quot;o&quot;
                                dentro del bloque. Si activas más de un bloque, tienen que cumplirse todos — además de lo que
                                escribas en el buscador.
                            </p>
                        </div>
                    </div>
                    <div className="filter-header-meta">
                        {totalActive > 0 ? (
                            <span className="filter-count-pill">{totalActive} criterio{totalActive !== 1 ? 's' : ''} activos</span>
                        ) : (
                            <span className="filter-count-pill filter-count-pill--quiet">Sin filtros aplicados</span>
                        )}
                    </div>
                </div>
                <div className="filter-header-toolbar">
                    {hasActiveFilters ? (
                        <button type="button" className="clear-filters-btn" onClick={handleClearFilters}>
                            Restablecer
                        </button>
                    ) : null}
                    <div className="filter-expand-controls" role="group" aria-label="Expandir o contraer todas las secciones">
                        {!allCollapsed && (
                            <button
                                type="button"
                                className="filter-expand-btn"
                                onClick={collapseAll}
                                title="Contrae todas las secciones del filtro"
                            >
                                <FiMinimize2 size={15} aria-hidden />
                                <span className="filter-expand-btn__text">Contraer todo</span>
                            </button>
                        )}
                        {!allExpanded && (
                            <button
                                type="button"
                                className="filter-expand-btn"
                                onClick={expandAll}
                                title="Expande todas las secciones del filtro"
                            >
                                <FiMaximize2 size={15} aria-hidden />
                                <span className="filter-expand-btn__text">Expandir todo</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {activeChips.length > 0 && (
                <div className="filter-active-wrap">
                    <p className="filter-active-label" id={`${baseId}-chips-heading`}>
                        Selección actual
                    </p>
                    <div
                        className="filter-active-chips"
                        role="group"
                        aria-labelledby={`${baseId}-chips-heading`}
                    >
                        {activeChips.map(chip => (
                            <button
                                key={chip.key}
                                type="button"
                                className={`filter-chip ${chip.chipClass}`}
                                onClick={() => removeChip(chip.type, chip.value)}
                                title={`Quitar filtro ${chip.label}`}
                                aria-label={`Quitar ${chip.short} ${chip.label}`}
                            >
                                <span className="filter-chip-prefix" aria-hidden>
                                    {chip.short}
                                </span>
                                <span className="filter-chip-label">{chip.label}</span>
                                <FiX className="filter-chip-remove" aria-hidden size={14} strokeWidth={2.5} />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <nav className="filter-sections-nav" aria-label="Categorías de filtro">
                <section
                    className={`filter-section ${expandedSections.technique ? 'filter-section--open' : ''}`}
                    aria-labelledby="filter-section-tech"
                >
                    <button
                        type="button"
                        className="filter-section-title"
                        onClick={() => toggleSection('technique')}
                        aria-expanded={expandedSections.technique}
                        aria-controls={sectionBodyId('tech')}
                        id="filter-section-tech"
                    >
                        <span className="filter-section-title-left">
                            <span className="filter-section-icon-wrap" aria-hidden>
                                <FiLayers className="filter-section-icon" />
                            </span>
                            <span className="filter-section-heading">Técnica</span>
                            {filteredTechniques.length > 0 && (
                                <span className="filter-section-meta">{filteredTechniques.length}</span>
                            )}
                            {techCount > 0 && <span className="filter-section-badge">{techCount}</span>}
                        </span>
                        <span className={`filter-chevron ${expandedSections.technique ? 'filter-chevron--up' : ''}`}>
                            <FiChevronDown aria-hidden />
                        </span>
                    </button>
                    <div
                        id={sectionBodyId('tech')}
                        role="region"
                        className="filter-section-body"
                        hidden={!expandedSections.technique}
                    >
                        {expandedSections.technique && (
                            <>
                                {needsSearchTech && (
                                    <div className="filter-section-search">
                                        <FiSearch className="filter-section-search-icon" aria-hidden />
                                        <input
                                            id={`${baseId}-q-tech`}
                                            type="search"
                                            className="filter-section-search-input"
                                            value={queryTech}
                                            onChange={e => setQueryTech(e.target.value)}
                                            placeholder="Acotar la lista..."
                                            aria-label="Acotar técnicas en la lista"
                                            autoComplete="off"
                                        />
                                    </div>
                                )}
                                {needsSearchTech && (
                                    <p className="filter-options-count" aria-live="polite">
                                        Mostrando {filteredTechniques.length} de {techniques.length}
                                    </p>
                                )}
                                <div className="filter-options" role="group" aria-labelledby="filter-section-tech">
                                    {filteredTechniques.length === 0 ? (
                                        <p className="filter-empty-hint">
                                            No hay coincidencias. Prueba otra palabra o borra la búsqueda.
                                        </p>
                                    ) : (
                                        filteredTechniques.map(technique => (
                                            <label key={technique} className="filter-checkbox-row">
                                                <span className="filter-checkbox-hit">
                                                    <input
                                                        type="checkbox"
                                                        className="filter-checkbox-input"
                                                        checked={selectionIncludes(filters.technique, technique)}
                                                        onChange={() => handleFilterChange('technique', technique)}
                                                    />
                                                    <span className="filter-checkbox-visual" aria-hidden />
                                                </span>
                                                <span className="filter-checkbox-text">{technique}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                                {renderSectionFooter('technique', filteredTechniques, techCount, 'técnicas')}
                            </>
                        )}
                    </div>
                </section>

                <section
                    className={`filter-section ${expandedSections.region ? 'filter-section--open' : ''}`}
                    aria-labelledby="filter-section-region"
                >
                    <button
                        type="button"
                        className="filter-section-title"
                        onClick={() => toggleSection('region')}
                        aria-expanded={expandedSections.region}
                        aria-controls={sectionBodyId('region')}
                        id="filter-section-region"
                    >
                        <span className="filter-section-title-left">
                            <span className="filter-section-icon-wrap" aria-hidden>
                                <FiMapPin className="filter-section-icon" />
                            </span>
                            <span className="filter-section-heading">Procedencia</span>
                            {filteredRegions.length > 0 && (
                                <span className="filter-section-meta">{filteredRegions.length}</span>
                            )}
                            {regionCount > 0 && <span className="filter-section-badge">{regionCount}</span>}
                        </span>
                        <span className={`filter-chevron ${expandedSections.region ? 'filter-chevron--up' : ''}`}>
                            <FiChevronDown aria-hidden />
                        </span>
                    </button>
                    <div
                        id={sectionBodyId('region')}
                        role="region"
                        className="filter-section-body"
                        hidden={!expandedSections.region}
                    >
                        {expandedSections.region && (
                            <>
                                {needsSearchRegion && (
                                    <div className="filter-section-search">
                                        <FiSearch className="filter-section-search-icon" aria-hidden />
                                        <input
                                            id={`${baseId}-q-region`}
                                            type="search"
                                            className="filter-section-search-input"
                                            value={queryRegion}
                                            onChange={e => setQueryRegion(e.target.value)}
                                            placeholder="Acotar la lista..."
                                            aria-label="Acotar procedencias"
                                            autoComplete="off"
                                        />
                                    </div>
                                )}
                                {needsSearchRegion && (
                                    <p className="filter-options-count" aria-live="polite">
                                        Mostrando {filteredRegions.length} de {regions.length}
                                    </p>
                                )}
                                <div className="filter-options" role="group" aria-labelledby="filter-section-region">
                                    {filteredRegions.length === 0 ? (
                                        <p className="filter-empty-hint">
                                            No hay coincidencias. Prueba otra palabra o borra la búsqueda.
                                        </p>
                                    ) : (
                                        filteredRegions.map(region => (
                                            <label key={region} className="filter-checkbox-row">
                                                <span className="filter-checkbox-hit">
                                                    <input
                                                        type="checkbox"
                                                        className="filter-checkbox-input"
                                                        checked={selectionIncludes(filters.region, region)}
                                                        onChange={() => handleFilterChange('region', region)}
                                                    />
                                                    <span className="filter-checkbox-visual" aria-hidden />
                                                </span>
                                                <span className="filter-checkbox-text">{region}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                                {renderSectionFooter('region', filteredRegions, regionCount, 'procedencias')}
                            </>
                        )}
                    </div>
                </section>

                <section
                    className={`filter-section ${expandedSections.year ? 'filter-section--open' : ''}`}
                    aria-labelledby="filter-section-year"
                >
                    <button
                        type="button"
                        className="filter-section-title"
                        onClick={() => toggleSection('year')}
                        aria-expanded={expandedSections.year}
                        aria-controls={sectionBodyId('year')}
                        id="filter-section-year"
                    >
                        <span className="filter-section-title-left">
                            <span className="filter-section-icon-wrap" aria-hidden>
                                <FiCalendar className="filter-section-icon" />
                            </span>
                            <span className="filter-section-heading">Año</span>
                            {filteredYears.length > 0 && (
                                <span className="filter-section-meta">{filteredYears.length}</span>
                            )}
                            {yearCount > 0 && <span className="filter-section-badge">{yearCount}</span>}
                        </span>
                        <span className={`filter-chevron ${expandedSections.year ? 'filter-chevron--up' : ''}`}>
                            <FiChevronDown aria-hidden />
                        </span>
                    </button>
                    <div
                        id={sectionBodyId('year')}
                        role="region"
                        className="filter-section-body"
                        hidden={!expandedSections.year}
                    >
                        {expandedSections.year && (
                            <>
                                {needsSearchYear && (
                                    <div className="filter-section-search">
                                        <FiSearch className="filter-section-search-icon" aria-hidden />
                                        <input
                                            id={`${baseId}-q-year`}
                                            type="search"
                                            className="filter-section-search-input"
                                            value={queryYear}
                                            onChange={e => setQueryYear(e.target.value)}
                                            placeholder="Acotar la lista..."
                                            aria-label="Acotar años"
                                            autoComplete="off"
                                        />
                                    </div>
                                )}
                                {needsSearchYear && (
                                    <p className="filter-options-count" aria-live="polite">
                                        Mostrando {filteredYears.length} de {years.length}
                                    </p>
                                )}
                                <div className="filter-options" role="group" aria-labelledby="filter-section-year">
                                    {filteredYears.length === 0 ? (
                                        <p className="filter-empty-hint">
                                            No hay coincidencias. Prueba otro dígito o borra la búsqueda.
                                        </p>
                                    ) : (
                                        filteredYears.map(year => (
                                            <label key={String(year)} className="filter-checkbox-row">
                                                <span className="filter-checkbox-hit">
                                                    <input
                                                        type="checkbox"
                                                        className="filter-checkbox-input"
                                                        checked={selectionIncludes(filters.year, year)}
                                                        onChange={() => handleFilterChange('year', year)}
                                                    />
                                                    <span className="filter-checkbox-visual" aria-hidden />
                                                </span>
                                                <span className="filter-checkbox-text">{year}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                                {renderSectionFooter('year', filteredYears, yearCount, 'años')}
                            </>
                        )}
                    </div>
                </section>
            </nav>
        </aside>
    );
};

export default FilterPanel;
