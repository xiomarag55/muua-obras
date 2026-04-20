/**
 * Componente FilterPanel
 * Panel para filtrar artistas y obras por diferentes criterios
 */

import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import '../styles/FilterPanel.css';

export const FilterPanel = ({
    filters = {},
    onFilterChange,
    techniques = [],
    regions = [],
    years = []
}) => {
    const [expandedSections, setExpandedSections] = useState({
        technique: true,
        region: true,
        year: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleFilterChange = (filterType, value) => {
        const currentFilter = filters[filterType] || [];
        let newFilter;

        if (Array.isArray(currentFilter)) {
            if (currentFilter.includes(value)) {
                newFilter = currentFilter.filter(item => item !== value);
            } else {
                newFilter = [...currentFilter, value];
            }
        } else {
            newFilter = currentFilter === value ? null : value;
        }

        onFilterChange({
            ...filters,
            [filterType]: newFilter
        });
    };

    const handleClearFilters = () => {
        onFilterChange({});
    };

    const hasActiveFilters = Object.values(filters).some(
        value => (Array.isArray(value) ? value.length > 0 : value)
    );

    return (
        <div className="filter-panel">
            <div className="filter-header">
                <h3>Filtros</h3>
                {hasActiveFilters && (
                    <button
                        className="clear-filters-btn"
                        onClick={handleClearFilters}
                    >
                        Limpiar
                    </button>
                )}
            </div>

            {/* Filtro por Técnica */}
            <div className="filter-section">
                <button
                    className="filter-section-title"
                    onClick={() => toggleSection('technique')}
                >
                    <span>Técnica</span>
                    {expandedSections.technique ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {expandedSections.technique && (
                    <div className="filter-options">
                        {techniques.map(technique => (
                            <label key={technique} className="filter-checkbox">
                                <input
                                    type="checkbox"
                                    checked={(filters.technique || []).includes(technique)}
                                    onChange={() => handleFilterChange('technique', technique)}
                                />
                                <span>{technique}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Filtro por Región */}
            <div className="filter-section">
                <button
                    className="filter-section-title"
                    onClick={() => toggleSection('region')}
                >
                    <span>Región</span>
                    {expandedSections.region ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {expandedSections.region && (
                    <div className="filter-options">
                        {regions.map(region => (
                            <label key={region} className="filter-checkbox">
                                <input
                                    type="checkbox"
                                    checked={(filters.region || []).includes(region)}
                                    onChange={() => handleFilterChange('region', region)}
                                />
                                <span>{region}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Filtro por Año */}
            <div className="filter-section">
                <button
                    className="filter-section-title"
                    onClick={() => toggleSection('year')}
                >
                    <span>Año</span>
                    {expandedSections.year ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {expandedSections.year && (
                    <div className="filter-options">
                        {years.map(year => (
                            <label key={year} className="filter-checkbox">
                                <input
                                    type="checkbox"
                                    checked={(filters.year || []).includes(year)}
                                    onChange={() => handleFilterChange('year', year)}
                                />
                                <span>{year}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilterPanel;
