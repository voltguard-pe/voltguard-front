import {
    Activity,
    ArrowLeft,
    ArrowRight,
    Award,
    BarChart3,
    Building2,
    Check,
    CheckCircle2,
    ChevronDown,
    Cpu,
    FileCheck,
    FileCode,
    FileText,
    FolderCheck,
    GraduationCap,
    HeartPulse,
    HelpCircle,
    Layers,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Truck,
    Users,
    X,
    Zap,
    type LucideIcon
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* Logos de Empresas */
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

/* ─── Interfaces ─────────────────────────────────────────────────────────── */

interface Feature { title: string; description: string; icon: React.ElementType; }
interface Stat { id: string; target: number; suffix: string; label: string; }
interface Plan {
    id: "basic" | "pyme" | "enterprise";
    name: string; badge?: string; priceLabel: string; subLabel: string; sectorTag: string; sectorColor: string;
    description: string; color: string; featured: boolean; features: string[]; cta: string; path: string;
    limits: { empresas: number | string; tableros: number | string; usuarios: number | string; docs: number | string; };
}
interface Metric { label: string; value: string; icon: React.ElementType; }
interface Story {
    id: string; company: string; logo: string; sector: string; sectorIcon: React.ElementType; image: string;
    sectorColor: string; tagline: string; challenge: string; solution: string; metrics: Metric[]; accentColor: string; bgAccent: string; year: string;
}
interface FAQItem { q: string; a: string; }

/* ─── Datos Consolidados ─────────────────────────────────────────────────── */

const features: Feature[] = [
    {
        title: "Módulo de Tableros Eléctricos",
        description: "Inventario centralizado de activos, rotulación CNE, leyendas dinámicas y carga de diagramas unifilares en CAD/PDF.",
        icon: Cpu
    },
    {
        title: "Módulo de Mantenimiento & SPAT",
        description: "Programación de inspecciones termográficas NFPA 70B, tendencia de resistencia de pozo a tierra y alertas de prevención.",
        icon: ShieldCheck
    },
    {
        title: "Vault Documental & CIP",
        description: "Almacenamiento de certificados de operatividad, protocolos de pruebas, firmas CIP de colegiados y QR de validación.",
        icon: FolderCheck
    },
    {
        title: "Módulo de Analítica & Power Quality",
        description: "Monitoreo de demanda máxima (HP/HFP), factor de potencia reactiva, huella de carbono y calidad de energía.",
        icon: BarChart3
    }
];

const heroStats: Stat[] = [
    { id: "h1", target: 100, suffix: "%", label: "Inspecciones ITSE aprobadas" },
    { id: "h2", target: 1940, suffix: "+", label: "Tableros certificados" },
    { id: "h3", target: 450, suffix: "", label: "Certificados ITSE emitidos" },
];

const plans: Plan[] = [
    {
        id: "basic",
        name: "Plan Básico",
        priceLabel: "Gratis",
        subLabel: "01 Tablero Eléctrico",
        sectorTag: "Pequeño Comercio / Bodegas",
        sectorColor: "bg-slate-200 text-slate-700",
        description: "Mapeo y rotulación inicial para pequeños negocios.",
        color: "slate",
        featured: false,
        cta: "Comenzar Gratis",
        path: "/auth?plan=basic",
        features: [
            "01 Tablero eléctrico registrado",
            "Diagrama unifilar base en PDF",
            "Rotulación / leyenda de circuitos en PDF",
            "Visor web digital VoltGuard"
        ],
        limits: { empresas: 1, tableros: 1, usuarios: 1, docs: 3 }
    },
    {
        id: "pyme",
        name: "Plan Intermedio",
        badge: "Recomendado PYME",
        priceLabel: "S/ 350.00 + IGV",
        subLabel: "01 a 04 Tableros Eléctricos",
        sectorTag: "Comercial / Servicios / PYMEs",
        sectorColor: "bg-[#0797d5]/15 text-[#0797d5]",
        description: "Ideal para regularizar licencias ITSE y unifilares exigidos por ley.",
        color: "blue",
        featured: true,
        cta: "Adquirir Plan Intermedio",
        path: "/contact-sales?plan=pyme",
        features: [
            "De 01 a 04 Tableros eléctricos",
            "Diagrama unifilar CAD y leyenda CNE",
            "Gestión de seguridad e inspección ITSE",
            "Firma de Ingeniero Colegiado (CIP)",
            "Mantenimiento preventivo de tableros",
            "Certificados de operatividad oficiales"
        ],
        limits: { empresas: 1, tableros: 4, usuarios: 5, docs: "Ilimitados" }
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
        color: "slate",
        featured: false,
        cta: "Contactar Ventas",
        path: "/contact-sales?plan=enterprise",
        features: [
            "Más de 05 Tableros eléctricos (Multi-Sede)",
            "Todo el alcance del Plan Intermedio",
            "Inspección termográfica infrarroja (NFPA 70B)",
            "Etiquetado de seguridad eléctrica (NFPA 70E)",
            "Medición de pozo a tierra (SPAT - 5 años)",
            "Analítica de consumo, reactiva y Power Quality"
        ],
        limits: { empresas: "Multi-sede", tableros: "Ilimitados", usuarios: "Ilimitados", docs: "Ilimitados" }
    }
];

const stories: Story[] = [
    {
        id: "sika", company: "SIKA Perú", logo: sikaLogo, sector: "Industria", sectorIcon: Building2, image: sikaImage,
        sectorColor: "text-orange-600", tagline: "Inspección y evaluación técnica de tableros eléctricos industriales",
        challenge: "SIKA requería conocer el estado actual de sus tableros eléctricos en áreas de producción para identificar posibles riesgos y oportunidades de mejora.",
        solution: "Se realizó la inspección técnica de los tableros, verificando componentes, protecciones, condiciones de operación y levantando observaciones para su posterior corrección.", year: "2026", accentColor: "#f97316", bgAccent: "bg-orange-50",
        metrics: [
            { label: "Tableros inspeccionados", value: "73", icon: Zap },
            { label: "Observaciones registradas", value: "18", icon: FileText },
            { label: "Informe técnico", value: "1", icon: CheckCircle2 },
            { label: "Servicio", value: "Completado", icon: Award },
        ],
    },
    {
        id: "recoleta", company: "Colegio SS.CC. Recoleta", logo: recoletaLogo, sector: "Educación", sectorIcon: GraduationCap, image: recoletaImage,
        sectorColor: "text-violet-600", tagline: "Evaluación de tableros eléctricos en infraestructura educativa",
        challenge: "El colegio buscaba verificar las condiciones de seguridad y operación de los tableros eléctricos distribuidos en sus diferentes ambientes.",
        solution: "Se inspeccionaron los tableros eléctricos y se documentaron observaciones relacionadas con seguridad, identificación y mantenimiento.",
        year: "2026", accentColor: "#7c3aed", bgAccent: "bg-violet-50",
        metrics: [
            { label: "Tableros inspeccionados", value: "109", icon: Zap },
            { label: "Observaciones registradas", value: "17", icon: FileText },
            { label: "Informe técnico", value: "1", icon: CheckCircle2 },
            { label: "Servicio", value: "Completado", icon: Award },
        ],
    },
    {
        id: "inen", company: "INEN", logo: inenLogo, sector: "Salud", sectorIcon: HeartPulse, image: inenImage,
        sectorColor: "text-sky-600", tagline: "Inspección eléctrica en instalaciones críticas de salud",
        challenge: "Era necesario verificar las condiciones de operación de tableros eléctricos que alimentan áreas críticas y de soporte.",
        solution: "Se desarrolló una inspección técnica documentada, registrando hallazgos y recomendaciones para mejorar la confiabilidad de las instalaciones.",
        year: "2026", accentColor: "#0284c7", bgAccent: "bg-sky-50",
        metrics: [
            { label: "Tableros inspeccionados", value: "12", icon: Zap },
            { label: "Observaciones registradas", value: "14", icon: FileText },
            { label: "Informe técnico", value: "1", icon: CheckCircle2 },
            { label: "Servicio", value: "Completado", icon: Award },
        ],
    },
    {
        id: "safeplace", company: "Safeplace", logo: safeplaceLogo, sector: "Arquitectura", sectorIcon: Building2, image: safeplaceImage,
        sectorColor: "text-rose-600", tagline: "Inspección y mantenimiento de tableros eléctricos para una clínica",
        challenge: "La instalación requería evaluar el estado de sus tableros eléctricos y ejecutar mantenimiento preventivo para garantizar su correcto funcionamiento.",
        solution: "Se realizó la inspección técnica, limpieza, ajuste de conexiones y documentación de observaciones para futuras acciones de mejora.",
        year: "2026", accentColor: "#e11d48", bgAccent: "bg-rose-50",
        metrics: [
            { label: "Tableros atendidos", value: "5", icon: Zap },
            { label: "Mantenimientos realizados", value: "12", icon: CheckCircle2 },
            { label: "Observaciones registradas", value: "8", icon: FileText },
            { label: "Servicio", value: "Completado", icon: Award },
        ],
    },
    {
        id: "volvo", company: "Volvo Perú", logo: volvoLogo, sector: "Transporte", sectorIcon: Truck, image: volvoImage,
        sectorColor: "text-blue-700", tagline: "Evaluación técnica de tableros eléctricos en instalaciones de servicio",
        challenge: "Se requería conocer el estado de los tableros eléctricos que alimentan las áreas operativas y talleres.",
        solution: "Se realizó una inspección completa de los tableros eléctricos, verificando componentes, protecciones y condiciones generales de operación.",
        year: "2026", accentColor: "#1d4ed8", bgAccent: "bg-blue-50",
        metrics: [
            { label: "Tableros inspeccionados", value: "171", icon: Zap },
            { label: "Observaciones registradas", value: "13", icon: FileText },
            { label: "Informe técnico", value: "1", icon: CheckCircle2 },
            { label: "Servicio", value: "Completado", icon: Award },
        ],
    },
];

interface ComplianceCard {
    id: string;
    icon: LucideIcon;
    title: string;
    badgeColor: string;
    accentGradient: string;
    borderColor: string;
    hoverTextColor: string;
    checkColor: string;
    delay: string;
    items: string[];
}

const cumplimiento: ComplianceCard[] = [
    {
        id: "itse-cne",
        icon: ShieldCheck,
        title: "Cumplimiento ITSE & CNE",
        badgeColor: "bg-[#0797d5]/10 text-[#0797d5]",
        accentGradient: "from-[#0797d5] to-[#0797d5]/20",
        borderColor: "hover:border-[#0797d5]/40",
        hoverTextColor: "group-hover:text-[#0797d5]",
        checkColor: "text-[#0797d5]",
        delay: "0.1s",
        items: [
            "Levantamiento de observaciones en campo",
            "Diagramas unifilares CAD y leyendas CNE",
            "Firma de Ingeniero Colegiado (CIP) + QR",
            "Expediente digital listo para Defensa Civil"
        ]
    },
    {
        id: "nfpa-spat",
        icon: Zap,
        title: "Seguridad NFPA 70E / 70B",
        badgeColor: "bg-[#8ccf2f]/15 text-[#6da81f]",
        accentGradient: "from-[#8ccf2f] to-[#8ccf2f]/20",
        borderColor: "hover:border-[#8ccf2f]/50",
        hoverTextColor: "group-hover:text-[#6da81f]",
        checkColor: "text-[#8ccf2f]",
        delay: "0.2s",
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
        delay: "0.3s",
        items: [
            "Perfil de consumo y demanda máxima (HP/HFP)",
            "Control de potencia reactiva (Cero penalizaciones)",
            "Estudio de Calidad de Energía (Power Quality)",
            "Cálculo de Huella de Carbono (tCO₂eq)"
        ]
    }
];

const faqs: FAQItem[] = [
    { q: "¿Cómo ayuda Voltguard a aprobar las Inspecciones ITSE de Defensa Civil?", a: "Voltguard organiza y mantiene actualizados los diagramas unifilares en CAD, certificados de operatividad firmados por un Ingeniero Colegiado (CIP) y la rotulación normativa CNE para que tu establecimiento supere cualquier auditoría de ITSE sin riesgo de clausura." },
    { q: "¿Qué tipo de documentación técnica puedo centralizar en cada tablero?", a: "Voltguard almacena certificados de operatividad, diagramas unifilares (PDF/DWG), leyendas de circuitos CNE, protocolos de puesta a tierra y reportes de mantenimiento preventivo o termografía infrarroja." },
    { q: "¿Puedo cambiar de plan si mi negocio amplía la cantidad de tableros?", a: "Sí. Puedes empezar con el Plan Básico para 1 tablero y escalar al Plan Intermedio (hasta 4 tableros) o Plan Empresarial (más de 5 tableros) a medida que tus instalaciones crezcan o requieras mayor exigencia técnica." },
    { q: "¿Los certificados expedidos cuentan con firma de Ingeniero Colegiado?", a: "A partir del Plan Intermedio y Empresarial, la gestión documental incluye la validación y firma de un Ingeniero Colegiado y Habilitado (CIP) especialista en instalaciones eléctricas." },
    { q: "¿Quién realiza el trabajo técnico en campo y sube los documentos?", a: "El equipo especializado de Voltguard realiza la inspección presencial, pruebas de pozo a tierra y medición termográfica. Posteriormente, todos los planos, reportes y certificados quedan disponibles en tu panel de usuario para descarga inmediata." }
];

/* ─── Styles & Animations ────────────────────────────────────────────────── */

const STYLE = `
@keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
@keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes tickerScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes gridFade { 0%,100%{opacity:0.03} 50%{opacity:0.07} }
@keyframes particleDrift { 0%{transform:translateY(0) translateX(0) scale(1);opacity:0.7} 100%{transform:translateY(-120px) translateX(20px) scale(0);opacity:0} }
@keyframes blobMove { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
@keyframes countBounce { 0%{transform:scale(1)} 50%{transform:scale(1.08)} 100%{transform:scale(1)} }
@keyframes zap { 0%,100%{opacity:1} 25%{opacity:0.2} 75%{opacity:0.7} }
@keyframes kenBurns { 0%{transform:scale(1) translate(0,0)} 50%{transform:scale(1.06) translate(-1%,-1%)} 100%{transform:scale(1) translate(0,0)} }
@keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }

.optimize-animated-img { will-change: transform; }
`;

function InjectStyles() {
    useEffect(() => {
        const id = "voltguard-unified-styles";
        if (document.getElementById(id)) return;
        const el = document.createElement("style");
        el.id = id; el.textContent = STYLE;
        document.head.appendChild(el);
        return () => { document.getElementById(id)?.remove(); };
    }, []);
    return null;
}

/* ─── Hooks ──────────────────────────────────────────────────────────────── */

function useInViewRepeatable(threshold = 0.12) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold });
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, inView };
}

