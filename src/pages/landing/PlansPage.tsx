import {
    Activity,
    ArrowRight,
    Award,
    Check,
    ChevronDown,
    FileCode,
    FileText,
    HelpCircle,
    Image,
    Layers,
    Shield,
    ShieldAlert,
    Users,
    X,
    Zap
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Keyframes (mismo sistema que HomePage) ─────────────────────────────── */

const STYLE = `
@keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
@keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes blobMove { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
@keyframes electricPulse { 0%,100%{opacity:1;filter:drop-shadow(0 0 4px #0797d5)} 50%{opacity:0.5;filter:drop-shadow(0 0 12px #0797d5) drop-shadow(0 0 24px #0797d5)} }
@keyframes gridFade { 0%,100%{opacity:0.03} 50%{opacity:0.07} }
@keyframes particleDrift { 0%{transform:translateY(0) translateX(0) scale(1);opacity:0.7} 100%{transform:translateY(-120px) translateX(20px) scale(0);opacity:0} }
@keyframes glowPulse { 0%,100%{box-shadow:0 0 20px rgba(7,151,213,0.2),0 0 40px rgba(7,151,213,0.1)} 50%{box-shadow:0 0 40px rgba(7,151,213,0.4),0 0 80px rgba(7,151,213,0.2)} }
@keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
@keyframes zap { 0%,100%{opacity:1} 25%{opacity:0.2} 75%{opacity:0.7} }
@keyframes slideInModal { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
`;

function InjectStyles() {
    useEffect(() => {
        const id = "voltguard-planes-styles";
        if (document.getElementById(id)) return;
        const el = document.createElement("style");
        el.id = id; el.textContent = STYLE;
        document.head.appendChild(el);
        return () => { document.getElementById(id)?.remove(); };
    }, []);
    return null;
}

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface FAQItem { q: string; a: string; }
interface Plan {
    id: "free" | "pro";
    name: string; badge?: string; priceLabel: string; subLabel: string;
    description: string; color: string; featured: boolean; features: string[]; cta: string; path: string;
    limits: { empresas: number | string; tableros: number | string; usuarios: number | string; docs: number | string; };
}

/* ─── Data — idéntica a HomePage.tsx ────────────────────────────────────── */

const plans: Plan[] = [
    {
        id: "free",
        name: "Free", priceLabel: "Gratis", subLabel: "Plan de entrada",
        description: "Mapeo piloto inicial para explorar el ecosistema digital de Voltguard.",
        color: "slate", featured: false, cta: "Comenzar gratis", path: "/auth/register?plan=free",
        features: ["1 Tablero Eléctrico", "Exclusivo para Tablero General (TG)", "Seguimiento de parámetros en tiempo real", "Visor digital en plataforma web", "Soporte técnico por email"],
        limits: { empresas: 1, tableros: 1, usuarios: 2, docs: 5 }
    },
    {
        id: "pro",
        name: "Pro Corporativo", badge: "Más recomendado", priceLabel: "Consulte con Ventas",
        subLabel: "Suscripción anual personalizada",
        description: "Optimizado para plantas industriales, clínicas y auditorías de alta exigencia bajo norma.",
        color: "blue", featured: true, cta: "Contactar ventas", path: "/contact-sales",
        features: ["Hasta 200 Tableros Eléctricos", "Despliegue, levantamiento e inspección presencial", "Diseño de diagramas unifilares y rotulación de circuitos", "Pruebas de aislamiento (Megado) y análisis termográfico", "Estudio de seguridad NFPA 70E y programa predictivo NFPA 70B", "Emisión de certificados de operatividad y mantenimiento", "Visualización, descarga de Etiquetas (PDF) y archivos CAD (.DWG)"],
        limits: { empresas: "Multi-sede", tableros: 200, usuarios: "∞", docs: "∞" }
    }
];

const faqs: FAQItem[] = [
    { q: "¿Quién se encarga de subir los diagramas, fotos y certificados al sistema?", a: "Todo el trabajo de campo, levantamiento técnico y procesamiento de archivos es realizado exclusivamente por el personal calificado de Voltguard. Tus usuarios y clientes solo ingresan al sistema web para visualizar el estado de sus activos y descargar la documentación autorizada según su plan." },
    { q: "¿Cómo funciona el límite de tableros en cada plan?", a: "Los límites representan el alcance máximo del inventario de ingeniería contratado. El Plan Free incluye únicamente el Tablero General (TG) piloto; el Plan Pro Corporativo se despliega a nivel industrial cubriendo hasta 200 tableros eléctricos en configuración multi-sede." },
    { q: "¿Cuál es la diferencia entre los entregables PDF y CAD?", a: "El Plan Pro Corporativo permite descargar reportes ejecutivos, estudios NFPA 70E y etiquetas normativas en PDF, además de los planos originales digitalizados en formato CAD (.DWG), ideales para modificaciones de ingeniería interna o futuras ampliaciones." },
    { q: "¿Qué normativas de seguridad se aplican en las inspecciones?", a: "Nuestro equipo realiza la rotulación e identificación de riesgos basándose en NFPA 70E (seguridad eléctrica en el trabajo) y NFPA 70B (programa de mantenimiento predictivo y preventivo), aplicables desde el Plan Pro Corporativo." },
];

const tableRows: {
    category?: string; label?: string; icon?: React.ElementType;
    free: boolean | string | null; pro: boolean | string | null;
}[] = [
    { label: "Límite de tableros cubiertos",       icon: Zap,       free: "1 Tablero",           pro: "Hasta 200 Tableros" },
    { label: "Jerarquía técnica permitida",         icon: Layers,    free: "Solo Tablero General", pro: "Toda la Red Interna" },
    { label: "Permisos de descarga",                icon: FileCode,  free: "Solo visualización web", pro: "PDF + Planos CAD (.DWG)" },
    { category: "Entregables de Ingeniería (Personal Voltguard)", free: null, pro: null },
    { label: "Levantamiento fotográfico técnico",   icon: Image,     free: false, pro: true },
    { label: "Diseño de diagramas unifilares",      icon: FileText,  free: false, pro: true },
    { label: "Rotulación de circuitos y leyendas",  icon: Layers,    free: false, pro: true },
    { label: "Estudio de Seguridad NFPA 70E",       icon: Shield,    free: false, pro: true },
    { category: "Ingeniería Avanzada y Campo (Exclusivo Pro Corporativo)", free: null, pro: null },
    { label: "Inspección y despliegue presencial",  icon: Users,     free: false, pro: true },
    { label: "Pruebas de aislamiento (Megado)",     icon: Activity,  free: false, pro: true },
    { label: "Escaneo por Termografía Infrarroja",  icon: Activity,  free: false, pro: true },
    { label: "Cuadro de cargas y Demanda Máxima",   icon: FileText,  free: false, pro: true },
    { label: "Emisión de certificados de operatividad", icon: Award, free: false, pro: true },
    { label: "Programa Predictivo NFPA 70B",        icon: ShieldAlert, free: false, pro: true },
];

/* ─── Hooks ──────────────────────────────────────────────────────────────── */

function useInViewRepeatable(threshold = 0.1) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold });
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, inView };
}

