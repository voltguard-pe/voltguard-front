import { useEffect, useRef, useState } from "react";
import {
    ArrowRight,
    Award,
    BarChart3,
    Building2,
    CheckCircle2,
    FileText,
    GraduationCap,
    HeartPulse,
    Landmark,
    Quote,
    ShieldCheck,
    Star,
    Truck,
    TrendingUp,
    Users,
    Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface Metric {
    label: string;
    value: string;
    icon: React.ElementType;
}

interface Story {
    id: string;
    company: string;
    sector: string;
    sectorIcon: React.ElementType;
    sectorColor: string;
    tagline: string;
    challenge: string;
    solution: string;
    quote: string;
    quoteAuthor: string;
    quoteRole: string;
    metrics: Metric[];
    accentColor: string;
    bgAccent: string;
    year: string;
}

/* ─── Hook: repetible en scroll ─────────────────────────────────────────── */

function useInViewRepeatable(threshold = 0.12) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => setInView(entry.isIntersecting),
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);

    return { ref, inView };
}

/* ─── Data ───────────────────────────────────────────────────────────────── */

const stories: Story[] = [
    {
        id: "sika",
        company: "SIKA",
        sector: "Industria",
        sectorIcon: Building2,
        sectorColor: "text-orange-600",
        tagline: "Control eléctrico industrial centralizado en una sola plataforma",
        challenge:
            "SIKA operaba más de 80 tableros distribuidos en tres plantas de producción sin visibilidad unificada, con registros en papel y sin alertas de mantenimiento preventivo.",
        solution:
            "Implementaron Voltguard para centralizar la gestión de sus tableros, digitalizar certificaciones y programar mantenimientos automáticos con alertas por rol.",
        quote:
            "Voltguard nos dio visibilidad total sobre nuestros activos eléctricos. Lo que antes nos tomaba días de auditoría ahora lo vemos en segundos.",
        quoteAuthor: "Carlos Mendoza",
        quoteRole: "Gerente de Infraestructura — SIKA Perú",
        year: "2023",
        accentColor: "#f97316",
        bgAccent: "bg-orange-50",
        metrics: [
            { label: "Tableros gestionados", value: "86", icon: Zap },
            { label: "Reducción de incidencias", value: "64%", icon: TrendingUp },
            { label: "Ahorro en auditorías", value: "70%", icon: BarChart3 },
            { label: "Usuarios activos", value: "24", icon: Users },
        ],
    },
    {
        id: "recoleta",
        company: "RECOLETA",
        sector: "Educación",
        sectorIcon: GraduationCap,
        sectorColor: "text-violet-600",
        tagline: "Infraestructura eléctrica segura para miles de estudiantes",
        challenge:
            "El colegio Recoleta administraba su red eléctrica de múltiples edificios con planillas Excel dispersas y sin trazabilidad de intervenciones técnicas.",
        solution:
            "Voltguard permitió unificar todos los tableros de los cinco edificios, digitalizar los planos unifilares y asignar responsables por área.",
        quote:
            "La seguridad de nuestros alumnos depende también de una infraestructura eléctrica bien gestionada. Voltguard nos da esa tranquilidad.",
        quoteAuthor: "Lic. Patricia Soto",
        quoteRole: "Directora Administrativa — Colegio Recoleta",
        year: "2023",
        accentColor: "#7c3aed",
        bgAccent: "bg-violet-50",
        metrics: [
            { label: "Edificios conectados", value: "5", icon: Building2 },
            { label: "Tableros digitalizados", value: "32", icon: Zap },
            { label: "Tiempo de respuesta", value: "-80%", icon: TrendingUp },
            { label: "Documentos migrados", value: "120+", icon: FileText },
        ],
    },
    {
        id: "inen",
        company: "INEN",
        sector: "Gobierno",
        sectorIcon: Landmark,
        sectorColor: "text-sky-600",
        tagline: "Gestión eléctrica de una institución pública de alta criticidad",
        challenge:
            "El Instituto Nacional de Enfermedades Neoplásicas necesitaba cumplir normativas técnicas estrictas con documentación auditable y acceso diferenciado por dependencia.",
        solution:
            "Se desplegó Voltguard con perfiles de superadmin por dependencia, integración de termografías y generación automática de reportes para auditorías estatales.",
        quote:
            "Cumplir los estándares del MINEM requería un sistema robusto. Voltguard nos permitió tener toda la documentación lista para cualquier fiscalización.",
        quoteAuthor: "Ing. Roberto Quispe",
        quoteRole: "Jefe de Mantenimiento — INEN",
        year: "2024",
        accentColor: "#0284c7",
        bgAccent: "bg-sky-50",
        metrics: [
            { label: "Tableros críticos", value: "54", icon: ShieldCheck },
            { label: "Normativas cumplidas", value: "100%", icon: CheckCircle2 },
            { label: "Reportes generados", value: "200+", icon: FileText },
            { label: "Áreas gestionadas", value: "12", icon: Building2 },
        ],
    },
    {
        id: "clinica",
        company: "CLÍNICA SANTA ROSA",
        sector: "Salud",
        sectorIcon: HeartPulse,
        sectorColor: "text-rose-600",
        tagline: "Cero tolerancia a fallos: gestión eléctrica hospitalaria",
        challenge:
            "En un entorno hospitalario, los cortes de energía representan riesgo de vida. La clínica necesitaba trazabilidad completa y alertas en tiempo real sobre sus tableros.",
        solution:
            "Voltguard fue desplegado con acceso 24/7, notificaciones inmediatas ante anomalías de temperatura y gestión documental de certificados obligatorios de habilitación.",
        quote:
            "En salud no hay margen de error. Voltguard nos garantiza que cada tablero está certificado y que cualquier anomalía es atendida antes de convertirse en un problema.",
        quoteAuthor: "Ing. Mario Tapia",
        quoteRole: "Jefe de Ingeniería Clínica — Clínica Santa Rosa",
        year: "2024",
        accentColor: "#e11d48",
        bgAccent: "bg-rose-50",
        metrics: [
            { label: "Tableros monitoreados", value: "41", icon: Zap },
            { label: "Uptime del sistema", value: "99.9%", icon: TrendingUp },
            { label: "Alertas procesadas", value: "1,200+", icon: ShieldCheck },
            { label: "Certificaciones activas", value: "41", icon: Award },
        ],
    },
    {
        id: "volvo",
        company: "VOLVO TRUCKS",
        sector: "Transporte",
        sectorIcon: Truck,
        sectorColor: "text-blue-700",
        tagline: "Operaciones de flota respaldadas por infraestructura eléctrica confiable",
        challenge:
            "Las instalaciones de servicio de Volvo en tres regiones del país operaban sin un sistema unificado para la gestión de sus tableros de fuerza y control.",
        solution:
            "Voltguard unificó la gestión multi-sede, permitiendo al equipo corporativo supervisar el estado eléctrico de cada taller desde un único panel de control.",
        quote:
            "Tener visibilidad en tiempo real de las tres sedes cambió completamente nuestra forma de planificar el mantenimiento preventivo.",
        quoteAuthor: "Ing. Andrés Flores",
        quoteRole: "Superintendente de Operaciones — Volvo Trucks Perú",
        year: "2024",
        accentColor: "#1d4ed8",
        bgAccent: "bg-blue-50",
        metrics: [
            { label: "Sedes conectadas", value: "3", icon: Building2 },
            { label: "Tableros de fuerza", value: "68", icon: Zap },
            { label: "Reducción de paradas", value: "55%", icon: TrendingUp },
            { label: "Técnicos en plataforma", value: "18", icon: Users },
        ],
    },
    {
        id: "odebrecht",
        company: "OSE CONSTRUCTORA",
        sector: "Construcción",
        sectorIcon: Building2,
        sectorColor: "text-amber-600",
        tagline: "Gestión eléctrica en proyectos de obra de gran escala",
        challenge:
            "En proyectos de infraestructura de largo plazo, la rotación de personal y la dispersión geográfica dificultaban mantener documentación eléctrica actualizada y accesible.",
        solution:
            "Voltguard fue adoptado como plataforma estándar de documentación eléctrica en obra, con acceso por proyecto y control de versiones de planos y certificados.",
        quote:
            "Voltguard se convirtió en el estándar para nuestra documentación eléctrica en obra. Ahora cada proyecto entrega su legajo técnico completo y trazable.",
        quoteAuthor: "Ing. Luis Carrera",
        quoteRole: "Gerente de Proyectos Eléctricos — OSE Constructora",
        year: "2023",
        accentColor: "#d97706",
        bgAccent: "bg-amber-50",
        metrics: [
            { label: "Proyectos activos", value: "9", icon: Building2 },
            { label: "Tableros por obra", value: "120+", icon: Zap },
            { label: "Legajos digitalizados", value: "100%", icon: FileText },
            { label: "Equipos en campo", value: "60+", icon: Users },
        ],
    },
    {
        id: "bbva",
        company: "BBVA",
        sector: "Banca",
        sectorIcon: Landmark,
        sectorColor: "text-[#0797d5]",
        tagline: "Infraestructura eléctrica bancaria bajo estrictos estándares de continuidad",
        challenge:
            "BBVA requería garantizar continuidad operativa en sus sucursales con gestión centralizada de activos eléctricos y cumplimiento de normativas de la SBS.",
        solution:
            "Voltguard fue implementado para gestionar los tableros de todas las sucursales, con roles diferenciados por zona geográfica y reportes automáticos para auditorías regulatorias.",
        quote:
            "La continuidad operativa es innegociable en banca. Con Voltguard tenemos el control y la trazabilidad que exigen tanto los auditores internos como la SBS.",
        quoteAuthor: "Ing. Claudia Vargas",
        quoteRole: "Subgerenta de Infraestructura Tecnológica — BBVA Perú",
        year: "2024",
        accentColor: "#0797d5",
        bgAccent: "bg-[#0797d5]/5",
        metrics: [
            { label: "Sucursales conectadas", value: "47", icon: Building2 },
            { label: "Tableros gestionados", value: "188", icon: Zap },
            { label: "Cumplimiento SBS", value: "100%", icon: ShieldCheck },
            { label: "Tiempo de auditoría", value: "-75%", icon: TrendingUp },
        ],
    },
];

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function MetricCard({
    metric,
    inView,
    delay,
    accentColor,
}: {
    metric: Metric;
    inView: boolean;
    delay: number;
    accentColor: string;
}) {
    const Icon = metric.icon;
    return (
        <div
            style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(16px)",
                transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
            }}
            className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-2
                hover:-translate-y-0.5 hover:shadow-md transition-shadow duration-200"
        >
            <div
                className="size-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
            >
                <Icon size={18} />
            </div>
            <span className="text-2xl font-black text-slate-950 tracking-tight">{metric.value}</span>
            <span className="text-xs text-slate-500 leading-tight">{metric.label}</span>
        </div>
    );
}

