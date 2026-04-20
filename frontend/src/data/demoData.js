/**
 * Datos de demostración - Artistas
 * Estos datos utilizan el mismo esquema que se usa en PostgreSQL
 * Contiene artistas ficticios pero verosímiles de Antioquia y regiones aledañas
 */

export const demoArtists = [
    {
        id: 1,
        name: "María Gómez López",
        region: "Medellín",
        technique: "Óleo sobre lienzo",
        bio: "Artista contemporánea especializada en paisajes urbanos y naturaleza.",
        image: "https://via.placeholder.com/400x300?text=María+Gómez"
    },
    {
        id: 2,
        name: "Carlos Restrepo Sánchez",
        region: "Envigado",
        technique: "Escultura en piedra",
        bio: "Escultor con influencia de la tradición muisca, crea formas abstractas.",
        image: "https://via.placeholder.com/400x300?text=Carlos+Restrepo"
    },
    {
        id: 3,
        name: "Ana Martínez Duque",
        region: "Sabaneta",
        technique: "Acrílico y técnica mixta",
        bio: "Artista visual enfocada en temáticas de identidad y memoria.",
        image: "https://via.placeholder.com/400x300?text=Ana+Martínez"
    },
    {
        id: 4,
        name: "Juan Henao Vélez",
        region: "La Ceja",
        technique: "Fotografía analógica",
        bio: "Fotógrafo especializado en documentación de tradiciones ancestrales.",
        image: "https://via.placeholder.com/400x300?text=Juan+Henao"
    },
    {
        id: 5,
        name: "Laura Bedoya Aristizábal",
        region: "Rionegro",
        technique: "Grabado en madera",
        bio: "Artista printmaker que explora narrativas de la cotidianidad rural.",
        image: "https://via.placeholder.com/400x300?text=Laura+Bedoya"
    },
    {
        id: 6,
        name: "Diego Salazar Morales",
        region: "Bello",
        technique: "Instalación multimedia",
        bio: "Artista digital que crea experiencias inmersivas sobre el espacio público.",
        image: "https://via.placeholder.com/400x300?text=Diego+Salazar"
    },
    {
        id: 7,
        name: "Sofía Cardona Higuita",
        region: "Itagüí",
        technique: "Acuarela y tinta",
        bio: "Ilustradora e ilustradora dedicada a la representación del folclor colombiano.",
        image: "https://via.placeholder.com/400x300?text=Sofía+Cardona"
    },
    {
        id: 8,
        name: "Andrés Piedrahita Gómez",
        region: "Copacabana",
        technique: "Cerámica",
        bio: "Ceramista que recupera técnicas prehispánicas con interpretaciones modernas.",
        image: "https://via.placeholder.com/400x300?text=Andrés+Piedrahita"
    },
    {
        id: 9,
        name: "Daniela Vega Ruiz",
        region: "Santa Fe de Antioquia",
        technique: "Textil y bordado",
        bio: "Artista textil que trabaja con comunidades indígenas docuymentando tradiciones.",
        image: "https://via.placeholder.com/400x300?text=Daniela+Vega"
    },
    {
        id: 10,
        name: "Roberto Álvarez Quiroz",
        region: "Guatapé",
        technique: "Pintura mural",
        bio: "Muralista urbano que transforma espacios públicos con arte comunitario.",
        image: "https://via.placeholder.com/400x300?text=Roberto+Álvarez"
    },
    {
        id: 11,
        name: "Catalina Mejía Londoño",
        region: "Jericó",
        technique: "Escultura en madera",
        bio: "Escultora que trabaja exclusivamente con madera reciclada de la región.",
        image: "https://via.placeholder.com/400x300?text=Catalina+Mejía"
    },
    {
        id: 12,
        name: "Fernando Ochoa López",
        region: "Medellín",
        technique: "Videoarte",
        bio: "Artista multimedia explorando la relación entre memoria y tecnología.",
        image: "https://via.placeholder.com/400x300?text=Fernando+Ochoa"
    }
];

/**
 * Datos de demostración - Obras de Arte
 * Cada obra incluye referencia al artista mediante artistId
 */
