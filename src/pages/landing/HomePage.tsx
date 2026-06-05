import { useEffect, useRef, useState, useCallback } from "react";
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    FileText,
    ShieldCheck,
    Zap,
    Activity,
    Thermometer,
    Plug,
    Check,
    Star,
    ChevronDown,
    HelpCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface Feature {
    title: string;
    description: string;
    icon: React.ElementType;
}

interface Stat {
    id: string;
    target: number;
    suffix: string;
    label: string;
}

type PlanBilling = "monthly" | "yearly";

interface Plan {
    name: string;
    badge?: string;
    monthlyPrice: number;
    yearlyPrice: number;
    description: string;
    color: string;
    featured: boolean;
    features: string[];
    cta: string;
    limits: {
        empresas: number | string;
        tableros: number | string;
        usuarios: number | string;
        docs: number | string;
    };
}

/* ─── Data ───────────────────────────────────────────────────────────────── */

const features: Feature[] = [
    {
        title: "Gestión de empresas",
        description: "Administra empresas y separa sus tableros eléctricos con claridad y orden.",
        icon: Building2,
    },
    {
        title: "Control de tableros",
        description: "Centraliza información técnica, diagramas y estado operativo en tiempo real.",
        icon: Zap,
    },
    {
        title: "Documentación técnica",
        description: "Sube certificados, termografías y diagramas unifilares de forma ordenada.",
        icon: FileText,
    },
    {
        title: "Usuarios y permisos",
        description: "Gestiona administradores, superadmins y accesos seguros por rol.",
        icon: ShieldCheck,
    },
];

const heroStats: Stat[] = [
    { id: "h1", target: 120, suffix: "+", label: "Tableros activos" },
    { id: "h2", target: 99, suffix: "%", label: "Uptime" },
    { id: "h3", target: 48, suffix: "h", label: "Soporte" },
];

const bannerStats: Stat[] = [
    { id: "b1", target: 85, suffix: "", label: "Empresas gestionadas" },
    { id: "b2", target: 340, suffix: "", label: "Tableros monitoreados" },
    { id: "b3", target: 1200, suffix: "+", label: "Documentos cargados" },
    { id: "b4", target: 99, suffix: "%", label: "Disponibilidad garantizada" },
];

const plans: Plan[] = [
    {
        name: "Free",
        monthlyPrice: 0,
        yearlyPrice: 0,
        description: "Mapeo piloto inicial para explorar el ecosistema digital de Voltguard.",
        color: "slate",
        featured: false,
        cta: "Comenzar gratis",
        features: [
            "1 Tablero Eléctrico",
            "Exclusivo para Tablero General (TG)",
            "Seguimiento de parámetros en tiempo real",
            "Visor digital en plataforma web",
            "Soporte técnico por email"
        ],
        limits: { empresas: 1, tableros: 1, usuarios: 2, docs: 5 }
    },
    {
        name: "Básico",
        badge: "Más popular",
        monthlyPrice: 49,
        yearlyPrice: 39,
        description: "Optimizado para colegios, clínicas y pymes que requieren ingeniería esencial.",
        color: "blue",
        featured: true,
        cta: "Adquirir Plan",
        features: [
            "Hasta 50 Tableros Eléctricos",
            "Levantamiento fotográfico detallado",
            "Diseño de diagramas unifilares",
            "Rotulación de circuitos y leyendas",
            "Estudio de seguridad NFPA 70E",
            "Visualización y descarga de Etiquetas (PDF)"
        ],
        limits: { empresas: 1, tableros: 50, usuarios: 10, docs: "∞" }
    },
    {
        name: "Pro",
        monthlyPrice: 149,
        yearlyPrice: 119,
        description: "Diseñado para complejos industriales masivos y auditorías de alta exigencia.",
        color: "green",
        featured: false,
        cta: "Contactar ventas",
        features: [
            "Hasta 200 Tableros Eléctricos",
            "Despliegue e inspección presencial",
            "Pruebas de aislamiento (Megado)",
            "Análisis por termografía infrarroja",
            "Cuadro de cargas y demanda máxima",
            "Emisión de certificados de operatividad y mantenimiento",
            "Programa predictivo bajo norma NFPA 70B",
            "Entrega completa de archivos PDF y CAD (.DWG)"
        ],
        limits: { empresas: "Multi-sede", tableros: 200, usuarios: "∞", docs: "∞" }
    }
];