function StoryCard({ story, index }: { story: Story; index: number }) {
    const { ref, inView } = useInViewRepeatable(0.08);
    const isEven = index % 2 === 0;
    const SectorIcon = story.sectorIcon;

    return (
        <div
            ref={ref}
            style={{
                opacity: inView ? 1 : 0,
                transform: inView
                    ? "translateY(0)"
                    : "translateY(40px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
            className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm
                hover:shadow-xl hover:shadow-slate-200/80 transition-shadow duration-300"
        >
            <div className={`grid lg:grid-cols-2 ${!isEven ? "lg:[&>*:first-child]:order-2" : ""}`}>

                {/* LEFT — info */}
                <div className="p-8 lg:p-10 flex flex-col gap-6">
                    {/* header */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span
                                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1
                                        rounded-full border ${story.sectorColor}`}
                                    style={{ borderColor: `${story.accentColor}30`, backgroundColor: `${story.accentColor}08` }}
                                >
                                    <SectorIcon size={12} />
                                    {story.sector}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">{story.year}</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-950 tracking-tight">
                                {story.company}
                            </h3>
                            <p className="mt-1 text-sm font-semibold" style={{ color: story.accentColor }}>
                                {story.tagline}
                            </p>
                        </div>
                        <div
                            className="shrink-0 size-12 rounded-2xl flex items-center justify-center"
                            style={{ backgroundColor: `${story.accentColor}12` }}
                        >
                            <SectorIcon size={22} style={{ color: story.accentColor }} />
                        </div>
                    </div>

                    {/* challenge / solution */}
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                                Desafío
                            </p>
                            <p className="text-sm text-slate-600 leading-relaxed">{story.challenge}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                                Solución
                            </p>
                            <p className="text-sm text-slate-600 leading-relaxed">{story.solution}</p>
                        </div>
                    </div>

                    {/* quote */}
                    <div
                        className="rounded-2xl p-5 border-l-4"
                        style={{
                            backgroundColor: `${story.accentColor}06`,
                            borderLeftColor: story.accentColor,
                        }}
                    >
                        <Quote size={18} className="mb-2 opacity-40" style={{ color: story.accentColor }} />
                        <p className="text-sm text-slate-700 leading-relaxed italic">
                            "{story.quote}"
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                            <div
                                className="size-7 rounded-full flex items-center justify-center text-xs font-black text-white"
                                style={{ background: `linear-gradient(135deg, ${story.accentColor}, #8ccf2f)` }}
                            >
                                {story.quoteAuthor.charAt(0)}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-800">{story.quoteAuthor}</p>
                                <p className="text-xs text-slate-400">{story.quoteRole}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT — metrics */}
                <div
                    className="p-8 lg:p-10 flex flex-col justify-center gap-6"
                    style={{ backgroundColor: `${story.accentColor}04` }}
                >
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-4"
                            style={{ color: story.accentColor }}>
                            Resultados clave
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {story.metrics.map((metric, i) => (
                                <MetricCard
                                    key={metric.label}
                                    metric={metric}
                                    inView={inView}
                                    delay={300 + i * 80}
                                    accentColor={story.accentColor}
                                />
                            ))}
                        </div>
                    </div>

                    {/* stars */}
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                        <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    size={14}
                                    className="fill-amber-400 text-amber-400"
                                    style={{
                                        opacity: inView ? 1 : 0,
                                        transform: inView ? "scale(1)" : "scale(0)",
                                        transition: `opacity 0.3s ease ${500 + i * 60}ms, transform 0.3s ease ${500 + i * 60}ms`,
                                    }}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                            Valoración del cliente
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Ticker de logos ────────────────────────────────────────────────────── */

function LogoTicker() {
    const logos = stories.map((s) => ({ name: s.company, color: s.accentColor, icon: s.sectorIcon }));
    const doubled = [...logos, ...logos];

    return (
        <div className="overflow-hidden py-6 border-y border-slate-200 bg-white">
            <div
                className="flex gap-12 items-center"
                style={{ animation: "tickerScroll 22s linear infinite", width: "max-content" }}
            >
                {doubled.map((l, i) => {
                    const Icon = l.icon;
                    return (
                        <div key={i} className="flex items-center gap-2.5 shrink-0 opacity-50 hover:opacity-100
                            transition-opacity duration-300">
                            <div className="size-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${l.color}15`, color: l.color }}>
                                <Icon size={16} />
                            </div>
                            <span className="text-sm font-black text-slate-700 tracking-wide">{l.name}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function SuccessStoriesPage() {
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string>("Todos");

    const { ref: heroRef } = useInViewRepeatable(0.1);
    const { ref: statsRef, inView: statsVisible } = useInViewRepeatable(0.2);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 60);
        return () => clearTimeout(t);
    }, []);

    const sectors = ["Todos", ...Array.from(new Set(stories.map((s) => s.sector)))];
    const filtered = activeFilter === "Todos" ? stories : stories.filter((s) => s.sector === activeFilter);

    return (
        <div className="bg-slate-50 min-h-screen">

            {/* keyframes */}
            <style>{`
                @keyframes tickerScroll {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-50%); }
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(28px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes gradShift {
                    0%,100% { background-position: 0% 50%; }
                    50%     { background-position: 100% 50%; }
                }
            `}</style>

            {/* ── HERO ──────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-30">
                <div className="absolute -top-40 -left-40 size-[480px] rounded-full bg-[#0797d5]/8 blur-3xl pointer-events-none" />
                <div className="absolute -top-20 right-0 size-96 rounded-full bg-[#8ccf2f]/8 blur-3xl pointer-events-none" />

                <div
                    ref={heroRef}
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center relative z-10"
                >
                    <div
                        style={{
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? "translateY(0)" : "translateY(20px)",
                            transition: "opacity 0.6s ease 0.05s, transform 0.6s ease 0.05s",
                        }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                            border border-[#0797d5]/20 bg-[#0797d5]/5
                            text-sm font-semibold text-[#0797d5] mb-6">
                            <Award size={15} />
                            Casos de éxito
                        </div>
                    </div>

                    <h1
                        className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.06]"
                        style={{
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? "translateY(0)" : "translateY(24px)",
                            transition: "opacity 0.6s ease 0.12s, transform 0.6s ease 0.12s",
                        }}
                    >
                        Empresas que confían en{" "}
                        <span
                            className="bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] bg-clip-text text-transparent"
                            style={{ backgroundSize: "200% 200%", animation: "gradShift 4s ease infinite" }}
                        >
                            Voltguard
                        </span>
                    </h1>

                    <p
                        className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto leading-8"
                        style={{
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? "translateY(0)" : "translateY(20px)",
                            transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
                        }}
                    >
                        Desde hospitales hasta bancos, empresas líderes de distintos sectores
                        han transformado su gestión eléctrica con nuestra plataforma.
                    </p>

                    {/* global stats */}
                    <div
                        ref={statsRef}
                        className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
                        style={{
                            opacity: mounted ? 1 : 0,
                            transition: "opacity 0.6s ease 0.3s",
                        }}
                    >
                        {[
                            { value: "7", label: "Empresas destacadas", color: "#0797d5" },
                            { value: "500+", label: "Tableros gestionados", color: "#8ccf2f" },
                            { value: "5", label: "Sectores cubiertos", color: "#f97316" },
                            { value: "99%", label: "Satisfacción promedio", color: "#e11d48" },
                        ].map(({ value, label, color }, i) => (
                            <div
                                key={label}
                                className="bg-white border border-slate-200 rounded-2xl px-5 py-4
                                    hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                                style={{
                                    opacity: statsVisible ? 1 : 0,
                                    transform: statsVisible ? "translateY(0)" : "translateY(16px)",
                                    transition: `opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms`,
                                }}
                            >
                                <span className="block text-3xl font-black tracking-tight"
                                    style={{ color }}>{value}</span>
                                <span className="text-xs text-slate-500 mt-1 block">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TICKER ────────────────────────────────────────────────── */}
            <LogoTicker />

            {/* ── FILTERS ───────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">
                        Filtrar por sector:
                    </span>
                    {sectors.map((sector) => (
                        <button
                            key={sector}
                            onClick={() => setActiveFilter(sector)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold
                                transition-all duration-200
                                ${activeFilter === sector
                                    ? "bg-[#0797d5] text-white shadow-md shadow-[#0797d5]/25"
                                    : "bg-white border border-slate-200 text-slate-600 hover:border-[#0797d5]/40 hover:text-[#0797d5]"
                                }`}
                        >
                            {sector}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── STORIES ───────────────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-8">
                {filtered.map((story, i) => (
                    <StoryCard key={story.id} story={story} index={i} />
                ))}

                {filtered.length === 0 && (
                    <div className="text-center py-24 text-slate-400">
                        <Building2 size={40} className="mx-auto mb-4 opacity-30" />
                        <p className="font-semibold">No hay casos para este sector aún.</p>
                    </div>
                )}
            </section>

            {/* ── CTA FINAL ─────────────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-10 lg:p-14
                    relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 size-80 rounded-full
                        bg-[#0797d5]/20 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-20 left-1/3 size-64 rounded-full
                        bg-[#8ccf2f]/15 blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center
                        justify-between gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                                bg-[#8ccf2f]/15 border border-[#8ccf2f]/30 text-[#8ccf2f]
                                text-xs font-bold mb-5">
                                <CheckCircle2 size={13} />
                                Tu empresa puede ser la próxima
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                                ¿Listo para transformar tu<br />gestión eléctrica?
                            </h2>
                            <p className="mt-4 text-white/60 text-sm leading-7 max-w-lg">
                                Únete a las empresas líderes que ya confían en Voltguard para
                                centralizar, documentar y optimizar su infraestructura eléctrica.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/auth")}
                            className="group shrink-0 inline-flex items-center gap-2.5 px-8 py-4
                                bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-sm
                                rounded-2xl transition-all duration-250
                                hover:scale-105 hover:shadow-2xl hover:shadow-black/30"
                        >
                            Comenzar ahora
                            <ArrowRight size={18}
                                className="group-hover:translate-x-1 transition-transform duration-200" />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}