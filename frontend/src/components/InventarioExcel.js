import React, { useEffect, useMemo, useState } from 'react';
import { excelService } from '../services/apiService';

const clean = (s) => (s || '').trim().replace(/\.+$/, '').trim();

const CAMPOS_DETALLE = [
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

const CAMPOS_EDIT = [
    { key: 'codigo',              label: 'Código' },
    { key: 'apellido',            label: 'Apellido' },
    { key: 'nombre',              label: 'Nombre' },
    { key: 'titulo',              label: 'Título' },
    { key: 'tecnica',             label: 'Técnica' },
    { key: 'fechaObra',           label: 'Fecha obra' },
    { key: 'dimensiones',         label: 'Dimensiones' },
    { key: 'formato',             label: 'Formato' },
    { key: 'tema',                label: 'Tema' },
    { key: 'procedencia',         label: 'Procedencia' },
    { key: 'estadoConservacion',  label: 'Estado conservación' },
    { key: 'ubicacionPermanente', label: 'Ubicación permanente' },
    { key: 'ubicacionTemporal',   label: 'Ubicación temporal' },
    { key: 'responsable',         label: 'Responsable' },
    { key: 'observaciones',       label: 'Observaciones', multiline: true },
];

const getFotoSrc = (obra) =>
    obra.fotoUrl || (obra.fotoNombre ? excelService.getFotoUrl(obra.id) : null);

// ─── Modal detalle ────────────────────────────────────────────────────────────
const DetalleModal = ({ obra, onClose }) => {
    const fotoSrc = getFotoSrc(obra);
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" style={{ maxWidth: 680, maxHeight: '85vh', overflowY: 'auto' }}
                onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <h2 className="modal-title">{obra.titulo || 'Sin título'}</h2>
                {fotoSrc && (
                    <img src={fotoSrc} alt={obra.titulo}
                        style={{ width: '100%', maxHeight: 300, objectFit: 'contain', marginBottom: 16, borderRadius: 8 }}
                        onError={e => { e.target.style.display = 'none'; }} />
                )}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <tbody>
                        {CAMPOS_DETALLE.map(({ key, label }) => obra[key] ? (
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

// ─── Modal edición ────────────────────────────────────────────────────────────
const EditModal = ({ obra, onClose, onSave, saving }) => {
    const [form, setForm] = useState({ ...obra });

    const handleChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    const inputStyle = {
        width: '100%', padding: '7px 10px', borderRadius: 6,
        border: '1px solid var(--border-color)', fontSize: 13,
        background: 'var(--bg-white)', color: 'var(--text-primary)', outline: 'none',
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" style={{ maxWidth: 720, maxHeight: '90vh', overflowY: 'auto' }}
                onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <h2 className="modal-title">Editar obra</h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 20 }}>
                        {CAMPOS_EDIT.map(({ key, label, multiline }) => (
                            <div key={key} style={{ gridColumn: multiline ? '1 / -1' : undefined }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                                    {label}
                                </label>
                                {multiline ? (
                                    <textarea
                                        value={form[key] || ''}
                                        onChange={e => handleChange(key, e.target.value)}
                                        rows={3}
                                        style={{ ...inputStyle, resize: 'vertical' }}
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={form[key] || ''}
                                        onChange={e => handleChange(key, e.target.value)}
                                        style={inputStyle}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose}
                            style={{ padding: '8px 20px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', fontSize: 13 }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={saving}
                            style={{ padding: '8px 20px', borderRadius: 6, border: 'none', background: 'var(--accent-color)', color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
                            {saving ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Filtro select ────────────────────────────────────────────────────────────
const SelectFiltro = ({ label, value, onChange, options }) => (
    <select value={value} onChange={e => onChange(e.target.value)}
        style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border-color)', fontSize: 13, background: 'var(--bg-white)', color: 'var(--text-primary)', cursor: 'pointer', minWidth: 140 }}>
        <option value="">{label}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
);

// ─── Componente principal ─────────────────────────────────────────────────────
const PAGE_SIZE = 20;

const InventarioExcel = ({ obras, loading, error, token, onDelete, onUpdate }) => {
    const [detalle, setDetalle] = useState(null);
    const [editObra, setEditObra] = useState(null);
    const [saving, setSaving] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [filtroTecnica, setFiltroTecnica] = useState('');
    const [filtroAnio, setFiltroAnio] = useState('');
    const [filtroProcedencia, setFiltroProcedencia] = useState('');
    const [page, setPage] = useState(1);

    const canEdit = !!token && !!onDelete && !!onUpdate;

    const tecnicas = useMemo(() =>
        [...new Set(obras.map(o => clean(o.tecnica)).filter(Boolean))].sort(), [obras]);
    const anios = useMemo(() =>
        [...new Set(obras.map(o => o.anioIngreso || o.fechaObra).filter(Boolean))].sort(), [obras]);
    const procedencias = useMemo(() =>
        [...new Set(obras.map(o => o.procedencia).filter(Boolean))].sort(), [obras]);

    const hayFiltros = busqueda || filtroTecnica || filtroAnio || filtroProcedencia;

    useEffect(() => { setPage(1); }, [busqueda, filtroTecnica, filtroAnio, filtroProcedencia]);

    const limpiarFiltros = () => {
        setBusqueda(''); setFiltroTecnica(''); setFiltroAnio(''); setFiltroProcedencia('');
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
        if (filtroTecnica && clean(o.tecnica) !== filtroTecnica) return false;
        if (filtroAnio && (o.anioIngreso || o.fechaObra) !== filtroAnio) return false;
        if (filtroProcedencia && o.procedencia !== filtroProcedencia) return false;
        return true;
    });

    const handleSave = async (formData) => {
        setSaving(true);
        try {
            const updated = await excelService.update(editObra.id, formData, token);
            onUpdate(updated);
            setEditObra(null);
        } catch {
            alert('No se pudo guardar los cambios.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading"><div className="spinner" /><p>Cargando inventario...</p></div>;
    if (error)   return <div className="empty-state"><p>{error}</p></div>;
    if (obras.length === 0) return (
        <div className="empty-state">
            <p>No hay obras en el inventario. Carga un archivo Excel para comenzar.</p>
        </div>
    );

    const totalPages = Math.ceil(obrasFiltradas.length / PAGE_SIZE);
    const obrasPage = obrasFiltradas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div>
            {/* Barra de filtros */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 16 }}>
                <input type="text" placeholder="Buscar por título, artista, técnica o código..."
                    value={busqueda} onChange={e => setBusqueda(e.target.value)}
                    style={{ flex: '1 1 240px', padding: '7px 12px', borderRadius: 6, border: '1px solid var(--border-color)', fontSize: 13, background: 'var(--bg-white)', color: 'var(--text-primary)', outline: 'none' }} />
                {tecnicas.length > 0 && <SelectFiltro label="Técnica" value={filtroTecnica} onChange={setFiltroTecnica} options={tecnicas} />}
                {anios.length > 0 && <SelectFiltro label="Año" value={filtroAnio} onChange={setFiltroAnio} options={anios} />}
                {procedencias.length > 0 && <SelectFiltro label="Región / Procedencia" value={filtroProcedencia} onChange={setFiltroProcedencia} options={procedencias} />}
                {hayFiltros && (
                    <button onClick={limpiarFiltros}
                        style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}>
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
                            {canEdit && <th style={th}>Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {obrasPage.map(obra => (
                            <FilaObra
                                key={obra.id}
                                obra={obra}
                                canEdit={canEdit}
                                onClick={() => setDetalle(obra)}
                                onEdit={() => setEditObra(obra)}
                                onDelete={() => onDelete(obra.id)}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button className="pagination-btn" onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={page <= 1}>← Anterior</button>
                    <span className="pagination-info">Página {page} de {totalPages}</span>
                    <button className="pagination-btn" onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={page >= totalPages}>Siguiente →</button>
                </div>
            )}

            {detalle && <DetalleModal obra={detalle} onClose={() => setDetalle(null)} />}
            {editObra && <EditModal obra={editObra} onClose={() => setEditObra(null)} onSave={handleSave} saving={saving} />}
        </div>
    );
};

// ─── Fila de tabla ────────────────────────────────────────────────────────────
const FilaObra = ({ obra, canEdit, onClick, onEdit, onDelete }) => {
    const [hovered, setHovered] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const fotoSrc = getFotoSrc(obra);

    return (
        <tr onClick={onClick} style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', background: hovered ? 'var(--bg-light)' : 'var(--bg-white)', transition: 'background 0.15s' }}
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <td style={td}>
                {fotoSrc ? (
                    <img src={fotoSrc} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
                        onError={e => { e.target.style.display = 'none'; }} />
                ) : (
                    <div style={{ width: 48, height: 48, background: 'var(--border-color)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 18 }}>🖼</div>
                )}
            </td>
            <td style={td}>{obra.codigo || '—'}</td>
            <td style={td}>{[obra.apellido, obra.nombre].filter(Boolean).join(', ') || '—'}</td>
            <td style={{ ...td, fontWeight: 600 }}>{obra.titulo || '—'}</td>
            <td style={td}>{clean(obra.tecnica) || '—'}</td>
            <td style={td}>{obra.anioIngreso || obra.fechaObra || '—'}</td>
            <td style={td}>{obra.estadoConservacion || '—'}</td>
            <td style={td}>{obra.ubicacionPermanente || '—'}</td>
            {canEdit && (
                <td style={{ ...td, whiteSpace: 'nowrap' }} onClick={e => e.stopPropagation()}>
                    {confirmDelete ? (
                        <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>¿Eliminar?</span>
                            <button onClick={() => { setConfirmDelete(false); onDelete(); }} style={btnDanger}>Sí</button>
                            <button onClick={() => setConfirmDelete(false)} style={btnCancel}>No</button>
                        </span>
                    ) : (
                        <span style={{ display: 'flex', gap: 6 }}>
                            <button onClick={onEdit} title="Editar" style={btnEdit}>✏</button>
                            <button onClick={() => setConfirmDelete(true)} title="Eliminar" style={btnDelete}>🗑</button>
                        </span>
                    )}
                </td>
            )}
        </tr>
    );
};

const th = { padding: '10px 12px', fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap', borderBottom: '2px solid var(--border-color)' };
const td = { padding: '10px 12px', color: 'var(--text-primary)', verticalAlign: 'middle' };

const btnBase = { border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 13, padding: '4px 10px', fontWeight: 600 };
const btnEdit   = { ...btnBase, background: 'rgba(67,182,73,0.12)', color: 'var(--primary-color)' };
const btnDelete = { ...btnBase, background: 'rgba(231,76,60,0.1)', color: '#e74c3c' };
const btnDanger = { ...btnBase, background: '#e74c3c', color: '#fff', padding: '3px 8px' };
const btnCancel = { ...btnBase, background: 'var(--bg-light)', color: 'var(--text-secondary)', padding: '3px 8px' };

export default InventarioExcel;
