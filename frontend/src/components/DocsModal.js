import React, { useState, useEffect } from 'react';
import {
    FiX, FiInfo, FiGrid, FiSearch, FiUpload,
    FiUser, FiAlertTriangle, FiArrowRight, FiBookOpen
} from 'react-icons/fi';
import '../styles/DocsModal.css';

const sections = [
    {
        id: 'intro',
        icon: <FiInfo />,
        title: '¿Qué es MUUA?',
        content: (
            <>
                <p>
                    <strong>MUUA</strong> (Museo Universidad de Antioquia) es la plataforma digital para
                    gestionar y explorar la colección de artes visuales de la Universidad de Antioquia.
                    Esta herramienta permite:
                </p>
                <ul>
                    <li>Explorar obras de arte de la colección del museo</li>
                    <li>Consultar colecciones externas como el Art Institute of Chicago</li>
                    <li>Cargar y gestionar el inventario del museo mediante archivos Excel</li>
                    <li>Buscar y filtrar obras por diferentes criterios</li>
                </ul>
                <div className="docs-alert docs-alert--warn">
                    <FiAlertTriangle aria-hidden />
                    <span>
                        Esta plataforma está en <strong>fase beta</strong>. Algunas características
                        pueden estar incompletas o cambiar en futuras versiones.
                    </span>
                </div>
            </>
        ),
    },
    {
        id: 'views',
        icon: <FiGrid />,
        title: 'Vistas de la aplicación',
        content: (
            <>
                <p>
                    La plataforma cuenta con cuatro vistas principales accesibles desde los controles
                    de navegación en la parte superior de la galería:
                </p>
                <div className="docs-card-grid">
                    <div className="docs-view-card">
                        <span className="docs-view-tag">Obras</span>
                        <p>
                            Galería de obras de arte con tarjetas visuales. Explora y busca en la
                            colección general del museo.
                        </p>
                    </div>
                    <div className="docs-view-card">
                        <span className="docs-view-tag">Artistas</span>
                        <p>
                            Listado de artistas asociados a las obras de la colección. Información
                            biográfica y obras relacionadas.
                        </p>
                    </div>
                    <div className="docs-view-card">
                        <span className="docs-view-tag">ARTIC</span>
                        <p>
                            Colección del Art Institute of Chicago. Explora obras en alta resolución
                            de uno de los museos más importantes del mundo.
                        </p>
                    </div>
                    <div className="docs-view-card">
                        <span className="docs-view-tag">Inventario</span>
                        <p>
                            Obras cargadas desde archivos Excel. Gestión del inventario digital
                            propio del museo.
                        </p>
                    </div>
                </div>
            </>
        ),
    },
    {
        id: 'search',
        icon: <FiSearch />,
        title: 'Búsqueda y filtros',
        content: (
            <>
                <p>
                    La barra de búsqueda está disponible en la parte superior de la galería.
                    Puedes buscar por:
                </p>
                <ul>
                    <li><strong>Nombre de la obra</strong></li>
                    <li><strong>Nombre del artista</strong></li>
                    <li><strong>Descripción o palabras clave</strong></li>
                </ul>
                <p style={{ marginTop: '14px' }}>
                    Además de la búsqueda textual, usa los filtros disponibles para refinar resultados:
                </p>
                <div className="docs-feature-list">
                    <div className="docs-feature-item">
                        <FiArrowRight aria-hidden />
                        <span><strong>Técnica</strong> — óleo, acrílico, acuarela, escultura, fotografía, etc.</span>
                    </div>
                    <div className="docs-feature-item">
                        <FiArrowRight aria-hidden />
                        <span><strong>Región</strong> — filtra obras por su origen geográfico</span>
                    </div>
                    <div className="docs-feature-item">
                        <FiArrowRight aria-hidden />
                        <span><strong>Año</strong> — rango de años de creación de la obra</span>
                    </div>
                </div>
            </>
        ),
    },
    {
        id: 'excel',
        icon: <FiUpload />,
        title: 'Carga de inventario Excel',
        content: (
            <>
                <div className="docs-alert docs-alert--info">
                    <FiAlertTriangle aria-hidden />
                    <span>
                        <strong>Límite actual:</strong> el archivo Excel puede contener
                        máximo <strong>100 obras</strong> por carga.
                    </span>
                </div>
                <p>Para cargar el inventario desde un archivo Excel sigue estos pasos:</p>
                <ol>
                    <li>Inicia sesión con tus credenciales de museo.</li>
                    <li>
                        Haz clic en el botón <strong>"Cargar inventario"</strong> en la
                        barra de navegación superior.
                    </li>
                    <li>
                        Arrastra o selecciona tu archivo <code>.xlsx</code> o <code>.xls</code>
                        en la zona de carga.
                    </li>
                    <li>Confirma la operación y espera el procesamiento.</li>
                </ol>
                <p style={{ marginTop: '16px' }}>
                    El archivo Excel debe seguir el siguiente formato de columnas:
                </p>
                <div className="docs-table-wrap">
                    <table className="docs-table">
                        <thead>
                            <tr>
                                <th>Columna</th>
                                <th>Descripción</th>
                                <th>Requerida</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Título</td><td>Nombre de la obra</td><td className="docs-td-yes">Sí</td></tr>
                            <tr><td>Artista</td><td>Nombre del autor o autora</td><td className="docs-td-yes">Sí</td></tr>
                            <tr><td>Año</td><td>Año de creación de la obra</td><td>No</td></tr>
                            <tr><td>Técnica</td><td>Técnica o medio artístico</td><td>No</td></tr>
                            <tr><td>Descripción</td><td>Texto descriptivo de la obra</td><td>No</td></tr>
                            <tr><td>Región</td><td>Lugar o región de origen</td><td>No</td></tr>
                        </tbody>
                    </table>
                </div>
            </>
        ),
    },
    {
        id: 'auth',
        icon: <FiUser />,
        title: 'Autenticación',
        content: (
            <>
                <p>
                    Algunas funciones de la plataforma requieren tener una cuenta activa e iniciar sesión:
                </p>
                <div className="docs-feature-list">
                    <div className="docs-feature-item">
                        <FiArrowRight aria-hidden />
                        <span><strong>Cargar inventario Excel</strong> — requiere sesión iniciada</span>
                    </div>
                    <div className="docs-feature-item">
                        <FiArrowRight aria-hidden />
                        <span><strong>Agregar obras individualmente</strong> — requiere sesión iniciada</span>
                    </div>
                    <div className="docs-feature-item">
                        <FiArrowRight aria-hidden />
                        <span><strong>Explorar la colección y buscar</strong> — disponible para todos</span>
                    </div>
                </div>
                <p style={{ marginTop: '16px' }}>
                    Para crear una cuenta, haz clic en <strong>"Iniciar sesión"</strong> en la barra de
                    navegación y luego en <strong>"¿No tienes cuenta? Regístrate"</strong> en el formulario.
                </p>
            </>
        ),
    },
    {
        id: 'status',
        icon: <FiAlertTriangle />,
        title: 'Estado del proyecto',
        content: (
            <>
                <div className="docs-alert docs-alert--warn">
                    <FiAlertTriangle aria-hidden />
                    <span>
                        Esta plataforma está en <strong>construcción activa</strong> como parte
                        de un proyecto de investigación de la Universidad de Antioquia.
                    </span>
                </div>
                <p>Características actualmente en desarrollo:</p>
                <ul>
                    <li>Aumento del límite de obras por carga Excel (actualmente 100)</li>
                    <li>Exportación del inventario en múltiples formatos</li>
                    <li>Panel de administración completo</li>
                    <li>Carga de imágenes individuales por obra</li>
                    <li>Versión móvil optimizada</li>
                    <li>Historial de cambios y auditoría</li>
                </ul>
                <p style={{ marginTop: '14px' }}>
                    Para reportar errores o sugerir mejoras, contacta al equipo de desarrollo
                    de la Universidad de Antioquia.
                </p>
            </>
        ),
    },
];

