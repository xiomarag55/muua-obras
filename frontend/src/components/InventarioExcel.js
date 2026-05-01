import React, { useMemo, useState } from 'react';
import { excelService } from '../services/apiService';

const CAMPOS = [
    { key: 'codigo',              label: 'Código' },
    { key: 'apellido',            label: 'Apellido' },
    { key: 'nombre',              label: 'Nombre' },
    { key: 'titulo',              label: 'Título' },
    { key: 'tecnica',             label: 'Técnica' },
    { key: 'fechaObra',           label: 'Fecha obra' },
    { key: 'formato',             label: 'Formato' },
    { key: 'dimensiones',         label: 'Dimensiones' },
    { key: 'tema',                label: 'Tema' },
    { key: 'procedencia',         label: 'Procedencia' },
    { key: 'avaluoComercial',     label: 'Avalúo comercial' },
    { key: 'estadoConservacion',  label: 'Estado conservación' },
    { key: 'ubicacionPermanente', label: 'Ubicación permanente' },
    { key: 'ubicacionTemporal',   label: 'Ubicación temporal' },
    { key: 'responsable',         label: 'Responsable' },
    { key: 'observaciones',       label: 'Observaciones' },
];

const getFotoSrc = (obra) =>
    obra.fotoUrl || (obra.fotoNombre ? excelService.getFotoUrl(obra.id) : null);

const DetalleModal = ({ obra, onClose }) => {
    const fotoSrc = getFotoSrc(obra);
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-box"
                style={{ maxWidth: 680, maxHeight: '85vh', overflowY: 'auto' }}
                onClick={e => e.stopPropagation()}
            >
                <button className="modal-close" onClick={onClose}>✕</button>
                <h2 className="modal-title">{obra.titulo || 'Sin título'}</h2>

                {fotoSrc && (
                    <img
                        src={fotoSrc}
                        alt={obra.titulo}
                        style={{ width: '100%', maxHeight: 300, objectFit: 'contain', marginBottom: 16, borderRadius: 8 }}
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                )}

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <tbody>
                        {CAMPOS.map(({ key, label }) => obra[key] ? (
                            <tr key={key} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '6px 8px', fontWeight: 600, color: 'var(--text-secondary)', width: 180 }}>{label}</td>
                                <td style={{ padding: '6px 8px', color: 'var(--text-primary)' }}>{obra[key]}</td>
                            </tr>
                        ) : null)}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SelectFiltro = ({ label, value, onChange, options }) => (
    <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
            padding: '7px 10px',
            borderRadius: 6,
            border: '1px solid var(--border-color)',
            fontSize: 13,
            background: 'var(--bg-white)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            minWidth: 140,
        }}
    >
        <option value="">{label}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
);

