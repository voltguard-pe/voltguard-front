import {
    Activity,
    Award,
    Building2,
    CheckCircle2,
    FileText,
    GraduationCap,
    HeartPulse,
    ShieldCheck,
    Truck,
    Zap,
    type LucideIcon
} from "lucide-react";

import inenLogo from "/companies_logo/inen.webp";
import recoletaLogo from "/companies_logo/recoleta.webp";
import safeplaceLogo from "/companies_logo/safeplace.webp";
import sikaLogo from "/companies_logo/sika.webp";
import volvoLogo from "/companies_logo/volvo.webp";

import inenImage from "/companies_portraits/inen.webp";
import recoletaImage from "/companies_portraits/recoleta.webp";
import safeplaceImage from "/companies_portraits/safeplace.webp";
import sikaImage from "/companies_portraits/sika-lurin.webp";
import volvoImage from "/companies_portraits/volvo-lurin.webp";

export interface Stat {
    id: string;
    target: number;
    prefix?: string;
    suffix: string;
    label: string;
}

export interface Plan {
    id: "basic" | "enterprise";
    name: string;
    badge?: string;
    priceLabel: string;
    subLabel: string;
    sectorTag: string;
    sectorColor: string;
    description: string;
    featured: boolean;
    features: string[];
    cta: string;
    path: string;
}

export interface Metric {
    label: string;
    value: string;
    icon: LucideIcon;
}

export interface Story {
    id: string;
    company: string;
    logo: string;
    sector: string;
    sectorIcon: LucideIcon;
    image: string;
    sectorColor: string;
    tagline: string;
    challenge: string;
    solution: string;
    metrics: Metric[];
    accentColor: string;
    year: string;
}

export interface FAQItem {
    q: string;
    a: string;
}