/* ─── Hooks ──────────────────────────────────────────────────────────────── */

// Repeatable: triggers every time element enters/leaves view
function useInViewRepeatable(threshold = 0.15) {
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

function useCountUp(target: number, suffix: string, active: boolean, duration = 1400) {
    const [display, setDisplay] = useState(`0${suffix}`);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!active) {
            setDisplay(`0${suffix}`);
            return;
        }
        let start = 0;
        const inc = target / (duration / 16);
        timerRef.current = setInterval(() => {
            start = Math.min(start + inc, target);
            setDisplay(`${Math.round(start)}${suffix}`);
            if (start >= target && timerRef.current) clearInterval(timerRef.current);
        }, 16);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [active, target, suffix, duration]);

    return display;
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function AnimatedStat({ target, suffix, label, active, duration }: Stat & { active: boolean; duration?: number }) {
    const display = useCountUp(target, suffix, active, duration);
    return (
        <div>
            <span className="block text-2xl font-black text-slate-950 tracking-tight tabular-nums">
                {display}
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">{label}</span>
        </div>
    );
}

function BannerStat({ target, suffix, label, active, duration }: Stat & { active: boolean; duration?: number }) {
    const display = useCountUp(target, suffix, active, duration);
    return (
        <div className="text-center">
            <span className="block text-4xl font-black text-white tracking-tight tabular-nums">
                {display}
            </span>
            <span className="text-sm text-white/75 mt-1 block">{label}</span>
        </div>
    );
}

function PhaseBar({ phase, pct, color, active }: { phase: string; pct: number; color: string; active: boolean }) {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (active) {
            const t = setTimeout(() => setWidth(pct), 120);
            return () => clearTimeout(t);
        } else {
            setWidth(0);
        }
    }, [active, pct]);

    return (
        <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 w-3">{phase}</span>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${width}%`, transition: active ? "width 1.2s cubic-bezier(0.4,0,0.2,1)" : "none" }}
                />
            </div>
            <span className="text-xs font-bold text-slate-600 w-7 text-right">{pct}%</span>
        </div>
    );
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
    const { ref, inView } = useInViewRepeatable(0.1);
    const Icon = feature.icon;

    return (
        <div
            ref={ref}
            className="group bg-white border border-slate-200 rounded-3xl p-6 cursor-pointer
        hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#0797d5]/10
        hover:border-[#0797d5]/30"
            style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.55s ease ${index * 90}ms, transform 0.55s ease ${index * 90}ms, box-shadow 0.3s, border-color 0.3s`,
            }}
        >
            <div className="size-13 rounded-2xl bg-[#0797d5]/8 text-[#0797d5] flex items-center justify-center mb-5
        group-hover:bg-[#0797d5] group-hover:text-white transition-all duration-300 group-hover:scale-105">
                <Icon size={26} />
            </div>
            <h3 className="text-base font-bold text-slate-950 mb-2">{feature.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
        </div>
    );
}

/* ── Data para FAQ de la Página Principal ── */
interface HomeFAQItem {
    q: string;
    a: string;
}

const homeFaqs: HomeFAQItem[] = [
    {
        q: "¿Qué tipo de documentación técnica puedo centralizar en cada tablero?",
        a: "Voltguard está optimizado para almacenar diagramas unifilares (PDF o imágenes), certificados de operatividad, protocolos de pruebas de pozo a tierra, reportes de mantenimiento preventivo e historiales de termografía infrarroja. Todo queda indexado por empresa y tablero para auditorías rápidas."
    },
    {
        q: "¿Cómo funciona el control de estado operativo en tiempo real?",
        a: "La plataforma te permite registrar y visualizar parámetros críticos como tensión nominal, corriente máxima, temperatura de la barra y balance de fases (A, B, C). Puedes actualizar estos datos manualmente tras una inspección o mediante integraciones de lectura para mantener un semáforo de alertas (OK / Alerta / Crítico)."
    },
    {
        q: "¿Puedo segmentar los accesos si gestiono múltiples empresas o contratistas?",
        a: "Totalmente. El sistema cuenta con un módulo avanzado de roles y permisos. Puedes definir Superadmins (control total), Administradores por empresa (solo ven los tableros de su organización) y Técnicos/Inspectores (solo lectura o carga de reportes de mantenimiento)."
    },
    {
        q: "¿Qué sucede si mi personal en campo necesita revisar un diagrama desde su celular?",
        a: "La interfaz de Voltguard es 100% responsiva (Mobile-First). Los operarios pueden escanear códigos o buscar el tablero directamente desde su smartphone en campo para abrir diagramas unifilares o revisar bitácoras técnicas al instante sin necesidad de instalar apps pesadas."
    }
];

/* ── Componente de Fila FAQ para Home ── */
function HomeFAQRow({ q, a, index }: HomeFAQItem & { index: number }) {
    const [isOpen, setIsOpen] = useState(false);
    // Reutilizamos tu hook para detectar cuando la pregunta entra en pantalla
    const { ref, inView } = useInViewRepeatable(0.1);

    return (
        <div
            ref={ref}
            className="border border-slate-200 bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#0797d5]/30"
            style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(24px)",
                // index * 100ms hace que aparezcan en cascada una detrás de otra
                transition: `opacity 0.6s ease ${index * 100}ms, transform 0.6s ease ${index * 100}ms, border-color 0.3s`,
            }}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-950 hover:text-[#0797d5] transition-colors cursor-pointer"
            >
                <span className="text-sm sm:text-base pr-4">{q}</span>
                <ChevronDown 
                    size={18} 
                    className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#0797d5]" : ""}`} 
                />
            </button>
            <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-48 border-t border-slate-100" : "max-h-0"}`}
            >
                <p className="p-5 text-sm text-slate-500 leading-relaxed bg-slate-50/50">
                    {a}
                </p>
            </div>
        </div>
    );
}