/* ─── Decorative helpers (idénticos a HomePage) ──────────────────────────── */

// function BackgroundGrid() {
//     return (
//         <div className="absolute inset-0 pointer-events-none overflow-hidden">
//             <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ animation: "gridFade 4s ease-in-out infinite" }}>
//                 <defs><pattern id="pgp" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0797d5" strokeWidth="0.5" /></pattern></defs>
//                 <rect width="100%" height="100%" fill="url(#pgp)" />
//             </svg>
//         </div>
//     );
// }

// function FloatingParticles({ count = 8 }: { count?: number }) {
//     const p = Array.from({ length: count }, (_, i) => ({ id: i, x: 10 + (i * 12) % 85, y: 20 + (i * 17) % 70, delay: i * 0.7, duration: 3 + (i % 3), size: 2 + (i % 3) }));
//     return (
//         <div className="absolute inset-0 pointer-events-none overflow-hidden">
//             {p.map(pt => <div key={pt.id} className="absolute rounded-full bg-[#0797d5]" style={{ left: `${pt.x}%`, top: `${pt.y}%`, width: pt.size, height: pt.size, opacity: 0.5, animation: `particleDrift ${pt.duration}s ease-in ${pt.delay}s infinite` }} />)}
//         </div>
//     );
// }

/* ─── Plan Card — mismo componente que HomePage ──────────────────────────── */