export const HOME_CONTENT = {
    seo: {
        title: "VoltGuard | Gemelo Digital de Tableros Eléctricos y Certificación ITSE - GESENER",
        description:
            "El fin del informe estático. Medimos bajo norma (IEC 61000-4-30, IEEE 519, NFPA 70E/70B), firmamos con Ingeniero CIP y su expediente queda consultable 24/7 con QR en planta."
    },

    whatsappUrl:
        "https://wa.me/51970733451?text=Hola%20GESENER,%20deseo%20agendar%20un%20diagn%C3%B3stico%20el%C3%A9ctrico%20para%20mi%20instalaci%C3%B3n.",
    footnoteStats:
        "* Cifras acumuladas de proyectos ejecutados por GESENER. Sustento disponible a solicitud.",

    /* Cuando tengas las fotos reales en /public, coloca aquí sus rutas (ej. "/qr-tablero-real.webp") */
    realCaptures: {
        qrBoardPhoto: "",
        iticScreenshot: "",
        thduScreenshot: ""
    },

    hero: {
        badge: "CHEQUEO ELÉCTRICO & GEMELO DIGITAL",
        titlePrefix: "Su tablero eléctrico ahora tiene un ",
        titleHighlight: "gemelo digital",
        subtitle:
            "El fin del informe estático. Medimos bajo norma, firmamos el informe y su expediente queda consultable 24/7.",
        primaryCta: { label: "Agendar diagnóstico", path: "/contact-sales?service=chequeo" },
        secondaryCta: { label: "Ver la plataforma", path: "/auth" },
        image: "/hero-technician3.webp",
        imageAlt: "Ingeniero realizando inspección eléctrica ITSE con tablet"
    },

    heroStats: [
        { id: "h1", prefix: "+", target: 3940, suffix: "", label: "Tableros con expediente digital*" },
        { id: "h2", prefix: "", target: 100, suffix: "%", label: "Inspecciones ITSE aprobadas*" },
        { id: "h3", prefix: "+", target: 250, suffix: "", label: "Certificados con firma CIP*" }
    ] as Stat[],

    trustStandards: [
        "IEC 61000-4-30",
        "NTCSE",
        "IEEE 519",
        "IEEE 1584",
        "NFPA 70E / 70B",
        "ISO 50001",
        "FIRMA CIP"
    ],

    problems: [
        {
            title: "Fuga de conocimiento",
            description:
                "La rotación de personal técnico se lleva planos, mediciones históricas y criterio operativo en archivos dispersos."
        },
        {
            title: "Multas y clausura ITSE",
            description:
                "Observaciones de Defensa Civil por unifilares desactualizados, falta de firma CIP o rotulación fuera de norma CNE."
        },
        {
            title: "Paradas imprevistas",
            description:
                "Puntos calientes y fallas de aislamiento que detienen la producción sin alertas tempranas de mantenimiento."
        },
        {
            title: "Emisiones y sobrecostos invisibles",
            description:
                "Energía reactiva penalizada y consumos en hora punta sin trazabilidad para reportes ESG o ISO 50001."
        }
    ],

    symptoms: [
        {
            title: "Picos de tensión",
            description:
                "Degradan aislamientos de motores y queman fuentes electrónicas sensibles sin disparar protecciones convencionales."
        },
        {
            title: "Microcortes",
            description:
                "Apagan y reinician PLCs, servidores y variadores de frecuencia en milisegundos, deteniendo líneas completas."
        },
        {
            title: "Sobretensiones",
            description:
                "Someten a tus equipos eléctricos a esfuerzos por encima de su curva de tolerancia ITIC."
        }
    ],

    beforeAfter: {
        before: [
            "Técnico midiendo de forma aislada en campo",
            "Informe estático en Word o PDF entregado por correo",
            "Archivo olvidado sin trazabilidad (cada auditoría empieza de cero)"
        ],
        after: [
            "Medición Clase A (7 días) subida directamente a la nube VoltGuard",
            "Análisis normativo y firma digital de Ingeniero Colegiado (CIP)",
            "Dashboard consultable 24/7 + etiqueta QR adherida en puerta de tablero"
        ]
    },

    digitalTwinSteps: [
        {
            num: "01",
            title: "Medición física",
            description:
                "En campo durante 7 días continuos con analizador de redes Clase A (IEC 61000-4-30)."
        },
        {
            num: "02",
            title: "El QR adherido",
            description:
                "Instalamos la etiqueta con código QR de autenticidad directamente en la puerta del tablero."
        },
        {
            num: "03",
            title: "La tablet del operario",
            description:
                "Lectura en segundos frente al equipo: diagrama unifilar, categoría EPP y últimos hallazgos."
        },
        {
            num: "04",
            title: "Dashboard activo",
            description:
                "Su estudio, curvas ITIC, termografía y certificados con V°B° CIP consultables 24/7."
        }
    ],

    methodology: [
        {
            step: "01",
            badge: "Medición e Instrumental",
            badgeColor: "bg-[#0797d5] text-white",
            accentColor: "#0797d5",
            src: "/specialized_engineers_home.webp",
            title: "Inspección ITSE & Clase A Presencial",
            sub: "Levantamiento de observaciones en campo, revisión técnica de tableros, analizador Clase A (7 días) y pruebas SPAT con instrumentos calibrados."
        },
        {
            step: "02",
            badge: "Norma NFPA 70B / 70E",
            badgeColor: "bg-[#8ccf2f] text-slate-950 font-bold",
            accentColor: "#8ccf2f",
            src: "/thermography_home.webp",
            title: "Análisis Termográfico Predictivo",
            sub: "Detección temprana de puntos calientes, desbalance de fases y cálculo de energía incidente con cámara infrarroja radiométrica."
        },
        {
            step: "03",
            badge: "Firma CIP & QR Validable",
            badgeColor: "bg-slate-800 text-white border border-white/20",
            accentColor: "#0797d5",
            src: "/certification_nfpa_home.jpeg",
            title: "Certificación & Expediente en Nube",
            sub: "Emisión de reportes ejecutivos, diagramas unifilares CNE y dictamen firmado por Ingeniero Colegiado (CIP) vinculado al QR del tablero."
        }
    ],

    otherServiceLines: [
        {
            norm: "CNE · Pliegos OSINERGMIN",
            title: "¿Estás en la tarifa correcta?",
            description:
                "Analizamos tu perfil de carga en hora punta y fuera de punta (HP/HFP), opción tarifaria, potencia contratada y cargos por reactiva.",
            path: "/contact-sales?service=tarifaria"
        },
        {
            norm: "ISO 50001 · GHG Protocol Alcance 2",
            title: "Cada kWh que no se pierde es CO₂ que no se emite",
            description:
                "Construimos tu línea base energética medida, cálculo de t CO₂e evitadas por correctivo y sustento ESG.",
            path: "/contact-sales?service=sostenibilidad"
        },
        {
            norm: "IEC 61724 · CNE",
            title: "Generación propia, medida como corresponde",
            description:
                "Auditoría de plantas fotovoltaicas, análisis de rendimiento, calidad de inyección y diseño de microrredes híbridas.",
            path: "/contact-sales?service=renovables"
        }
    ],

    cumplimiento: [
        {
            id: "itse-cne",
            icon: ShieldCheck,
            title: "Cumplimiento ITSE & CNE",
            badgeColor: "bg-[#0797d5]/10 text-[#0797d5]",
            accentGradient: "from-[#0797d5] to-[#0797d5]/20",
            borderColor: "hover:border-[#0797d5]/40",
            hoverTextColor: "group-hover:text-[#0797d5]",
            checkColor: "text-[#0797d5]",
            items: [
                "Levantamiento de observaciones en campo",
                "Diagramas unifilares y leyendas CNE",
                "Firma de Ingeniero Colegiado (CIP) + QR",
                "Expediente digital listo para Defensa Civil"
            ]
        },
        {
            id: "nfpa-spat",
            icon: Zap,
            title: "Seguridad NFPA 70E / 70B",
            badgeColor: "bg-[#8ccf2f]/15 text-[#528410]",
            accentGradient: "from-[#8ccf2f] to-[#8ccf2f]/20",
            borderColor: "hover:border-[#8ccf2f]/50",
            hoverTextColor: "group-hover:text-[#528410]",
            checkColor: "text-[#8ccf2f]",
            items: [
                "Etiquetas de arco eléctrico (Energía Incidente)",
                "Inspección y termografía infrarroja de precisión",
                "Índice de salud SPAT y tendencia a 5 años",
                "Alertas tempranas para evitar paradas"
            ]
        },
        {
            id: "analytics-energy",
            icon: Activity,
            title: "Analítica & Eficiencia Energética",
            badgeColor: "bg-slate-100 text-slate-800",
            accentGradient: "from-slate-700 to-slate-200",
            borderColor: "hover:border-slate-400/40",
            hoverTextColor: "group-hover:text-slate-800",
            checkColor: "text-slate-700",
            items: [
                "Perfil de consumo y demanda máxima (HP/HFP)",
                "Control de potencia reactiva (Cero penalizaciones)",
                "Estudio de Calidad de Energía (IEC 61000-4-30)",
                "Cálculo de Huella de Carbono (tCO₂eq)"
            ]
        }
    ],

    plans: [
        {
            id: "basic",
            name: "Plan Básico",
            priceLabel: "Gratis",
            subLabel: "01 Tablero Eléctrico",
            sectorTag: "Pequeño Comercio / Bodegas",
            sectorColor: "bg-slate-200 text-slate-700",
            description: "Mapeo y rotulación inicial para pequeños negocios.",
            featured: false,
            cta: "Comenzar Gratis",
            path: "/auth?plan=basic",
            features: [
                "01 Tablero eléctrico registrado",
                "Diagrama unifilar base en PDF",
                "Rotulación / leyenda de circuitos en PDF",
                "Visor web digital VoltGuard"
            ]
        },
        {
            id: "enterprise",
            name: "Plan Empresarial",
            badge: "Alta Exigencia",
            priceLabel: "Contáctenos",
            subLabel: "Más de 05 Tableros Eléctricos",
            sectorTag: "Industria / Plantas / Multi-Sede",
            sectorColor: "bg-[#8ccf2f]/20 text-[#528410]",
            description: "Solución integral de monitoreo, termografía y analítica energética.",
            featured: true,
            cta: "Contactar Ventas",
            path: "/contact-sales?plan=enterprise",
            features: [
                "Más de 05 Tableros eléctricos (Multi-Sede)",
                "Certificación ITSE, diagramas unifilares y firma CIP",
                "Inspección termográfica infrarroja (NFPA 70B)",
                "Etiquetado de seguridad eléctrica (NFPA 70E)",
                "Medición de pozo a tierra (SPAT - 5 años)",
                "Analítica de consumo, reactiva y Power Quality"
            ]
        }
    ] as Plan[],

    planFootnotes: [
        "La emisión de certificados con firma CIP y el monitoreo continuo con medidores IoT están condicionados al Plan Empresarial."
    ],

    stories: [
        {
            id: "sika",
            company: "SIKA Perú",
            logo: sikaLogo,
            sector: "Industria",
            sectorIcon: Building2,
            image: sikaImage,
            sectorColor: "text-orange-600",
            tagline: "Inspección y evaluación técnica de tableros eléctricos industriales",
            challenge:
                "SIKA requería conocer el estado actual de sus tableros eléctricos en áreas de producción para identificar posibles riesgos y oportunidades de mejora.",
            solution:
                "Se realizó la inspección técnica de los tableros, verificando componentes, protecciones, condiciones de operación y levantando observaciones para su posterior corrección.",
            year: "2026",
            accentColor: "#f97316",
            metrics: [
                { label: "Tableros inspeccionados", value: "73", icon: Zap },
                { label: "Observaciones registradas", value: "18", icon: FileText },
                { label: "Informe técnico", value: "1", icon: CheckCircle2 },
                { label: "Servicio", value: "Completado", icon: Award }
            ]
        },
        {
            id: "recoleta",
            company: "Colegio SS.CC. Recoleta",
            logo: recoletaLogo,
            sector: "Educación",
            sectorIcon: GraduationCap,
            image: recoletaImage,
            sectorColor: "text-violet-600",
            tagline: "Evaluación de tableros eléctricos en infraestructura educativa",
            challenge:
                "El colegio buscaba verificar las condiciones de seguridad y operación de los tableros eléctricos distribuidos en sus diferentes ambientes.",
            solution:
                "Se inspeccionaron los tableros eléctricos y se documentaron observaciones relacionadas con seguridad, identificación y mantenimiento.",
            year: "2026",
            accentColor: "#7c3aed",
            metrics: [
                { label: "Tableros inspeccionados", value: "109", icon: Zap },
                { label: "Observaciones registradas", value: "17", icon: FileText },
                { label: "Informe técnico", value: "1", icon: CheckCircle2 },
                { label: "Servicio", value: "Completado", icon: Award }
            ]
        },
        {
            id: "inen",
            company: "INEN",
            logo: inenLogo,
            sector: "Salud",
            sectorIcon: HeartPulse,
            image: inenImage,
            sectorColor: "text-sky-600",
            tagline: "Inspección eléctrica en instalaciones críticas de salud",
            challenge:
                "Era necesario verificar las condiciones de operación de tableros eléctricos que alimentan áreas críticas y de soporte.",
            solution:
                "Se desarrolló una inspección técnica documentada, registrando hallazgos y recomendaciones para mejorar la confiabilidad de las instalaciones.",
            year: "2026",
            accentColor: "#0284c7",
            metrics: [
                { label: "Tableros inspeccionados", value: "12", icon: Zap },
                { label: "Observaciones registradas", value: "14", icon: FileText },
                { label: "Informe técnico", value: "1", icon: CheckCircle2 },
                { label: "Servicio", value: "Completado", icon: Award }
            ]
        },
        {
            id: "safeplace",
            company: "Safeplace",
            logo: safeplaceLogo,
            sector: "Arquitectura",
            sectorIcon: Building2,
            image: safeplaceImage,
            sectorColor: "text-rose-600",
            tagline: "Inspección y mantenimiento de tableros eléctricos para una clínica",
            challenge:
                "La instalación requería evaluar el estado de sus tableros eléctricos y ejecutar mantenimiento preventivo para garantizar su correcto funcionamiento.",
            solution:
                "Se realizó la inspección técnica, limpieza, ajuste de conexiones y documentación de observaciones para futuras acciones de mejora.",
            year: "2026",
            accentColor: "#e11d48",
            metrics: [
                { label: "Tableros atendidos", value: "5", icon: Zap },
                { label: "Mantenimientos realizados", value: "12", icon: CheckCircle2 },
                { label: "Observaciones registradas", value: "8", icon: FileText },
                { label: "Servicio", value: "Completado", icon: Award }
            ]
        },
        {
            id: "volvo",
            company: "Volvo Perú",
            logo: volvoLogo,
            sector: "Transporte",
            sectorIcon: Truck,
            image: volvoImage,
            sectorColor: "text-blue-700",
            tagline: "Evaluación técnica de tableros eléctricos en instalaciones de servicio",
            challenge:
                "Se requería conocer el estado de los tableros eléctricos que alimentan las áreas operativas y talleres.",
            solution:
                "Se realizó una inspección completa de los tableros eléctricos, verificando componentes, protecciones y condiciones generales de operación.",
            year: "2026",
            accentColor: "#1d4ed8",
            metrics: [
                { label: "Tableros inspeccionados", value: "171", icon: Zap },
                { label: "Observaciones registradas", value: "13", icon: FileText },
                { label: "Informe técnico", value: "1", icon: CheckCircle2 },
                { label: "Servicio", value: "Completado", icon: Award }
            ]
        }
    ] as Story[],

    faqs: [
        {
            q: "¿Cómo ayuda VoltGuard a aprobar las Inspecciones ITSE de Defensa Civil?",
            a: "VoltGuard organiza y mantiene actualizados los diagramas unifilares en CAD, certificados de operatividad firmados por un Ingeniero Colegiado (CIP) y la rotulación normativa CNE para que tu establecimiento supere cualquier auditoría de ITSE sin riesgo de clausura."
        },
        {
            q: "¿Qué tipo de documentación técnica puedo centralizar en cada tablero?",
            a: "VoltGuard almacena certificados de operatividad, diagramas unifilares (PDF/DWG), leyendas de circuitos CNE, protocolos de puesta a tierra, curvas de calidad de energía (ITIC / THD-U) y reportes de termografía infrarroja."
        },
        {
            q: "¿Cuál es la diferencia entre el Plan Básico y el Plan Empresarial?",
            a: "El Plan Básico es gratuito y te permite digitalizar y consultar 01 tablero eléctrico con su diagrama unifilar y leyenda en PDF. El Plan Empresarial cubre instalaciones de más de 05 tableros o multi-sede e incluye estudios de Calidad de Energía Clase A (7 días), termografía NFPA 70B, arco eléctrico NFPA 70E, medición SPAT y certificados firmados por Ingeniero CIP."
        },
        {
            q: "¿Los certificados expedidos cuentan con firma de Ingeniero Colegiado?",
            a: "Sí. En el Plan Empresarial, la gestión documental incluye la validación y firma de un Ingeniero Colegiado y Habilitado (CIP) especialista en instalaciones eléctricas, vinculada al QR del tablero."
        },
        {
            q: "¿Quién realiza el trabajo técnico en campo y sube los documentos?",
            a: "El equipo especializado de GESENER / VoltGuard realiza la inspección presencial, mediciones de calidad de energía, pruebas de pozo a tierra y termografía. Todos los planos, reportes y certificados quedan disponibles en tu gemelo digital."
        }
    ] as FAQItem[]
};