function useCountUp(target: number, suffix: string, active: boolean, duration = 1400) {
    const [display, setDisplay] = useState(`0${suffix}`);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!active) { setDisplay(`0${suffix}`); return; }
        let start = 0; const inc = target / (duration / 16);
        timerRef.current = setInterval(() => {
            start = Math.min(start + inc, target);
            setDisplay(`${Math.round(start)}${suffix}`);
            if (start >= target && timerRef.current) clearInterval(timerRef.current);
        }, 16);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [active, target, suffix, duration]);
    return display;
}

/* ─── Elementos Decorativos ──────────────────────────────────────────────── */

function BackgroundGrid() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ animation: "gridFade 4s ease-in-out infinite" }}>
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0797d5" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>
    );
}

function FloatingParticles({ count = 8 }: { count?: number }) {
    const particles = Array.from({ length: count }, (_, i) => ({
        id: i, x: 10 + (i * 12) % 85, y: 20 + (i * 17) % 70,
        delay: i * 0.7, duration: 3 + (i % 3), size: 2 + (i % 3),
    }));
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map(p => (
                <div key={p.id} className="absolute rounded-full bg-[#0797d5]"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: 0.5, animation: `particleDrift ${p.duration}s ease-in ${p.delay}s infinite` }} />
            ))}
        </div>
    );
}