/* ── Pricing simulation bars ────────────────────────────────────────────── */
function PlanLimitBar({
    label, value, max, color, active, delay,
}: {
    label: string; value: number | string; max: number; color: string; active: boolean; delay: number;
}) {
    const isUnlimited = value === "∞";
    const pct = isUnlimited ? 100 : typeof value === "number" ? Math.min((value / max) * 100, 100) : 0;
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (active) {
            const t = setTimeout(() => setWidth(pct), delay);
            return () => clearTimeout(t);
        } else {
            setWidth(0);
        }
    }, [active, pct, delay]);

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="text-slate-500">{label}</span>
                <span className="font-bold text-slate-700">{value === "∞" ? "Ilimitado" : value}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${color} ${isUnlimited ? "opacity-90" : ""}`}
                    style={{ width: `${width}%`, transition: active ? `width 1s cubic-bezier(0.4,0,0.2,1) ${delay}ms` : "none" }}
                />
            </div>
        </div>
    );
}

function PlanCard({ plan, billing, index, active }: { plan: Plan; billing: PlanBilling; index: number; active: boolean }) {
    const price = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
    const barColor = plan.color === "blue" ? "bg-[#0797d5]" : plan.color === "green" ? "bg-[#8ccf2f]" : "bg-slate-400";
    
    // Ajustamos las escalas máximas relativas al Plan Pro industrial
    const maxLimits = { empresas: 5, tableros: 200, usuarios: 20, docs: 100 };

    return (
        <div
            style={{
                opacity: active ? 1 : 0,
                transform: active ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)",
                transition: `opacity 0.6s ease ${index * 120}ms, transform 0.6s ease ${index * 120}ms`,
            }}
            className={`relative bg-white rounded-3xl p-7 flex flex-col gap-5 border transition-shadow duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                plan.featured
                    ? "border-[#0797d5] shadow-xl shadow-[#0797d5]/15 ring-1 ring-[#0797d5]/20"
                    : "border-slate-200 shadow-sm hover:shadow-[#0797d5]/10"
            }`}
        >
            {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 bg-[#0797d5] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-[#0797d5]/30">
                        <Star size={11} fill="white" />
                        {plan.badge}
                    </span>
                </div>
            )}

            {/* Header del Plan */}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-bold uppercase tracking-widest ${
                        plan.color === "blue" ? "text-[#0797d5]" : plan.color === "green" ? "text-[#5a8c1a]" : "text-slate-500"
                    }`}>
                        {plan.name}
                    </span>
                </div>
                <div className="flex items-end gap-1 mt-2">
                    <span className="text-4xl font-black text-slate-950 tracking-tight">
                        {price === 0 ? "Gratis" : `$${price}`}
                    </span>
                    {price > 0 && (
                        <span className="text-slate-400 text-sm mb-1.5">
                            /mes {billing === "yearly" && <span className="text-[#8ccf2f] font-bold ml-1">-20%</span>}
                        </span>
                    )}
                </div>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{plan.description}</p>
            </div>

            {/* Barras de Simulación de Capacidad Operativa */}
            <div className="space-y-3 py-4 border-y border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Capacidad del Servicio</p>
                <PlanLimitBar label="Tableros Permitidos" value={plan.limits.tableros} max={maxLimits.tableros} color={barColor} active={active} delay={index * 120 + 200} />
                <PlanLimitBar label="Empresas Vinculadas" value={plan.limits.empresas} max={maxLimits.empresas} color={barColor} active={active} delay={index * 120 + 300} />
                <PlanLimitBar label="Accesos de Lectura" value={plan.limits.usuarios} max={maxLimits.usuarios} color={barColor} active={active} delay={index * 120 + 400} />
            </div>

            {/* Lista de Características de Ingeniería */}
            <ul className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <span className={`mt-0.5 shrink-0 size-4 rounded-full flex items-center justify-center ${
                            plan.featured ? "bg-[#0797d5]/10 text-[#0797d5]" : plan.color === "green" ? "bg-[#8ccf2f]/15 text-[#4a7c10]" : "bg-slate-100 text-slate-500"
                        }`}>
                            <Check size={10} strokeWidth={3} />
                        </span>
                        {f}
                    </li>
                ))}
            </ul>

            {/* Botón de Acción CTA */}
            <button
                className={`w-full py-3 rounded-2xl font-bold text-sm transition-all duration-250 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer ${
                    plan.featured
                        ? "bg-[#0797d5] hover:bg-[#087fb3] text-white hover:shadow-[#0797d5]/30"
                        : plan.color === "green"
                            ? "bg-slate-900 hover:bg-slate-800 text-white hover:shadow-slate-900/20"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                }`}
            >
                {plan.cta}
            </button>
        </div>
    );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function HomePage() {
    const navigate = useNavigate();
    const [billing, setBilling] = useState<PlanBilling>("monthly");

    /* all sections use repeatable InView */
    const { ref: heroCardRef, inView: heroCardVisible } = useInViewRepeatable(0.2);
    const { ref: heroStatsRef, inView: heroStatsVisible } = useInViewRepeatable(0.3);
    const { ref: bannerRef, inView: bannerVisible } = useInViewRepeatable(0.25);
    const { ref: ctaRef, inView: ctaVisible } = useInViewRepeatable(0.15);
    const { ref: featHeadRef, inView: featHeadVisible } = useInViewRepeatable(0.15);
    const { ref: pricingRef, inView: pricingVisible } = useInViewRepeatable(0.1);
    const { ref: pricingHeadRef, inView: pricingHeadVisible } = useInViewRepeatable(0.15);
    const { ref: homeFaqHeadRef, inView: homeFaqHeadVisible } = useInViewRepeatable(0.15);

    /* pulsing dot */
    const [dotScale, setDotScale] = useState(1);
    useEffect(() => {
        const t = setInterval(() => setDotScale((s) => (s === 1 ? 0.6 : 1)), 900);
        return () => clearInterval(t);
    }, []);

    const scrollToFeatures = useCallback(() => {
        document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
    }, []);

    return (
        <div className="bg-slate-50 min-h-screen overflow-x-hidden">


            {/* ── HERO ────────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden pt-30">
                <div className="absolute -top-32 -left-32 size-96 rounded-full bg-[#0797d5]/10 blur-3xl pointer-events-none" />
                <div className="absolute top-10 -right-32 size-80 rounded-full bg-[#8ccf2f]/10 blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">

                    {/* left — always visible on load */}
                    <div style={{ animation: "fadeUp 0.6s ease both" }}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
              border border-[#0797d5]/20 bg-[#0797d5]/5 text-sm font-semibold text-[#0797d5] mb-6"
                            style={{ animation: "fadeUp 0.5s ease 0.1s both" }}>
                            <span className="size-2 rounded-full bg-[#8ccf2f] relative"
                                style={{ transform: `scale(${dotScale})`, transition: "transform 0.4s ease" }}>
                                <span className="absolute inset-[-4px] rounded-full border-2 border-[#8ccf2f] animate-ping opacity-60" />
                            </span>
                            Plataforma inteligente de gestión eléctrica
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.06]"
                            style={{ animation: "fadeUp 0.6s ease 0.15s both" }}>
                            Gestiona tableros<br />eléctricos con{" "}
                            <span className="bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] bg-clip-text text-transparent"
                                style={{ backgroundSize: "200% 200%", animation: "gradShift 4s ease infinite" }}>
                                Voltguard
                            </span>
                        </h1>

                        <p className="mt-5 text-lg text-slate-600 leading-8 max-w-xl"
                            style={{ animation: "fadeUp 0.6s ease 0.25s both" }}>
                            Centraliza empresas, tableros, diagramas, usuarios, documentos y reportes
                            técnicos en una sola plataforma moderna y profesional.
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row gap-3"
                            style={{ animation: "fadeUp 0.6s ease 0.35s both" }}>
                            <button
                                onClick={() => navigate("/login")}
                                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5
                  bg-[#0797d5] hover:bg-[#087fb3] text-white font-bold text-sm rounded-2xl
                  transition-all duration-300 hover:-translate-y-0.5
                  hover:shadow-xl hover:shadow-[#0797d5]/30 relative overflow-hidden">
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15
                  to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                                Ingresar al sistema
                                <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                            <button onClick={scrollToFeatures}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5
                  bg-white border border-slate-200 hover:border-[#0797d5]/40
                  text-slate-700 hover:text-[#0797d5] font-bold text-sm rounded-2xl
                  transition-all duration-250 hover:-translate-y-0.5">
                                Ver funcionalidades
                            </button>
                        </div>

                        <div ref={heroStatsRef} className="mt-8 flex items-center gap-6"
                            style={{ animation: "fadeUp 0.6s ease 0.45s both" }}>
                            {heroStats.map((s, i) => (
                                <div key={s.id} className="flex items-center gap-6">
                                    <AnimatedStat {...s} active={heroStatsVisible} duration={900 + i * 200} />
                                    {i < heroStats.length - 1 && <div className="w-px h-8 bg-slate-200" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* right — hero card with repeatable phases */}
                    <div ref={heroCardRef} className="relative"
                        style={{
                            opacity: heroCardVisible ? 1 : 0,
                            transform: heroCardVisible ? "translateX(0)" : "translateX(40px)",
                            transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
                        }}>
                        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden
              shadow-2xl shadow-slate-200/80"
                            style={{ animation: "float 5s ease-in-out infinite" }}>
                            <div className="bg-gradient-to-r from-[#0797d5] to-[#05c4f7] px-5 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-white font-bold text-sm">
                                    <Zap size={16} />
                                    Tablero Industrial #07
                                </div>
                                <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-white text-xs font-bold">
                                    <span className="size-1.5 rounded-full bg-white animate-pulse" />
                                    En línea
                                </div>
                            </div>
                            <div className="px-5 py-1 divide-y divide-slate-100">
                                {[
                                    { icon: Plug, label: "Tensión nominal", value: "380V / 220V", cls: "text-[#0797d5] font-bold text-sm" },
                                    { icon: Activity, label: "Corriente máx.", badge: "ok", value: "142 A" },
                                    { icon: Thermometer, label: "Temperatura", badge: "warn", value: "47°C" },
                                    { icon: CheckCircle2, label: "Certificación", badge: "ok", value: "Vigente" },
                                ].map(({ icon: Icon, label, value, cls, badge }) => (
                                    <div key={label} className="flex items-center justify-between py-2.5">
                                        <span className="flex items-center gap-2 text-xs text-slate-500">
                                            <Icon size={14} /> {label}
                                        </span>
                                        {badge === "ok" && (
                                            <span className="text-xs font-bold bg-[#8ccf2f]/12 text-[#4a7c10] px-2.5 py-0.5 rounded-full">
                                                {value} ✓
                                            </span>
                                        )}
                                        {badge === "warn" && (
                                            <span className="text-xs font-bold bg-amber-500/10 text-amber-700 px-2.5 py-0.5 rounded-full">
                                                {value} ⚠
                                            </span>
                                        )}
                                        {!badge && <span className={cls ?? "text-sm font-bold text-slate-900"}>{value}</span>}
                                    </div>
                                ))}
                            </div>
                            <div className="px-5 pb-5 pt-3 border-t border-slate-100 space-y-2.5">
                                <PhaseBar phase="A" pct={88} color="bg-[#0797d5]" active={heroCardVisible} />
                                <PhaseBar phase="B" pct={92} color="bg-[#8ccf2f]" active={heroCardVisible} />
                                <PhaseBar phase="C" pct={74} color="bg-amber-400" active={heroCardVisible} />
                            </div>
                        </div>
                        <div className="absolute -top-4 -right-3 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-lg"
                            style={{ animation: "float 4s ease-in-out 0.5s infinite" }}>
                            <div className="text-xl font-black text-[#0797d5]">14</div>
                            <div className="text-xs text-slate-500 mt-0.5">Tableros activos</div>
                        </div>
                        <div className="absolute -bottom-4 -left-3 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-lg"
                            style={{ animation: "float 6s ease-in-out 1s infinite" }}>
                            <div className="text-xs font-bold text-slate-800">Acero Perú S.A.</div>
                            <div className="text-xs text-slate-400 mt-0.5">Empresa vinculada</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FEATURES ────────────────────────────────────────────────────── */}
            <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div
                    ref={featHeadRef}
                    style={{
                        opacity: featHeadVisible ? 1 : 0,
                        transform: featHeadVisible ? "translateY(0)" : "translateY(24px)",
                        transition: "opacity 0.65s ease, transform 0.65s ease",
                    }}
                    className="text-center mb-14">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#0797d5] mb-3">
                        Funcionalidades
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                        Todo lo que necesitas para la gestión eléctrica
                    </h2>
                    <p className="mt-4 text-slate-500 max-w-xl mx-auto leading-7">
                        Diseñado para empresas que necesitan control técnico, documentación y trazabilidad.
                    </p>
                </div>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {features.map((f, i) => (
                        <FeatureCard key={f.title} feature={f} index={i} />
                    ))}
                </div>
            </section>

            {/* ── STATS BANNER ────────────────────────────────────────────────── */}
            <div ref={bannerRef} className="bg-gradient-to-r from-[#0797d5] to-[#05c4f7] relative overflow-hidden">
                <div className="absolute -top-20 -right-20 size-72 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute -bottom-16 left-1/4 size-48 rounded-full bg-[#8ccf2f]/15 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                    {bannerStats.map((s, i) => (
                        <BannerStat key={s.id} {...s} active={bannerVisible} duration={1000 + i * 200} />
                    ))}
                </div>
            </div>

            {/* ── PRICING ─────────────────────────────────────────────────────── */}
            <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
    <div
        ref={pricingHeadRef}
        style={{
            opacity: pricingHeadVisible ? 1 : 0,
            transform: pricingHeadVisible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.65s ease, transform 0.65s ease",
        }}
        className="text-center mb-12"
    >
        <p className="text-xs font-bold uppercase tracking-widest text-[#0797d5] mb-3">Dimensionamiento del Servicio</p>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Planes adaptados al volumen de tu empresa
        </h2>
        <p className="mt-4 text-slate-500 max-w-xl mx-auto leading-7 text-sm sm:text-base">
            Todo el levantamiento de ingeniería y carga de planos es gestionado directamente por los especialistas de Voltguard. Selecciona tu plan según el inventario de tableros de tu planta.
        </p>

        {/* Toggle de Facturación Mensual / Anual */}
        <div className="inline-flex items-center gap-1 mt-8 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            {(["monthly", "yearly"] as PlanBilling[]).map((b) => (
                <button
                    key={b}
                    onClick={() => setBilling(b)}
                    className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-250 cursor-pointer ${
                        billing === b
                            ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                            : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                    {b === "monthly" ? "Facturación Mensual" : (
                        <span className="flex items-center gap-1.5">
                            Facturación Anual
                            <span className="bg-[#8ccf2f]/20 text-[#4a7c10] text-xs font-bold px-1.5 py-0.5 rounded-full">
                                -20%
                            </span>
                        </span>
                    )}
                </button>
            ))}
        </div>
    </div>

    {/* Grid de Tarjetas de Planes */}
    <div ref={pricingRef} className="grid gap-6 md:grid-cols-3">
        {plans.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} billing={billing} index={i} active={pricingVisible} />
        ))}
    </div>

    <p className="text-center text-xs text-slate-400 mt-8">
        La descarga técnica (Etiquetas PDF o Archivos CAD originales) se habilita en tu consola interna basándose estrictamente en el plan corporativo contratado.
    </p>
