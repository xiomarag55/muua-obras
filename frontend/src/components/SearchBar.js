/**
 * Componente SearchBar
 * Barra de búsqueda para artistas y obras
 */

import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
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
            <div className="search-bar">
                <FiSearch className="search-icon" />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={handleChange}
                    className="search-input"
                />
                {query && (
                    <button onClick={handleClear} className="search-clear">
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchBar;