function ScrollProgress() {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        const h = () => { const t = document.documentElement.scrollHeight - window.innerHeight; setProgress(t > 0 ? (window.scrollY / t) * 100 : 0); };
        window.addEventListener("scroll", h, { passive: true });
        return () => window.removeEventListener("scroll", h);
    }, []);
    return <div className="fixed top-0 left-0 right-0 z-50 h-0.5"><div className="h-full bg-gradient-to-r from-[#0797d5] via-[#05c4f7] to-[#8ccf2f]" style={{ width: `${progress}%`, transition: "width 0.1s linear" }} /></div>;
}

function AnimatedStat({ target, suffix, label, active, duration }: Stat & { active: boolean; duration?: number }) {
    const display = useCountUp(target, suffix, active, duration);
    return (
        <div>
            <span className="block text-2xl font-black text-slate-950 tracking-tight tabular-nums" style={active ? { animation: "countBounce 0.4s ease" } : {}}>{display}</span>
            <span className="text-xs text-slate-500 mt-0.5 block">{label}</span>
        </div>
    );
}

function BannerStat({ target, suffix, label, active, duration }: Stat & { active: boolean; duration?: number }) {
    const display = useCountUp(target, suffix, active, duration);
    return (
        <div className="text-center group">
            <span className="block text-4xl font-black text-white tracking-tight tabular-nums group-hover:scale-110 transition-transform duration-300">{display}</span>
            <span className="text-sm text-white/75 mt-1 block">{label}</span>
        </div>
    );
}