const InventarioExcel = ({ obras, loading, error }) => {
    const [detalle, setDetalle] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [filtroTecnica, setFiltroTecnica] = useState('');
    const [filtroAnio, setFiltroAnio] = useState('');
    const [filtroProcedencia, setFiltroProcedencia] = useState('');

    const tecnicas = useMemo(() =>
        [...new Set(obras.map(o => o.tecnica).filter(Boolean))].sort(), [obras]);
    const anios = useMemo(() =>
        [...new Set(obras.map(o => o.anioIngreso).filter(Boolean))].sort(), [obras]);
    const procedencias = useMemo(() =>
        [...new Set(obras.map(o => o.procedencia).filter(Boolean))].sort(), [obras]);

    const hayFiltros = busqueda || filtroTecnica || filtroAnio || filtroProcedencia;

    const limpiarFiltros = () => {
        setBusqueda('');
        setFiltroTecnica('');
        setFiltroAnio('');
        setFiltroProcedencia('');
    };

    const obrasFiltradas = obras.filter(o => {
        if (busqueda) {
            const q = busqueda.toLowerCase();
            const match =
                (o.titulo || '').toLowerCase().includes(q) ||
                (o.apellido || '').toLowerCase().includes(q) ||
                (o.nombre || '').toLowerCase().includes(q) ||
                (o.tecnica || '').toLowerCase().includes(q) ||
                (o.codigo || '').toLowerCase().includes(q);
            if (!match) return false;
        }
        if (filtroTecnica && o.tecnica !== filtroTecnica) return false;
        if (filtroAnio && o.anioIngreso !== filtroAnio) return false;
        if (filtroProcedencia && o.procedencia !== filtroProcedencia) return false;
        return true;
    });

    if (loading) {
        return <div className="loading"><div className="spinner" /><p>Cargando inventario...</p></div>;
    }

    if (error) {
        return <div className="empty-state"><p>{error}</p></div>;
    }

    if (obras.length === 0) {
        return (
            <div className="empty-state">
                <p>No hay obras en el inventario. Carga un archivo Excel para comenzar.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Barra de filtros */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 16 }}>
                <input
                    type="text"
                    placeholder="Buscar por título, artista, técnica o código..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    style={{
                        flex: '1 1 240px',
                        padding: '7px 12px',
                        borderRadius: 6,
                        border: '1px solid var(--border-color)',
                        fontSize: 13,
                        background: 'var(--bg-white)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                    }}
                />
                {tecnicas.length > 0 && (
                    <SelectFiltro label="Técnica" value={filtroTecnica} onChange={setFiltroTecnica} options={tecnicas} />
                )}
                {anios.length > 0 && (
                    <SelectFiltro label="Año" value={filtroAnio} onChange={setFiltroAnio} options={anios} />
                )}
                {procedencias.length > 0 && (
                    <SelectFiltro label="Región / Procedencia" value={filtroProcedencia} onChange={setFiltroProcedencia} options={procedencias} />
                )}
                {hayFiltros && (
                    <button
                        onClick={limpiarFiltros}
                        style={{
                            padding: '7px 14px', borderRadius: 6, border: '1px solid var(--border-color)',
                            background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13,
                        }}
                    >
                        Limpiar
                    </button>
                )}
                <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: 13, flexShrink: 0 }}>
                    {obrasFiltradas.length} obra{obrasFiltradas.length !== 1 ? 's' : ''}
                    {hayFiltros ? ' encontrada' + (obrasFiltradas.length !== 1 ? 's' : '') : ' en inventario'}
                </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-light)', textAlign: 'left' }}>
                            <th style={th}>Foto</th>
                            <th style={th}>Código</th>
                            <th style={th}>Artista</th>
                            <th style={th}>Título</th>
                            <th style={th}>Técnica</th>
                            <th style={th}>Año</th>
                            <th style={th}>Estado</th>
                            <th style={th}>Ubicación</th>
                        </tr>
                    </thead>
                    <tbody>
                        {obrasFiltradas.map(obra => (
                            <FilaObra key={obra.id} obra={obra} onClick={() => setDetalle(obra)} />
                        ))}
                    </tbody>
                </table>
            </div>

            {detalle && <DetalleModal obra={detalle} onClose={() => setDetalle(null)} />}
        </div>
    );
};

const FilaObra = ({ obra, onClick }) => {
    const [hovered, setHovered] = useState(false);
    const fotoSrc = getFotoSrc(obra);

    return (
        <tr
            onClick={onClick}
            style={{
                borderBottom: '1px solid var(--border-color)',
                cursor: 'pointer',
                background: hovered ? 'var(--bg-light)' : 'var(--bg-white)',
                transition: 'background 0.15s',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <td style={td}>
                {fotoSrc ? (
                    <img
                        src={fotoSrc}
                        alt=""
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <div style={{
                        width: 48, height: 48, background: 'var(--border-color)',
                        borderRadius: 4, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 18,
                    }}>
                        🖼
                    </div>
                )}
            </td>
            <td style={td}>{obra.codigo || '—'}</td>
            <td style={td}>{[obra.apellido, obra.nombre].filter(Boolean).join(', ') || '—'}</td>
            <td style={{ ...td, fontWeight: 600 }}>{obra.titulo || '—'}</td>
            <td style={td}>{obra.tecnica || '—'}</td>
            <td style={td}>{obra.anioIngreso || '—'}</td>
            <td style={td}>{obra.estadoConservacion || '—'}</td>
            <td style={td}>{obra.ubicacionPermanente || '—'}</td>
        </tr>
    );
};

const th = {
    padding: '10px 12px',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    borderBottom: '2px solid var(--border-color)',
};
const td = {
    padding: '10px 12px',
    color: 'var(--text-primary)',
    verticalAlign: 'middle',
};

export default InventarioExcel;
