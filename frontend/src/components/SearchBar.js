/**
 * Componente SearchBar
 * Barra de búsqueda para artistas y obras
 */

import React, { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import '../styles/SearchBar.css';

export const SearchBar = ({ onSearch, placeholder = "Buscar artistas u obras..." }) => {
    const [query, setQuery] = useState('');

    const handleChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        onSearch(value);
    };

    const handleClear = () => {
        setQuery('');
        onSearch('');
    };

    return (
        <div className="search-bar-container">
            <label className="search-bar" htmlFor="gallery-search">
                <FiSearch className="search-icon" aria-hidden />
                <input
                    id="gallery-search"
                    type="search"
                    placeholder={placeholder}
                    value={query}
                    onChange={handleChange}
                    className="search-input"
                    autoComplete="off"
                    aria-label={placeholder}
                />
                {query && (
                    <button type="button" onClick={handleClear} className="search-clear" aria-label="Limpiar búsqueda">
                        <FiX size={18} aria-hidden />
                    </button>
                )}
            </label>
        </div>
    );
};

export default SearchBar;