export const demoArtworks = [
    // María Gómez López (artist id: 1)
    {
        id: 1,
        title: "Atardecer en Comuna 13",
        artistId: 1,
        artist: "María Gómez López",
        technique: "Óleo sobre lienzo",
        dimensions: "120 x 80 cm",
        year: 2023,
        description: "Representación de los colores vibrantes del atardecer medellinense.",
        image: "https://via.placeholder.com/400x300?text=Atardecer+Comuna+13"
    },
    {
        id: 2,
        title: "Bosque Nublado",
        artistId: 1,
        artist: "María Gómez López",
        technique: "Óleo sobre lienzo",
        dimensions: "100 x 150 cm",
        year: 2023,
        description: "Interpretación de la biodiversidad en los bosques nublados de Antioquia.",
        image: "https://via.placeholder.com/400x300?text=Bosque+Nublado"
    },

    // Carlos Restrepo Sánchez (artist id: 2)
    {
        id: 3,
        title: "Espíritu Ancestral",
        artistId: 2,
        artist: "Carlos Restrepo Sánchez",
        technique: "Escultura en piedra",
        dimensions: "200 x 100 x 50 cm",
        year: 2022,
        description: "Escultura abstracta inspirada en símbolos de la cosmología muisca.",
        image: "https://via.placeholder.com/400x300?text=Espíritu+Ancestral"
    },
    {
        id: 4,
        title: "Geometría del Tiempo",
        artistId: 2,
        artist: "Carlos Restrepo Sánchez",
        technique: "Escultura en piedra",
        dimensions: "150 x 150 x 80 cm",
        year: 2023,
        description: "Formas geométricas que representan ciclos temporales ancestrales.",
        image: "https://via.placeholder.com/400x300?text=Geometría+Tiempo"
    },

    // Ana Martínez Duque (artist id: 3)
    {
        id: 5,
        title: "Memorias Fragmentadas",
        artistId: 3,
        artist: "Ana Martínez Duque",
        technique: "Acrílico y técnica mixta",
        dimensions: "90 x 120 cm",
        year: 2023,
        description: "Collage que explora la fragmentación de la identidad en la era digital.",
        image: "https://via.placeholder.com/400x300?text=Memorias+Fragmentadas"
    },
    {
        id: 6,
        title: "Identidades",
        artistId: 3,
        artist: "Ana Martínez Duque",
        technique: "Acrílico y técnica mixta",
        dimensions: "110 x 85 cm",
        year: 2022,
        description: "Superposición de capas que representan múltiples identidades.",
        image: "https://via.placeholder.com/400x300?text=Identidades"
    },

    // Juan Henao Vélez (artist id: 4)
    {
        id: 7,
        title: "Rostros de la Tradición",
        artistId: 4,
        artist: "Juan Henao Vélez",
        technique: "Fotografía analógica",
        dimensions: "100 x 120 cm",
        year: 2023,
        description: "Serie fotográfica documentando ancestros de comunidades rurales.",
        image: "https://via.placeholder.com/400x300?text=Rostros+Tradición"
    },
    {
        id: 8,
        title: "Rituales del Campo",
        artistId: 4,
        artist: "Juan Henao Vélez",
        technique: "Fotografía analógica",
        dimensions: "80 x 120 cm",
        year: 2022,
        description: "Captura de ceremonias y tradiciones en comunidades de la región.",
        image: "https://via.placeholder.com/400x300?text=Rituales+Campo"
    },

    // Laura Bedoya Aristizábal (artist id: 5)
    {
        id: 9,
        title: "Manos de la Tierra",
        artistId: 5,
        artist: "Laura Bedoya Aristizábal",
        technique: "Grabado en madera",
        dimensions: "60 x 80 cm",
        year: 2023,
        description: "Grabado que narra la relación entre el campesino y la naturaleza.",
        image: "https://via.placeholder.com/400x300?text=Manos+Tierra"
    },
    {
        id: 10,
        title: "Narrativa Rural",
        artistId: 5,
        artist: "Laura Bedoya Aristizábal",
        technique: "Grabado en madera",
        dimensions: "70 x 90 cm",
        year: 2023,
        description: "Serie de grabados contando historias de la vida cotidiana rural.",
        image: "https://via.placeholder.com/400x300?text=Narrativa+Rural"
    },

    // Diego Salazar Morales (artist id: 6)
    {
        id: 11,
        title: "Espacios Interactivos",
        artistId: 6,
        artist: "Diego Salazar Morales",
        technique: "Instalación multimedia",
        dimensions: "Variable",
        year: 2023,
        description: "Instalación interactiva que transforma la percepción del espacio urbano.",
        image: "https://via.placeholder.com/400x300?text=Espacios+Interactivos"
    },
    {
        id: 12,
        title: "Datos Vivos",
        artistId: 6,
        artist: "Diego Salazar Morales",
        technique: "Instalación multimedia",
        dimensions: "Variable",
        year: 2022,
        description: "Visualización interactiva de datos demográficos urbanos en tiempo real.",
        image: "https://via.placeholder.com/400x300?text=Datos+Vivos"
    },

    // Sofía Cardona Higuita (artist id: 7)
    {
        id: 13,
        title: "Mitos y Leyendas",
        artistId: 7,
        artist: "Sofía Cardona Higuita",
        technique: "Acuarela y tinta",
        dimensions: "50 x 70 cm",
        year: 2023,
        description: "Ilustraciones del folclor y las leyendas colombianas tradicionales.",
        image: "https://via.placeholder.com/400x300?text=Mitos+Leyendas"
    },
    {
        id: 14,
        title: "Bestiario Andino",
        artistId: 7,
        artist: "Sofía Cardona Higuita",
        technique: "Acuarela y tinta",
        dimensions: "55 x 75 cm",
        year: 2023,
        description: "Compendio ilustrado de animales míticos de la cultura andina.",
        image: "https://via.placeholder.com/400x300?text=Bestiario+Andino"
    },

    // Andrés Piedrahita Gómez (artist id: 8)
    {
        id: 15,
        title: "Vasijas Ancestrales",
        artistId: 8,
        artist: "Andrés Piedrahita Gómez",
        technique: "Cerámica",
        dimensions: "40 x 30 x 30 cm",
        year: 2023,
        description: "Réplicas interpretativas de cerámicas prehispánicas con decoración moderna.",
        image: "https://via.placeholder.com/400x300?text=Vasijas+Ancestrales"
    },
    {
        id: 16,
        title: "Símbolos en Barro",
        artistId: 8,
        artist: "Andrés Piedrahita Gómez",
        technique: "Cerámica",
        dimensions: "35 x 35 x 35 cm",
        year: 2022,
        description: "Serie de piezas cerámicas con símbolos geométricos prehispánicos.",
        image: "https://via.placeholder.com/400x300?text=Símbolos+Barro"
    },

    // Daniela Vega Ruiz (artist id: 9)
    {
        id: 17,
        title: "Tejidos de Memoria",
        artistId: 9,
        artist: "Daniela Vega Ruiz",
        technique: "Textil y bordado",
        dimensions: "150 x 200 cm",
        year: 2023,
        description: "Textil colaborativo con comunidades indígenas documentando su historia.",
        image: "https://via.placeholder.com/400x300?text=Tejidos+Memoria"
    },
    {
        id: 18,
        title: "Historias en Hilo",
        artistId: 9,
        artist: "Daniela Vega Ruiz",
        technique: "Textil y bordado",
        dimensions: "120 x 180 cm",
        year: 2023,
        description: "Obra textil que narra historias de resistencia y tradición comunitaria.",
        image: "https://via.placeholder.com/400x300?text=Historias+Hilo"
    },

    // Roberto Álvarez Quiroz (artist id: 10)
    {
        id: 19,
        title: "Transformación Urbana",
        artistId: 10,
        artist: "Roberto Álvarez Quiroz",
        technique: "Pintura mural",
        dimensions: "500 x 300 cm",
        year: 2023,
        description: "Mural comunitario que transforma espacios públicos abandonados.",
        image: "https://via.placeholder.com/400x300?text=Transformación+Urbana"
    },
    {
        id: 20,
        title: "Voces Callejeras",
        artistId: 10,
        artist: "Roberto Álvarez Quiroz",
        technique: "Pintura mural",
        dimensions: "400 x 250 cm",
        year: 2022,
        description: "Mural colectivo que amplifica voces y narrativas del barrio.",
        image: "https://via.placeholder.com/400x300?text=Voces+Callejeras"
    },

    // Catalina Mejía Londoño (artist id: 11)
    {
        id: 21,
        title: "Raíces Recicladas",
        artistId: 11,
        artist: "Catalina Mejía Londoño",
        technique: "Escultura en madera",
        dimensions: "180 x 80 x 60 cm",
        year: 2023,
        description: "Escultura abstracta elaborada con madera reciclada de construcciones antiguas.",
        image: "https://via.placeholder.com/400x300?text=Raíces+Recicladas"
    },
    {
        id: 22,
        title: "Transformaciones",
        artistId: 11,
        artist: "Catalina Mejía Londoño",
        technique: "Escultura en madera",
        dimensions: "150 x 70 x 50 cm",
        year: 2023,
        description: "Serie de esculturas que documentan la transformación de materiales desechados.",
        image: "https://via.placeholder.com/400x300?text=Transformaciones"
    },

    // Fernando Ochoa López (artist id: 12)
    {
        id: 23,
        title: "Memorias Digitales",
        artistId: 12,
        artist: "Fernando Ochoa López",
        technique: "Videoarte",
        dimensions: "Variable",
        year: 2023,
        description: "Videoinstalación que explora la intersección entre memoria analógica y digital.",
        image: "https://via.placeholder.com/400x300?text=Memorias+Digitales"
    },
    {
        id: 24,
        title: "Flujos Temporales",
        artistId: 12,
        artist: "Fernando Ochoa López",
        technique: "Videoarte",
        dimensions: "Variable",
        year: 2022,
        description: "Composición audiovisual que estructura el tiempo de múltiples formas.",
        image: "https://via.placeholder.com/400x300?text=Flujos+Temporales"
    }
];

/**
 * Función para combinar datos de artistas y obras
 */
export const getEnrichedArtworks = () => {
    return demoArtworks.map(artwork => ({
        ...artwork,
        artist: demoArtists.find(a => a.id === artwork.artistId)
    }));
};

/**
 * Datos para filtros disponibles
 */
export const filterOptions = {
    techniques: Array.from(
        new Set([...demoArtworks.map(a => a.technique), ...demoArtists.map(a => a.technique)])
    ).sort(),
    regions: Array.from(new Set(demoArtists.map(a => a.region))).sort(),
    years: Array.from(new Set(demoArtworks.map(a => a.year))).sort((a, b) => b - a)
};