/* ─── Sub-componentes ────────────────────────────────────────────────────── */

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
    const { ref, inView } = useInViewRepeatable(0.1);
    const Icon = feature.icon;
    const [hovered, setHovered] = useState(false);
    return (
        <div ref={ref} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
            className="group bg-white border border-slate-200 rounded-3xl p-6 cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#0797d5]/15 hover:border-[#0797d5]/40 relative overflow-hidden"
            style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.55s ease ${index * 90}ms, transform 0.55s ease ${index * 90}ms, box-shadow 0.3s, border-color 0.3s` }}>
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#0797d5]/5 to-transparent" style={hovered ? { animation: "shimmer 0.7s ease forwards" } : {}} />
            </div>
            <div className="absolute -top-8 -right-8 size-24 rounded-full bg-[#0797d5]/0 group-hover:bg-[#0797d5]/8 transition-all duration-500 blur-xl pointer-events-none" />
            <div className="size-13 rounded-2xl bg-[#0797d5]/8 text-[#0797d5] flex items-center justify-center mb-5 group-hover:bg-[#0797d5] group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 relative z-10">
                <Icon size={26} />
            </div>
            <h3 className="text-base font-bold text-slate-950 mb-2 relative z-10 group-hover:text-[#0797d5] transition-colors duration-300">{feature.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed relative z-10">{feature.description}</p>
            <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] group-hover:w-full transition-all duration-500 rounded-b-3xl" />
        </div>
    );
}

function PlanCard({ plan, index, active }: { plan: Plan; index: number; active: boolean }) {
    const navigate = useNavigate();
    const isFeatured = plan.featured;

    return (
        <div
            style={{
                opacity: active ? 1 : 0,
                transform: active ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)",
                transition: `opacity 0.6s ease ${index * 150}ms, transform 0.6s ease ${index * 150}ms`
            }}
            className={`relative rounded-3xl flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-2 bg-white
                ${!isFeatured
                    ? "border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#0797d5]/40"
                    : "border-2 border-[#0797d5] shadow-xl shadow-[#0797d5]/15 hover:shadow-2xl hover:shadow-[#0797d5]/25"
                }`}
        >
            {plan.badge && (
                <div className="absolute top-0 right-0 overflow-hidden w-28 h-28 pointer-events-none z-20">
                    <div className="absolute top-5 right-[-24px] rotate-45 bg-[#8ccf2f] text-slate-950 text-[9px] font-black px-8 py-1 shadow-md tracking-wider uppercase text-center">
                        {plan.badge}
                    </div>
                </div>
            )}

            <div>
                <div className={`p-6 sm:p-7 border-b border-slate-100 ${!isFeatured ? "bg-slate-50/60" : "bg-gradient-to-br from-[#0797d5]/10 via-[#0797d5]/5 to-transparent"}`}>
                    <span className={`inline-block text-[11px] font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider ${plan.sectorColor}`}>
                        {plan.sectorTag}
                    </span>

                    <h3 className="text-2xl font-black text-slate-950 tracking-tight">
                        {plan.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {plan.subLabel}
                    </p>

                    <div className="mt-5">
                        <span className={`text-3xl sm:text-4xl font-black tracking-tight leading-none ${!isFeatured ? "text-slate-900" : "text-[#0797d5]"}`}>
                            {plan.priceLabel}
                        </span>
                        {plan.id === "pyme" && (
                            <span className="block text-[11px] font-semibold text-slate-400 mt-1">
                                * Tarifa por tablero registrado
                            </span>
                        )}
                    </div>

                    <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                        {plan.description}
                    </p>
                </div>

                <div className="p-6 sm:p-7">
                    <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-3">
                        Incluye entregables:
                    </p>
                    <ul className="space-y-2.5">
                        {plan.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                                <span className={`mt-0.5 shrink-0 size-4 rounded-full flex items-center justify-center ${!isFeatured ? "bg-slate-100 text-slate-700" : "bg-[#0797d5]/15 text-[#0797d5]"}`}>
                                    <Check size={11} strokeWidth={3} />
                                </span>
                                <span>{f}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="p-6 sm:p-7 pt-0">
                <button
                    onClick={() => navigate(plan.path)}
                    className={`w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${!isFeatured
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold"
                            : "bg-[#0797d5] hover:bg-[#0684bd] text-white font-extrabold shadow-lg shadow-[#0797d5]/25"
                        }`}
                >
                    {plan.cta}
                </button>
            </div>
        </div>
    );
}

function StoryCardMinimal({ story }: { story: Story & { image?: string } }) {
    const SectorIcon = story.sectorIcon;
    const mainMetric = story.metrics[0];

    return (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 h-auto lg:h-[460px]">
            <div className="grid lg:grid-cols-2 h-full">

                <div className="p-8 lg:p-10 flex flex-col justify-between h-full">
                    <div>
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <span
                                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${story.sectorColor}`}
                                style={{ borderColor: `${story.accentColor}30`, backgroundColor: `${story.accentColor}08` }}
                            >
                                <SectorIcon size={12} />
                                {story.sector} • {story.year}
                            </span>
                            <img src={story.logo} alt={story.company} className="h-10 w-auto object-contain" />
                        </div>

                        <h3 className="text-2xl font-black text-slate-950 tracking-tight">
                            {story.company}
                        </h3>

                        <p className="mt-2 text-sm text-slate-600 font-medium leading-relaxed line-clamp-2">
                            {story.tagline}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                        {story.metrics.slice(0, 3).map((m, i) => (
                            <div key={i} className="flex items-baseline gap-1.5">
                                <span className="text-base font-black text-slate-900">{m.value}</span>
                                <span className="text-[11px] text-slate-400 font-medium">{m.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative min-h-[260px] lg:min-h-full overflow-hidden bg-slate-100">
                    <img
                        src={story.image || "/hero-technician2.webp"}
                        alt={`Inspección en ${story.company}`}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                </div>

            </div>
        </div>
    );
}

function StoriesCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [displayIndex, setDisplayIndex] = useState(0);

    const changeStory = useCallback((newIndex: number) => {
        if (isAnimating || newIndex === displayIndex) return;
        setIsAnimating(true);

        setTimeout(() => {
            setDisplayIndex(newIndex);
            setCurrentIndex(newIndex);
            setTimeout(() => {
                setIsAnimating(false);
            }, 50);
        }, 300);
    }, [isAnimating, displayIndex]);

    const prevStory = () => {
        const target = displayIndex === 0 ? stories.length - 1 : displayIndex - 1;
        changeStory(target);
    };

    const nextStory = useCallback(() => {
        const target = displayIndex === stories.length - 1 ? 0 : displayIndex + 1;
        changeStory(target);
    }, [displayIndex, changeStory]);

    useEffect(() => {
        const timer = setInterval(() => {
            nextStory();
        }, 7000);
        return () => clearInterval(timer);
    }, [nextStory]);

    return (
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0797d5]/20 bg-[#0797d5]/5 text-xs font-semibold text-[#0797d5] mb-2">
                        <Award size={13} /> Casos de éxito
                    </div>
                    <h2 className="text-3xl font-black text-slate-950 tracking-tight">Empresas que confían en Voltguard</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={prevStory}
                        disabled={isAnimating}
                        className="size-11 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:border-[#0797d5] hover:text-[#0797d5] hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <button
                        onClick={nextStory}
                        disabled={isAnimating}
                        className="size-11 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:border-[#0797d5] hover:text-[#0797d5] hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            <div className="overflow-hidden relative min-h-[420px]">
                <div
                    className="transition-all duration-500 ease-out will-change-transform"
                    style={{
                        opacity: isAnimating ? 0 : 1,
                        transform: isAnimating ? "translateY(12px) scale(0.99)" : "translateY(0) scale(1)",
                        filter: isAnimating ? "blur(4px)" : "blur(0px)",
                    }}
                >
                    <StoryCardMinimal story={stories[displayIndex]} />
                </div>
            </div>

            <div className="flex justify-center items-center gap-2 mt-6">
                {stories.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => changeStory(idx)}
                        className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${currentIndex === idx ? "w-8 bg-[#0797d5]" : "w-2.5 bg-slate-200 hover:bg-slate-300"}`}
                    />
                ))}
            </div>
        </div>
    );
}

function FAQRow({ q, a, index }: FAQItem & { index: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const { ref, inView } = useInViewRepeatable(0.1);
    return (
        <div ref={ref} className="border border-slate-200 bg-white rounded-2xl overflow-hidden hover:border-[#0797d5]/40 hover:shadow-md transition-all duration-300"
            style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.6s ease ${index * 80}ms, transform 0.6s ease ${index * 80}ms` }}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-950 hover:text-[#0797d5] transition-colors cursor-pointer group">
                <span className="text-sm sm:text-base pr-4">{q}</span>
                <div className={`shrink-0 size-7 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? "bg-[#0797d5] text-white rotate-180" : "bg-slate-100 text-slate-400 group-hover:bg-[#0797d5]/10 group-hover:text-[#0797d5]"}`}>
                    <ChevronDown size={15} />
                </div>
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-48 border-t border-slate-100" : "max-h-0"}`}>
                <p className="p-5 text-sm text-slate-500 leading-relaxed bg-slate-50/50">{a}</p>
            </div>
        </div>
    );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function HomePage() {
    const navigate = useNavigate();

    const { ref: heroCardRef, inView: heroCardVisible } = useInViewRepeatable(0.2);
    const { ref: heroStatsRef, inView: heroStatsVisible } = useInViewRepeatable(0.3);
    const { ref: ctaRef, inView: ctaVisible } = useInViewRepeatable(0.15);
    const { ref: featHeadRef, inView: featHeadVisible } = useInViewRepeatable(0.15);
    const { ref: pricingRef, inView: pricingVisible } = useInViewRepeatable(0.1);
    const { ref: pricingHeadRef, inView: pricingHeadVisible } = useInViewRepeatable(0.15);
    const { ref: homeFaqHeadRef, inView: homeFaqHeadVisible } = useInViewRepeatable(0.15);
    const { ref: normHeadRef, inView: normHeadVisible } = useInViewRepeatable(0.15);
    const { ref: testimonialRef, inView: testimonialVisible } = useInViewRepeatable(0.15);

    return (
        <div className="bg-slate-50 min-h-screen overflow-x-hidden">
            <InjectStyles />
            <ScrollProgress />

            {/* ── HERO ─────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden pt-10">
                <BackgroundGrid />
                <FloatingParticles count={10} />
                <div className="absolute -top-32 -left-32 size-96 rounded-full bg-[#0797d5]/12 blur-3xl pointer-events-none" style={{ animation: "blobMove 8s ease-in-out infinite" }} />
                <div className="absolute top-10 -right-32 size-80 rounded-full bg-[#8ccf2f]/10 blur-3xl pointer-events-none" style={{ animation: "blobMove 10s ease-in-out 2s infinite reverse" }} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center relative z-10">

                    <div style={{ animation: "fadeUp 0.6s ease both" }} className="flex flex-col items-start">
                        <h1
                            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.08]"
                            style={{ animation: "fadeUp 0.6s ease 0.15s both" }}
                        >
                            Gestiona tus activos eléctricos y garantiza tu certificación{" "}
                            <span
                                className="bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] bg-clip-text text-transparent inline-block"
                                style={{ backgroundSize: "200% 200%", animation: "gradShift 4s ease infinite" }}
                            >
                                ITSE
                            </span>
                        </h1>

                        <p
                            className="mt-6 text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-xl"
                            style={{ animation: "fadeUp 0.6s ease 0.25s both" }}
                        >
                            Seguridad NFPA 70E / 70B
                            · Diagnóstico predictivo de equipos eléctricos
                            · Analítica Energética, Power Quality y Huella de Carbono
                            · Todo en un único vault documental
                        </p>

                        <div
                            ref={heroStatsRef}
                            className="mt-10 pt-8 border-t border-slate-200/60 grid grid-cols-3 gap-3 sm:gap-4 w-full"
                            style={{ animation: "fadeUp 0.6s ease 0.35s both" }}
                        >
                            {heroStats.map((s, i) => (
                                <div
                                    key={s.id}
                                    className="relative group p-3.5 sm:p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#0797d5]/40 transition-all duration-300 flex flex-col justify-center"
                                >
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#0797d5]/5 to-[#8ccf2f]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-950 group-hover:text-[#0797d5] transition-colors duration-300">
                                        <AnimatedStat {...s} active={heroStatsVisible} duration={900 + i * 200} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        ref={heroCardRef}
                        className="relative"
                        style={{
                            opacity: heroCardVisible ? 1 : 0,
                            transform: heroCardVisible ? "translateX(0)" : "translateX(40px)",
                            transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s"
                        }}
                    >
                        <div className="absolute -inset-2 bg-gradient-to-tr from-[#0797d5]/20 to-[#8ccf2f]/20 rounded-[2.5rem] blur-xl opacity-60 pointer-events-none" />

                        <div className="relative bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/60 hover:shadow-2xl hover:shadow-[#0797d5]/15 transition-all duration-500 group">
                            <img
                                src="/hero-technician3.webp"
                                alt="Ingeniero realizando inspección eléctrica ITSE"
                                className="rounded-3xl object-cover h-[480px] lg:h-[520px] w-full transform group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                            />
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />
                        </div>
                    </div>

                </div>
            </section>

            {/* ── STRIP FOTOS: METODOLOGÍA DE INSPECCIÓN VOLTGUARD ───────────── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0797d5]/10 text-[#0797d5] font-semibold text-xs tracking-widest uppercase mb-3 border border-[#0797d5]/20">
                        Metodología de Inspección en Campo
                    </span>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
                        De la medición en campo al expediente firmado en la nube
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {[
                        {
                            step: "01",
                            badge: "Medición e Instrumental",
                            badgeColor: "bg-[#0797d5] text-white",
                            accentColor: "#0797d5",
                            src: "/specialized_engineers_home.webp",
                            title: "Inspección ITSE Presencial",
                            sub: "Levantamiento de observaciones en campo, revisión técnica de tableros y pruebas de resistencia SPAT con instrumentos calibrados."
                        },
                        {
                            step: "02",
                            badge: "Norma NFPA 70B / 70E",
                            badgeColor: "bg-[#8ccf2f] text-slate-950 font-bold",
                            accentColor: "#8ccf2f",
                            src: "/thermography_home.webp",
                            title: "Análisis Termográfico Predictivo",
                            sub: "Detección temprana de puntos calientes, desbalance de fases y cálculo de energía incidente con cámara infrarroja de precisión."
                        },
                        {
                            step: "03",
                            badge: "Firma CIP & QR Validable",
                            badgeColor: "bg-slate-800 text-white border border-white/20",
                            accentColor: "#0797d5",
                            src: "/certification_nfpa_home.jpeg",
                            title: "Certificación & Expediente",
                            sub: "Emisión de reportes en 24 horas, diagramas unifilares y dictamen firmado por Ingeniero Colegiado para Defensa Civil."
                        },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-[#0797d5]/20 hover:border-[#0797d5]/50 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
                            style={{
                                opacity: 0,
                                animation: `fadeUp 0.6s ease ${0.15 + i * 0.15}s forwards`
                            }}
                        >
                            <div
                                className="h-1.5 w-full shrink-0 z-10"
                                style={{ backgroundColor: item.accentColor }}
                            />

                            <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-950 shrink-0">
                                <img
                                    src={item.src}
                                    alt={item.title}
                                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-100"
                                />

                                <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
                                    <span className="text-2xl font-black text-white drop-shadow-md bg-slate-950/50 px-2.5 py-0.5 rounded-xl backdrop-blur-md">
                                        {item.step}
                                    </span>
                                    <span className={`text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-md pointer-events-auto ${item.badgeColor}`}>
                                        {item.badge}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 bg-slate-900">
                                <div>
                                    <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug group-hover:text-[#0797d5] transition-colors">
                                        {item.title}
                                    </h3>

                                    <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                                        {item.sub}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CUMPLIMIENTO NORMATIVO ──────────────────────────────────── */}
            <section id="standards" className="relative overflow-hidden py-24">
                <div className="absolute inset-0 pointer-events-none">
                    <img
                        src="/standards-bg.jpg"
                        alt=""
                        className="w-full h-full object-cover object-center opacity-30"
                        style={{ animation: "kenBurns 18s ease-in-out infinite" }}
                    />
                    <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-3xl" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div
                        ref={normHeadRef}
                        style={{
                            opacity: normHeadVisible ? 1 : 0,
                            transform: normHeadVisible ? "translateY(0)" : "translateY(24px)",
                            transition: "opacity 0.65s ease, transform 0.65s ease"
                        }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
                            Cruce Normativo Integral: ITSE, CNE y NFPA
                        </h2>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {cumplimiento.map((card) => {
                            const IconComponent = card.icon;
                            return (
                                <div
                                    key={card.id}
                                    className={`group bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 ${card.borderColor} transition-all duration-300 relative flex flex-col justify-between`}
                                    style={{
                                        opacity: normHeadVisible ? 1 : 0,
                                        transform: normHeadVisible ? "translateY(0)" : "translateY(20px)",
                                        transition: `all 0.6s ease ${card.delay}`
                                    }}
                                >
                                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.accentGradient} rounded-t-3xl`} />

                                    <div>
                                        <div className={`w-12 h-12 rounded-2xl ${card.badgeColor} flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                            <IconComponent size={26} />
                                        </div>

                                        <h3 className={`text-xl font-extrabold text-slate-950 mt-1 mb-3 ${card.hoverTextColor} transition-colors`}>
                                            {card.title}
                                        </h3>

                                        <ul className="space-y-2.5 text-sm text-slate-600 mt-4">
                                            {card.items.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className={`${card.checkColor} font-bold mt-0.5`}>✓</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── MÓDULOS DEL SISTEMA VOLTGUARD (Lámina 5 del PDF) ───────────────── */}
            <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
                {/* Resplandor ambiental de fondo */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] rounded-full bg-[#0797d5]/5 blur-3xl pointer-events-none" />

                {/* Encabezado */}
                <div
                    ref={featHeadRef}
                    style={{
                        opacity: featHeadVisible ? 1 : 0,
                        transform: featHeadVisible ? "translateY(0)" : "translateY(24px)",
                        transition: "opacity 0.65s ease, transform 0.65s ease"
                    }}
                    className="text-center mb-16 relative z-10"
                >
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0797d5]/10 text-[#0797d5] font-semibold text-xs tracking-widest uppercase mb-3 border border-[#0797d5]/20">
                        ARQUITECTURA DEL SISTEMA
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
                        Cuatro Módulos, Un Mismo Expediente Digital
                    </h2>
                </div>

                {/* Rejilla de Módulos */}
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 relative z-10">
                    {features.map((f, i) => (
                        <FeatureCard key={f.title} feature={f} index={i} />
                    ))}
                </div>
            </section>

            {/* ── EQUIPO Y CAMPO ───────────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/80">
                    <div className="relative min-h-[380px]">
                        <img src="/inspection_home.webp" alt="Ingenieros levantando observaciones ITSE en campo" decoding="async" loading="lazy" className="absolute inset-0 w-full h-full object-cover optimize-animated-img" style={{ animation: "kenBurns 15s ease-in-out infinite" }} />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/60" />
                        <div className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3" style={{ animation: "float 5s ease-in-out infinite" }}>
                            <p className="text-white/70 text-xs font-semibold">Certificados ITSE Emitidos</p>
                            <p className="text-white text-2xl font-black mt-0.5">+450 <span className="text-[#8ccf2f] text-sm">aprobados</span></p>
                        </div>
                    </div>
                    <div className="bg-slate-900 p-10 lg:p-14 flex flex-col justify-center relative overflow-hidden">
                        <BackgroundGrid />
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#8ccf2f]/15 border border-[#8ccf2f]/30 text-[#8ccf2f] text-xs font-bold mb-6">
                                <Cpu size={12} style={{ animation: "zap 1.2s ease-in-out infinite" }} />
                                Especialistas en Seguridad ITSE
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                                Firma de Ingenieros Colegiados (CIP) garantizada
                            </h2>
                            <p className="mt-4 text-white/60 text-sm leading-7">
                                Nuestro equipo se encarga de la inspección, diagramación unifilar y verificación en campo requerida por Defensa Civil y municipalidades.
                            </p>
                            <ul className="mt-6 space-y-3">
                                {["Levantamiento de observaciones de auditorías ITSE", "Planos unifilares en CAD y leyendas CNE", "Pruebas de Pozo a Tierra y Aislamiento"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                                        <span className="size-5 rounded-full bg-[#0797d5]/20 border border-[#0797d5]/40 flex items-center justify-center shrink-0">
                                            <Check size={10} className="text-[#0797d5]" strokeWidth={3} />
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PLANES Y LICENCIAS VOLTGUARD ────────────────────────────────── */}
            <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 size-96 rounded-full bg-[#0797d5]/5 blur-3xl pointer-events-none" style={{ animation: "blobMove 10s ease-in-out infinite" }} />

                <div ref={pricingHeadRef} style={{ opacity: pricingHeadVisible ? 1 : 0, transform: pricingHeadVisible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.65s ease, transform 0.65s ease" }} className="text-center mb-14 relative z-10">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0797d5]/10 text-[#0797d5] font-semibold text-xs tracking-widest uppercase mb-3 border border-[#0797d5]/20">
                        Licenciamiento VoltGuard
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                        Elige el plan adecuado según tus tableros y requisitos ITSE
                    </h2>
                </div>

                <div ref={pricingRef} className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto relative z-10">
                    {plans.map((plan, i) => (
                        <PlanCard key={plan.id} plan={plan} index={i} active={pricingVisible} />
                    ))}
                </div>

                <div className="mt-10 text-center space-y-1 relative z-10">
                    <p className="text-xs font-semibold text-slate-500">
                        * La tarifa del Plan Intermedio aplica por tablero eléctrico registrado.
                    </p>
                    <p className="text-xs text-slate-400">
                        La emisión de certificados con firma CIP y archivos CAD (.DWG) está condicionada a los planes Intermedio y Empresarial.
                    </p>
                </div>
            </section>

            {/* ── CASOS DE ÉXITO (CARRUSEL INTERACTIVO) ────────────────────── */}
            <StoriesCarousel />

            {/* ── TESTIMONIAL DESTACADO ───────────────────────────────────── */}
            <section ref={testimonialRef} className="relative overflow-hidden py-28">
                <img src="/section_caso_uso_home2.webp" alt="" className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none" style={{ animation: "kenBurns 22s ease-in-out infinite" }} />
                <div className="absolute inset-0 bg-slate-950/75" />
                <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center" style={{ opacity: testimonialVisible ? 1 : 0, transform: testimonialVisible ? "translateY(0)" : "translateY(32px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0797d5]/20 border border-[#0797d5]/40 text-[#05c4f7] text-xs font-bold mb-8">
                        <Activity size={12} style={{ animation: "zap 1.5s ease-in-out infinite" }} />
                        Caso de éxito ITSE
                    </div>
                    <blockquote className="text-2xl sm:text-3xl font-black text-white leading-snug">
                        "Antes tardábamos días en ubicar los certificados de un tablero. Con Voltguard lo hacemos en segundos desde el celular."
                    </blockquote>
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <img src="/avatar-engineer.png" alt="Administrador de Local Comercial" className="size-12 rounded-full object-cover border-2 border-[#0797d5] shadow-lg shadow-[#0797d5]/40" />
                        <div className="text-left">
                            <p className="text-white font-bold text-m">César Inga Zapata</p>
                            <p className="text-gray-400 font-bold text-xs">Gerente de Operaciones VoltGuard</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PREGUNTAS FRECUENTES (FAQS) ─────────────────────────────── */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div ref={homeFaqHeadRef} className="text-center mb-10" style={{ opacity: homeFaqHeadVisible ? 1 : 0, transform: homeFaqHeadVisible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.65s ease, transform 0.65s ease" }}>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0797d5]/8 border border-[#0797d5]/20 text-[#0797d5] text-xs font-bold mb-4">
                        <HelpCircle size={13} style={{ animation: "zap 2s ease-in-out infinite" }} />
                        Preguntas Frecuentes
                    </div>
                    <h2 className="text-3xl font-black text-slate-950 tracking-tight">Preguntas Frecuentes sobre la Norma ITSE</h2>
                    <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto leading-relaxed">Aclara tus dudas sobre cómo Voltguard te ayuda a cumplir con las inspecciones y licenciamiento de Defensa Civil.</p>
                </div>
                <div className="space-y-3">
                    {faqs.map((faq, i) => <FAQRow key={i} {...faq} index={i} />)}
                </div>
            </section>

            {/* ── CTA FINAL ────────────────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div ref={ctaRef} style={{ opacity: ctaVisible ? 1 : 0, transform: ctaVisible ? "translateY(0)" : "translateY(32px)", transition: "opacity 0.7s ease, transform 0.7s ease" }} className="relative rounded-3xl overflow-hidden">
                    <img src="/cta-staff-bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none" style={{ animation: "kenBurns 18s ease-in-out infinite" }} />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/96 via-slate-900/90 to-slate-800/80" />
                    <BackgroundGrid />
                    <FloatingParticles count={6} />
                    <div className="relative z-10 p-10 lg:p-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#8ccf2f]/15 border border-[#8ccf2f]/30 text-[#8ccf2f] text-xs font-bold mb-5">
                                <CheckCircle2 size={13} />Cumplimiento Garantizado
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                                Protege tu negocio y aprueba tu<br />
                                <span className="bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] bg-clip-text text-transparent" style={{ backgroundSize: "200% 200%", animation: "gradShift 4s ease infinite" }}>Inspección ITSE sin contratiempos</span>
                            </h2>
                            <p className="mt-4 text-white/60 text-sm leading-7 max-w-lg">Suscríbete a un Plan Voltguard para gestionar tus tableros, certificados y diagramas unifilares con asesoría experta.</p>
                        </div>
                        <button onClick={() => navigate("/auth")} className="group shrink-0 inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-white to-slate-50 hover:from-slate-50 hover:to-white text-slate-900 font-extrabold text-sm rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-black/40 relative overflow-hidden">
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0797d5]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-600 pointer-events-none" />
                            Suscribirme a Voltguard <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}