function PlanCard({ plan, index, active }: { plan: Plan; index: number; active: boolean }) {
    const navigate = useNavigate();
    const [hovered, setHovered] = useState(false);
    const isFree = plan.color === "slate";
    console.log(hovered)

    return (
        <div
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
            style={{ opacity: active ? 1 : 0, transform: active ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)", transition: `opacity 0.6s ease ${index * 150}ms, transform 0.6s ease ${index * 150}ms` }}
            className={`relative rounded-3xl flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-2
                ${isFree
                    ? "border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-[#0797d5]/10"
                    : "border border-[#0797d5]/40 shadow-xl shadow-[#0797d5]/15 hover:shadow-2xl hover:shadow-[#0797d5]/25"
                }`}
        >
            {/* ── HEADER ── */}
            <div className={`relative px-7 py-8 overflow-hidden ${isFree ? "bg-slate-100" : "bg-gradient-to-br from-[#0797d5] to-[#05c4f7]"}`}>
                {!isFree && (
                    <>
                        <div className="absolute inset-0 pointer-events-none opacity-10">
                            <svg width="100%" height="100%"><defs><pattern id="hgp" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs><rect width="100%" height="100%" fill="url(#hgp)" /></svg>
                        </div>
                        <div className="absolute -top-6 -right-6 size-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
                        <div className="absolute -bottom-4 -left-4 size-16 rounded-full bg-[#8ccf2f]/20 blur-lg pointer-events-none" />
                    </>
                )}
                {plan.badge && (
                    <div className="absolute top-0 right-0 overflow-hidden w-24 h-24 pointer-events-none">
                        <div className="absolute top-4 right-[-22px] rotate-45 bg-[#8ccf2f] text-white text-[10px] font-black px-8 py-1 shadow-md tracking-wide uppercase">
                            Popular
                        </div>
                    </div>
                )}
                <span className={`relative z-10 block text-center text-2xl font-black tracking-tight ${isFree ? "text-slate-600" : "text-white"}`}>
                    {plan.name}
                </span>
            </div>

            {/* ── BODY ── */}
            <div className="bg-white flex flex-col flex-1 px-7 pt-7 pb-7 gap-6">
                {/* <div className="text-center py-2">
                    <div className={`text-4xl font-black tracking-tight leading-none ${isFree ? "text-slate-900" : "text-[#0797d5]"}`}>
                        {isFree ? "0 dólares" : "Consulte"}
                        <span className="text-sm font-medium text-slate-400 tracking-normal">/año</span>
                    </div>
                    <span className="text-xs text-slate-400 mt-2 block font-medium">
                        {isFree ? "Sin tarjetas de crédito" : "Suscripción anual personalizada"}
                    </span>
                    <p className="text-sm text-slate-500 mt-4 leading-relaxed max-w-sm mx-auto">{plan.description}</p>
                </div>

                <div className={`h-px w-full ${isFree ? "bg-slate-100" : "bg-[#0797d5]/10"}`} /> */}

                <ul className="space-y-3 flex-1">
                    {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm group/item">
                            <span className={`mt-0.5 shrink-0 size-4 rounded-full flex items-center justify-center transition-all duration-300 group-hover/item:scale-110 ${isFree ? "bg-slate-100 text-slate-400" : "bg-[#0797d5]/10 text-[#0797d5]"}`}>
                                <Check size={10} strokeWidth={3} />
                            </span>
                            <span className={isFree ? "text-slate-600" : "text-slate-700 font-medium"}>{f}</span>
                        </li>
                    ))}
                    {isFree && (
                        <>
                            {["Diagramas unifilares CAD (.DWG)", "Análisis termográfico avanzado", "Certificados NFPA 70E / 70B"].map(locked => (
                                <li key={locked} className="flex items-start gap-2.5 text-sm opacity-40 select-none">
                                    <span className="mt-0.5 shrink-0 size-4 rounded-full flex items-center justify-center bg-slate-100 text-slate-300"><Check size={10} strokeWidth={3} /></span>
                                    <span className="text-slate-400 line-through">{locked}</span>
                                </li>
                            ))}
                        </>
                    )}
                </ul>

                <button
                    onClick={() => navigate(plan.path)}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group/btn
                        ${isFree
                            ? "border-2 border-slate-300 hover:border-[#0797d5] bg-white text-slate-800 hover:text-[#0797d5] hover:shadow-md"
                            : "bg-gradient-to-r from-[#0797d5] to-[#05c4f7] hover:from-[#087fb3] hover:to-[#0797d5] text-white hover:shadow-xl hover:shadow-[#0797d5]/40"
                        }`}
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500 pointer-events-none" />
                    {plan.cta}
                </button>
            </div>
        </div>
    );
}

/* ─── Comparison Table ───────────────────────────────────────────────────── */

function CellValue({ val }: { val: boolean | string | null }) {
    if (val === null) return null;
    if (typeof val === "boolean") return val
        ? <Check size={17} className="text-[#0797d5] mx-auto" strokeWidth={3} />
        : <X size={16} className="text-slate-200 mx-auto" strokeWidth={2} />;
    return <span className="text-slate-700 font-semibold text-xs sm:text-sm">{val}</span>;
}

/* ─── FAQ Row — mismo componente que HomePage ────────────────────────────── */

function FAQRow({ q, a, index, active }: FAQItem & { index: number; active: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-slate-200 bg-white rounded-2xl overflow-hidden hover:border-[#0797d5]/40 hover:shadow-md transition-all duration-300"
            style={{ opacity: active ? 1 : 0, transform: active ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.6s ease ${index * 100}ms, transform 0.6s ease ${index * 100}ms, border-color 0.3s, box-shadow 0.3s` }}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-950 hover:text-[#0797d5] transition-colors cursor-pointer group">
                <span className="text-sm sm:text-base pr-4">{q}</span>
                <div className={`shrink-0 size-7 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? "bg-[#0797d5] text-white rotate-180" : "bg-slate-100 text-slate-400 group-hover:bg-[#0797d5]/10 group-hover:text-[#0797d5]"}`}>
                    <ChevronDown size={15} />
                </div>
            </button>
            <div className={`transition-all duration-400 ease-in-out overflow-hidden ${isOpen ? "max-h-52 border-t border-slate-100" : "max-h-0"}`}>
                <p className="p-5 text-sm text-slate-500 leading-relaxed bg-slate-50/50">{a}</p>
            </div>
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */

export default function PlanesPage() {
    const navigate = useNavigate();

    const { ref: headerRef, inView: headerVisible } = useInViewRepeatable(0.1);
    const { ref: cardsRef, inView: cardsVisible } = useInViewRepeatable(0.1);
    const { ref: tableRef, inView: tableVisible } = useInViewRepeatable(0.05);
    const { ref: faqHeadRef, inView: faqHeadVisible } = useInViewRepeatable(0.1);
    const { ref: faqListRef, inView: faqListVisible } = useInViewRepeatable(0.1);
    const { ref: trustRef, inView: trustVisible } = useInViewRepeatable(0.1);

    return (
        <div className="bg-slate-50 min-h-screen py-20 overflow-x-hidden relative">
            <InjectStyles />

            {/* Fondo decorativo — igual a HomePage */}
            <div className="absolute top-0 left-0 right-0 h-[500px] pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-32 -left-32 size-96 rounded-full bg-[#0797d5]/5 blur-3xl" style={{ animation: "blobMove 8s ease-in-out infinite" }} />
                <div className="absolute top-20 -right-32 size-80 rounded-full bg-[#8ccf2f]/5 blur-3xl" style={{ animation: "blobMove 10s ease-in-out 2s infinite reverse" }} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10">

                {/* ── HEADER ── */}
                <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-12"
                    style={{ opacity: headerVisible ? 1 : 0, transform: headerVisible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.65s ease, transform 0.65s ease" }}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#0797d5]/20 bg-[#0797d5]/5 text-sm font-semibold text-[#0797d5] mb-6">
                        <Award size={15} />
                        Dimensionamiento Comercial B2B
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight leading-none mb-4">
                        Planes a tu{" "}
                        <span className="bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] bg-clip-text text-transparent"
                            style={{ backgroundSize: "200% 200%", animation: "gradShift 4s ease infinite" }}>
                            medida operativa
                        </span>
                    </h1>
                    <p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
                        Prueba la plataforma de manera autónoma con el plan inicial o implementa Voltguard de forma integral en toda tu organización corporativa con la asistencia experta de nuestros ingenieros especialistas.
                    </p>
                </div>

                {/* ── TARJETAS DE PLANES ── */}
                <div ref={cardsRef} className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto mb-8">
                    {plans.map((plan, i) => <PlanCard key={plan.name} plan={plan} index={i} active={cardsVisible} />)}
                </div>
                <p className="text-center text-xs text-slate-400 mb-24">
                    La descarga técnica (Etiquetas PDF o Archivos CAD originales) se habilita en tu consola interna basándose estrictamente en el plan corporativo contratado.
                </p>

                {/* ── TABLA COMPARATIVA ── */}
                <div ref={tableRef} className="mb-24"
                    style={{ opacity: tableVisible ? 1 : 0, transform: tableVisible ? "translateY(0)" : "translateY(28px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
                    <div className="text-center lg:text-left mb-8">
                        <h2 className="text-2xl font-black text-slate-950 tracking-tight">Comparativa detallada de servicios</h2>
                        <p className="text-sm text-slate-500 mt-1">Revisa el alcance operativo y los formatos autorizados de descarga para tu auditoría.</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/70">
                                        <th className="p-5 text-sm font-bold text-slate-400 uppercase tracking-wider w-1/2">Capacidad y Cobertura</th>
                                        <th className="p-5 text-sm font-black text-slate-500 text-center">Free</th>
                                        <th className="p-5 text-sm font-black text-[#0797d5] text-center bg-[#0797d5]/3">Pro Corporativo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {tableRows.map((row, i) => {
                                        if (row.category) {
                                            return (
                                                <tr key={i} className="bg-slate-50/60">
                                                    <td className="px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-400" colSpan={3}>{row.category}</td>
                                                </tr>
                                            );
                                        }
                                        const Icon = row.icon;
                                        return (
                                            <tr key={i} className="hover:bg-slate-50/40 transition-colors duration-150">
                                                <td className="p-4 sm:p-5">
                                                    <div className="flex items-center gap-2 text-slate-600 font-medium text-xs sm:text-sm">
                                                        {Icon && <Icon size={14} className="text-slate-400 shrink-0" />}
                                                        {row.label}
                                                    </div>
                                                </td>
                                                <td className="p-4 sm:p-5 text-center bg-slate-50/30"><CellValue val={row.free} /></td>
                                                <td className="p-4 sm:p-5 text-center bg-[#0797d5]/2"><CellValue val={row.pro} /></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ── FAQs ── */}
                <div className="max-w-4xl mx-auto mb-24">
                    <div ref={faqHeadRef} className="text-center mb-10"
                        style={{ opacity: faqHeadVisible ? 1 : 0, transform: faqHeadVisible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.65s ease, transform 0.65s ease" }}>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0797d5]/8 border border-[#0797d5]/20 text-[#0797d5] text-xs font-bold mb-4">
                            <HelpCircle size={13} style={{ animation: "zap 2s ease-in-out infinite" }} />
                            Consultas del Servicio
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Preguntas frecuentes</h2>
                        <p className="text-slate-500 text-sm mt-2">¿Tienes dudas sobre los alcances del servicio o el procesamiento de datos técnicos? Aquí te respondemos.</p>
                    </div>
                    <div ref={faqListRef} className="space-y-3">
                        {faqs.map((faq, i) => <FAQRow key={i} {...faq} index={i} active={faqListVisible} />)}
                    </div>
                </div>

                {/* ── TRUST BANNER ── */}
                <div ref={trustRef} className="border border-slate-200 bg-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm"
                    style={{ opacity: trustVisible ? 1 : 0, transform: trustVisible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.65s ease, transform 0.65s ease" }}>
                    <div className="flex items-center gap-4 text-left">
                        <div className="size-12 rounded-2xl bg-[#8ccf2f]/10 text-[#4a7c10] flex items-center justify-center shrink-0">
                            <Shield size={22} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-950 text-base">¿Tienes un volumen mayor a 200 tableros?</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Diseñamos propuestas y SLAs corporativos a la medida de grandes complejos industriales o multi-sedes.</p>
                        </div>
                    </div>
                    <button onClick={() => navigate("/contact-sales")}
                        className="group inline-flex items-center gap-2 px-5 py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all duration-200 shrink-0 cursor-pointer">
                        Contactar con Soporte Corporativo
                        <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>

            </div>
        </div>
    );
}