</section>

            {/* ── SYSTEM FAQS ────────────────────────────────────────────────── */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                {/* Cabecera animada */}
                <div 
                    ref={homeFaqHeadRef}
                    className="text-center mb-10"
                    style={{
                        opacity: homeFaqHeadVisible ? 1 : 0,
                        transform: homeFaqHeadVisible ? "translateY(0)" : "translateY(24px)",
                        transition: "opacity 0.65s ease, transform 0.65s ease",
                    }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                        bg-[#0797d5]/8 border border-[#0797d5]/20 text-[#0797d5] text-xs font-bold mb-4">
                        <HelpCircle size={13} />
                        Consultas del Sistema
                    </div>
                    <h2 className="text-3xl font-black text-slate-950 tracking-tight">
                        Preguntas Frecuentes sobre la plataforma
                    </h2>
                    <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto leading-relaxed">
                        Resuelve tus dudas técnicas sobre la gestión, los módulos operativos y el control de accesos en Voltguard.
                    </p>
                </div>

                {/* Lista de acordeones con animación escalonada */}
                <div className="space-y-3">
                    {homeFaqs.map((faq, i) => (
                        <HomeFAQRow key={i} {...faq} index={i} />
                    ))}
                </div>
            </section>

            {/* ── CTA ─────────────────────────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div
                    ref={ctaRef}
                    style={{
                        opacity: ctaVisible ? 1 : 0,
                        transform: ctaVisible ? "translateY(0)" : "translateY(32px)",
                        transition: "opacity 0.7s ease, transform 0.7s ease",
                    }}
                    className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-10 lg:p-14
            relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 size-80 rounded-full bg-[#0797d5]/20 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-20 left-1/3 size-64 rounded-full bg-[#8ccf2f]/15 blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                bg-[#8ccf2f]/15 border border-[#8ccf2f]/30 text-[#8ccf2f] text-xs font-bold mb-5">
                                <CheckCircle2 size={13} />
                                Plataforma operativa
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                                Lleva el control total de tus<br />tableros eléctricos
                            </h2>
                            <p className="mt-4 text-white/60 text-sm leading-7 max-w-lg">
                                Gestiona empresas, usuarios, documentos y tableros desde una sola plataforma moderna y centralizada.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/login")}
                            className="group shrink-0 inline-flex items-center gap-2.5 px-8 py-4
                bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-sm
                rounded-2xl transition-all duration-250 hover:scale-105 hover:shadow-2xl hover:shadow-black/30">
                            Comenzar ahora
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
                        </button>
                    </div>
                </div>
            </section>

        </div>
    );
}