const DocsModal = ({ onClose }) => {
    const [active, setActive] = useState('intro');

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const activeSection = sections.find(s => s.id === active);

    return (
        <div className="modal-overlay docs-overlay" onClick={onClose}>
            <div
                className="docs-modal"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Documentación MUUA"
            >
                {/* Sidebar */}
                <aside className="docs-sidebar">
                    <div className="docs-sidebar-header">
                        <FiBookOpen className="docs-sidebar-icon" aria-hidden />
                        <div>
                            <span className="docs-sidebar-logo">MUUA</span>
                            <span className="docs-sidebar-label">Documentación</span>
                        </div>
                    </div>
                    <nav className="docs-nav" aria-label="Secciones de documentación">
                        {sections.map(s => (
                            <button
                                key={s.id}
                                className={`docs-nav-item${active === s.id ? ' docs-nav-item--active' : ''}`}
                                onClick={() => setActive(s.id)}
                                aria-current={active === s.id ? 'page' : undefined}
                            >
                                <span className="docs-nav-icon" aria-hidden>{s.icon}</span>
                                <span>{s.title}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Content */}
                <div className="docs-content">
                    <div className="docs-content-topbar">
                        <h2 className="docs-content-title">
                            <span className="docs-title-icon" aria-hidden>{activeSection.icon}</span>
                            {activeSection.title}
                        </h2>
                        <button className="docs-close-btn" onClick={onClose} aria-label="Cerrar documentación">
                            <FiX />
                        </button>
                    </div>
                    <div className="docs-content-body" key={active}>
                        {activeSection.content}
                    </div>

                    {/* Mobile nav dots */}
                    <div className="docs-mobile-nav">
                        {sections.map(s => (
                            <button
                                key={s.id}
                                className={`docs-mobile-nav-btn${active === s.id ? ' active' : ''}`}
                                onClick={() => setActive(s.id)}
                                title={s.title}
                                aria-label={s.title}
                            >
                                <span aria-hidden>{s.icon}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocsModal;
