import {
    Activity,
    ArrowRight,
    Award,
    Check,
    ChevronDown,
    FileCheck,
    FileCode,
    FileText,
    HelpCircle,
    Layers,
    Shield,
    ShieldAlert,
    Users,
    X,
    Zap
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Keyframes ─────────────────────────────────────────────────────────── */

const STYLE = `
@keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
@keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes blobMove { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
@keyframes electricPulse { 0%,100%{opacity:1;filter:drop-shadow(0 0 4px #0797d5)} 50%{opacity:0.5;filter:drop-shadow(0 0 12px #0797d5) drop-shadow(0 0 24px #0797d5)} }
@keyframes gridFade { 0%,100%{opacity:0.03} 50%{opacity:0.07} }
@keyframes particleDrift { 0%,100%{transform:translateY(0) translateX(0) scale(1);opacity:0.7} 100%{transform:translateY(-120px) translateX(20px) scale(0);opacity:0} }
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
    id: "basic" | "pyme" | "enterprise";
    name: string; badge?: string; priceLabel: string; subLabel: string;
    description: string; color: string; featured: boolean; features: string[]; cta: string; path: string;
    limits: { empresas: number | string; tableros: number | string; usuarios: number | string; docs: number | string; };
}

/* ─── Data — Matriz de la imagen y norma ITSE ───────────────────────────── */

const plans: Plan[] = [
    {
        id: "basic",
        name: "Plan Básico", priceLabel: "Gratis", subLabel: "Pequeño Comercio (Esencial: 01 tablero)",
        description: "Mapeo inicial y rotulación en PDF para pequeños locales que inician su ordenamiento eléctrico.",
        color: "slate", featured: false, cta: "Comenzar gratis", path: "/auth?plan=basic",
        features: [
            "01 Tablero Eléctrico",
            "Rotulación (Leyenda) en PDF",
            "Visor digital en plataforma web Voltguard",
            "Soporte técnico por email"
        ],
        limits: { empresas: 1, tableros: 1, usuarios: 1, docs: 3 }
    },
    {
        id: "pyme",
        name: "Plan Intermedio", badge: "Recomendado PYME", priceLabel: "S/ 350.00 + IGV",
        subLabel: "Comercial / Servicios (01 a 04 tableros)",
        description: "Optimizado para pymes y comercios que necesitan regularizar licencias ITSE y obtener firma CIP.",
        color: "blue", featured: true, cta: "Adquirir Plan Intermedio", path: "/contact-sales?plan=pyme",
        features: [
            "01 a 04 Tableros Eléctricos",
            "Rotulación (Leyenda) en PDF",
            "Diagrama Unifilar y Leyenda Normativa CNE",
            "Gestión de Seguridad y Licencias ITSE",
            "Firma de Ingeniero Colegiado (CIP)",
            "Servicio de Mantenimiento Preventivo",
            "Gestión Documental y Emisión de Certificados"
        ],
        limits: { empresas: 1, tableros: 4, usuarios: 5, docs: "Ilimitados" }
    },
    {
        id: "enterprise",
        name: "Plan Empresarial", badge: "Alta Exigencia", priceLabel: "Contáctenos",
        subLabel: "Industria (Más de 05 tableros / Multi-tablero)",
        description: "Cobertura completa para plantas industriales, clínicas y auditorías de alta exigencia bajo normas NFPA.",
        color: "slate", featured: false, cta: "Contactar ventas", path: "/contact-sales?plan=enterprise",
        features: [
            "Más de 05 Tableros Eléctricos",
            "Incluye todas las características del Plan Intermedio",
            "Evaluación de Puesta a Tierra y Power Quality",
            "Etiquetado NFPA 70E e Inspección Termográfica NFPA 70B",
            "Monitoreo de Consumo, CO2 y Demandas Máximas",
            "Asesoría en Seguridad Ocupacional"
        ],
        limits: { empresas: "Multi-sede", tableros: "Ilimitados", usuarios: "Ilimitados", docs: "Ilimitados" }
    }
];

const faqs: FAQItem[] = [
    { q: "¿Cómo ayuda Voltguard a mi empresa a pasar la inspección ITSE de Defensa Civil?", a: "Voltguard automatiza la generación de diagramas unifilares en formato CAD, rotula la leyenda de tableros bajo el Código Nacional de Electricidad (CNE) y coordina la validación firmada por un Ingeniero Colegiado (CIP) para responder a las observaciones municipales." },
    { q: "¿Quién realiza el trabajo técnico en campo y sube los documentos?", a: "El equipo especializado de Voltguard realiza la inspección presencial, pruebas de pozo a tierra y medición termográfica. Posteriormente, todos los planos, reportes y certificados quedan disponibles en tu panel de usuario para descarga inmediata." },
    { q: "¿Qué diferencia existe entre el Plan Básico, Intermedio y Empresarial?", a: "El Plan Básico (Gratis) permite mapear 1 tablero con leyenda PDF[cite: 1]. El Plan Intermedio cubre hasta 4 tableros, entregando diagramas, expediente ITSE y firma CIP[cite: 1]. El Plan Empresarial es para instalaciones industriales con más de 5 tableros, sumando análisis energético, termografía NFPA 70B y protocolo NFPA 70E[cite: 1]." },
];

const tableRows: {
    category?: string; label?: string; icon?: React.ElementType;
    basic: boolean | string | null; pyme: boolean | string | null; enterprise: boolean | string | null;
}[] = [
    { label: "Cantidad de tableros eléctricos", icon: Zap, basic: "01 tablero", pyme: "01 a 04 tableros", enterprise: "Más de 05 tableros" },
    { label: "Segmento recomendado", icon: Layers, basic: "Pequeño Comercio", pyme: "Comercial / Servicios", enterprise: "Industria / Multi-tablero" },
    { label: "Precio de la Licencia / Servicio", icon: FileText, basic: "Gratis", pyme: "S/ 250.00 + IGV", enterprise: "Contáctenos" },
    { category: "Entregables Normativos y Documentales", basic: null, pyme: null, enterprise: null },
    { label: "Rotulación (Leyenda) en PDF", icon: FileText, basic: true, pyme: true, enterprise: true },
    { label: "Diagrama Unifilar y Leyenda CNE", icon: FileCode, basic: false, pyme: true, enterprise: true },
    { label: "Gestión de Seguridad y Licencias ITSE", icon: FileCheck, basic: false, pyme: true, enterprise: true },
    { label: "Firma de Ingeniero Colegiado (CIP)", icon: Award, basic: false, pyme: true, enterprise: true },
    { label: "Servicio de Mantenimiento Preventivo", icon: Shield, basic: false, pyme: true, enterprise: true },
    { label: "Gestión Documental y Emisión de Certificados", icon: FileText, basic: false, pyme: true, enterprise: true },
    { category: "Ingeniería Avanzada, NFPA y Monitoreo (Plan Empresarial)", basic: null, pyme: null, enterprise: null },
    { label: "Evaluación de Sistemas de Puesta a Tierra", icon: Activity, basic: false, pyme: false, enterprise: true },
    { label: "Inspección Termográfica Infrarroja (NFPA 70B)", icon: ShieldAlert, basic: false, pyme: false, enterprise: true },
    { label: "Etiquetado de Seguridad Eléctrica (NFPA 70E)", icon: Shield, basic: false, pyme: false, enterprise: true },
    { label: "Análisis de Calidad de Energía (Power Quality)", icon: Zap, basic: false, pyme: false, enterprise: true },
    { label: "Monitoreo de Consumo, CO2 y Potencia Reactiva", icon: Activity, basic: false, pyme: false, enterprise: true },
    { label: "Asesoría en Seguridad Ocupacional (NFPA 70E)", icon: Users, basic: false, pyme: false, enterprise: true },
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

/* ─── Plan Card ──────────────────────────────────────────────────────────── */

function PlanCard({ plan, index, active }: { plan: Plan; index: number; active: boolean }) {
    const navigate = useNavigate();
    const [, setHovered] = useState(false);
    const isFeatured = plan.featured;

    return (
        <div
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
            style={{ opacity: active ? 1 : 0, transform: active ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)", transition: `opacity 0.6s ease ${index * 150}ms, transform 0.6s ease ${index * 150}ms` }}
            className={`relative rounded-3xl flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-2
                ${!isFeatured
                    ? "border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-[#0797d5]/10"
                    : "border border-[#0797d5]/40 shadow-xl shadow-[#0797d5]/15 hover:shadow-2xl hover:shadow-[#0797d5]/25"
                }`}
        >
            {/* ── HEADER ── */}
            <div className={`relative px-7 py-8 overflow-hidden ${!isFeatured ? "bg-slate-100" : "bg-gradient-to-br from-[#0797d5] to-[#05c4f7]"}`}>
                {isFeatured && (
                    <>
                        <div className="absolute inset-0 pointer-events-none opacity-10">
                            <svg width="100%" height="100%"><defs><pattern id="hgp" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs><rect width="100%" height="100%" fill="url(#hgp)" /></svg>
                        </div>
                        <div className="absolute -top-6 -right-6 size-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
                        <div className="absolute -bottom-4 -left-4 size-16 rounded-full bg-[#8ccf2f]/20 blur-lg pointer-events-none" />
                    </>
                )}
                {plan.badge && (
                    <div className="absolute top-0 right-0 overflow-hidden w-28 h-28 pointer-events-none">
                        <div className="absolute top-5 right-[-24px] rotate-45 bg-[#8ccf2f] text-white text-[9px] font-black px-8 py-1 shadow-md tracking-wide uppercase text-center">
                            {plan.badge}
                        </div>
                    </div>
                )}
                <span className={`relative z-10 block text-center text-2xl font-black tracking-tight ${!isFeatured ? "text-slate-800" : "text-white"}`}>
                    {plan.name}
                </span>
                <p className={`relative z-10 text-center text-xs mt-1 font-medium ${!isFeatured ? "text-slate-500" : "text-white/80"}`}>
                    {plan.subLabel}
                </p>
            </div>

            {/* ── BODY ── */}
            <div className="bg-white flex flex-col flex-1 px-7 pt-7 pb-7 gap-6">
                <div className="text-center py-2">
                    <div className={`text-3xl font-black tracking-tight leading-none ${!isFeatured ? "text-slate-900" : "text-[#0797d5]"}`}>
                        {plan.priceLabel}
                    </div>
                    <p className="text-xs text-slate-500 mt-3 leading-relaxed max-w-sm mx-auto">{plan.description}</p>
                </div>

                <div className="h-px w-full bg-slate-100" />

                <ul className="space-y-3 flex-1">
                    {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm group/item">
                            <span className={`mt-0.5 shrink-0 size-4 rounded-full flex items-center justify-center transition-all duration-300 group-hover/item:scale-110 ${!isFeatured ? "bg-slate-100 text-slate-600" : "bg-[#0797d5]/10 text-[#0797d5]"}`}>
                                <Check size={10} strokeWidth={3} />
                            </span>
                            <span className="text-slate-700 text-xs sm:text-sm font-medium leading-snug">{f}</span>
                        </li>
                    ))}
                </ul>

                <button
                    onClick={() => navigate(plan.path)}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group/btn
                        ${!isFeatured
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

/* ─── Comparison Table Cell Helper ───────────────────────────────────────── */

function CellValue({ val }: { val: boolean | string | null }) {
    if (val === null) return null;
    if (typeof val === "boolean") return val
        ? <Check size={17} className="text-[#0797d5] mx-auto" strokeWidth={3} />
        : <X size={16} className="text-slate-300 mx-auto" strokeWidth={2} />;
    return <span className="text-slate-700 font-bold text-xs sm:text-sm">{val}</span>;
}

/* ─── FAQ Row ────────────────────────────────────────────────────────────── */

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

            {/* Fondo decorativo */}
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
                        Licencias y Certificación ITSE
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight leading-none mb-4">
                        Planes a tu{" "}
                        <span className="bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] bg-clip-text text-transparent"
                            style={{ backgroundSize: "200% 200%", animation: "gradShift 4s ease infinite" }}>
                            medida operativa
                        </span>
                    </h1>
                    <p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
                        Adquiere una suscripción Voltguard para habilitar la emisión de expedientes ITSE, planos unifilares y firmas autorizadas de Ingeniero Colegiado (CIP).
                    </p>
                </div>

                {/* ── TARJETAS DE PLANES (3 Niveles) ── */}
                <div ref={cardsRef} className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto mb-8">
                    {plans.map((plan, i) => <PlanCard key={plan.name} plan={plan} index={i} active={cardsVisible} />)}
                </div>
                <p className="text-center text-xs text-slate-400 mb-24">
                    La descarga de entregables de ingeniería (Certificados CIP) está sujeta al plan contratado.
                </p>

                {/* ── TABLA COMPARATIVA (Basada en la imagen recibida) ── */}
                <div ref={tableRef} className="mb-24"
                    style={{ opacity: tableVisible ? 1 : 0, transform: tableVisible ? "translateY(0)" : "translateY(28px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
                    <div className="text-center lg:text-left mb-8">
                        <h2 className="text-2xl font-black text-slate-950 tracking-tight">Matriz comparativa de características y alcance</h2>
                        <p className="text-sm text-slate-500 mt-1">Revisa detalladamente las opciones del sistema Voltguard de acuerdo con la exigencia técnica de tu negocio.</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/70">
                                        <th className="p-5 text-sm font-bold text-slate-500 uppercase tracking-wider w-2/5">Características y Alcance</th>
                                        <th className="p-5 text-sm font-black text-slate-600 text-center">Plan Básico</th>
                                        <th className="p-5 text-sm font-black text-[#0797d5] text-center bg-[#0797d5]/5">Plan Intermedio</th>
                                        <th className="p-5 text-sm font-black text-slate-800 text-center">Plan Empresarial</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {tableRows.map((row, i) => {
                                        if (row.category) {
                                            return (
                                                <tr key={i} className="bg-slate-50/80">
                                                    <td className="px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-400" colSpan={4}>{row.category}</td>
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
                                                <td className="p-4 sm:p-5 text-center bg-slate-50/30"><CellValue val={row.basic} /></td>
                                                <td className="p-4 sm:p-5 text-center bg-[#0797d5]/3"><CellValue val={row.pyme} /></td>
                                                <td className="p-4 sm:p-5 text-center bg-slate-50/20"><CellValue val={row.enterprise} /></td>
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
                            Consultas Frecuentes
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Preguntas sobre Planes e ITSE</h2>
                        <p className="text-slate-500 text-sm mt-2">¿Tienes dudas sobre los entregables o la contratación de licencias? Consulta la información detallada.</p>
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
                            <h3 className="font-bold text-slate-950 text-base">¿Tienes una red de instalaciones o multi-sedes complejas?</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Estructuramos proyectos a la medida con auditorías integrales bajo normas ITSE, CNE y NFPA.</p>
                        </div>
                    </div>
                    <button onClick={() => navigate("/contact-sales")}
                        className="group inline-flex items-center gap-2 px-5 py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all duration-200 shrink-0 cursor-pointer">
                        Solicitar Asesoría Personalizada
                        <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>

            </div>
        </div>
    );
}