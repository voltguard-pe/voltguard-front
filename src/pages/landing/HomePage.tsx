import {
    Activity,
    ArrowRight,
    Building2,
    Check,
    CheckCircle2,
    ChevronDown,
    Cpu,
    FileText,
    HelpCircle,
    ShieldCheck,
    TrendingUp,
    Zap
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface Feature { title: string; description: string; icon: React.ElementType; }
interface Stat { id: string; target: number; suffix: string; label: string; }
interface Plan {
    name: string; badge?: string; priceLabel: string; subLabel: string;
    description: string; color: string; featured: boolean; features: string[];
    cta: string; path: string;
    limits: { empresas: number | string; tableros: number | string; usuarios: number | string; docs: number | string; };
}

/* ─── Data ───────────────────────────────────────────────────────────────── */

const features: Feature[] = [
    { title: "Gestión de empresas", description: "Administra empresas y separa sus tableros eléctricos con claridad y orden.", icon: Building2 },
    { title: "Control de tableros", description: "Centraliza información técnica, diagramas y estado operativo en tiempo real.", icon: Zap },
    { title: "Documentación técnica", description: "Sube certificados, termografías y diagramas unifilares de forma ordenada.", icon: FileText },
    { title: "Usuarios y permisos", description: "Gestiona administradores, superadmins y accesos seguros por rol.", icon: ShieldCheck },
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
        name: "Gratis", priceLabel: "Gratis", subLabel: "Plan de entrada",
        description: "Mapeo piloto inicial para explorar el ecosistema digital de Voltguard.",
        // color: "slate", featured: false, cta: "Comenzar gratis", path: "/auth/register?plan=free",
        color: "slate", featured: false, cta: "Comenzar gratis", path: "/auth?plan=free",
        features: ["1 Tablero Eléctrico", "Exclusivo para Tablero General (TG)", "Seguimiento de parámetros en tiempo real", "Visor digital en plataforma web", "Soporte técnico por email"],
        limits: { empresas: 1, tableros: 1, usuarios: 2, docs: 5 }
    },
    {
        name: "Pro Corporativo", badge: "Más recomendado", priceLabel: "Consulte con Ventas",
        subLabel: "Suscripción anual personalizada",
        description: "Optimizado para plantas industriales, clínicas y auditorías de alta exigencia bajo norma.",
        color: "blue", featured: true, cta: "Contactar ventas", path: "/contact-sales",
        features: ["Hasta 200 Tableros Eléctricos", "Despliegue, levantamiento e inspección presencial", "Diseño de diagramas unifilares y rotulación de circuitos", "Pruebas de aislamiento (Megado) y análisis termográfico", "Estudio de seguridad NFPA 70E y programa predictivo NFPA 70B", "Emisión de certificados de operatividad y mantenimiento", "Visualización, descarga de Etiquetas (PDF) y archivos CAD (.DWG)"],
        limits: { empresas: "Multi-sede", tableros: 200, usuarios: "∞", docs: "∞" }
    }
];

/* ─── Keyframes ─────────────────────────────────────────────────────────── */

const STYLE = `
@keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
@keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes floatReverse { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-8px) rotate(2deg)} }
@keyframes pulseRing { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.4);opacity:0} }
@keyframes scanLine { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
@keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
@keyframes blobMove { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
@keyframes electricPulse { 0%,100%{opacity:1;filter:drop-shadow(0 0 4px #0797d5)} 50%{opacity:0.5;filter:drop-shadow(0 0 12px #0797d5) drop-shadow(0 0 24px #0797d5)} }
@keyframes countBounce { 0%{transform:scale(1)} 50%{transform:scale(1.08)} 100%{transform:scale(1)} }
@keyframes gridFade { 0%,100%{opacity:0.03} 50%{opacity:0.07} }
@keyframes particleDrift { 0%{transform:translateY(0) translateX(0) scale(1);opacity:0.7} 100%{transform:translateY(-120px) translateX(20px) scale(0);opacity:0} }
@keyframes glowPulse { 0%,100%{box-shadow:0 0 20px rgba(7,151,213,0.2),0 0 40px rgba(7,151,213,0.1)} 50%{box-shadow:0 0 40px rgba(7,151,213,0.4),0 0 80px rgba(7,151,213,0.2)} }
@keyframes zap { 0%,100%{opacity:1} 25%{opacity:0.2} 75%{opacity:0.7} }
@keyframes kenBurns { 0%{transform:scale(1) translate(0,0)} 50%{transform:scale(1.06) translate(-1%,-1%)} 100%{transform:scale(1) translate(0,0)} }
@keyframes imgReveal { from{clip-path:inset(0 100% 0 0)} to{clip-path:inset(0 0% 0 0)} }
@keyframes parallaxDown { 0%{transform:translateY(-6%)} 100%{transform:translateY(6%)} }

/* 👇 AGREGA ESTA CLASE AQUÍ ABAJO 👇 */
.optimize-animated-img {
    will-change: transform;
}
`;

function InjectStyles() {
    useEffect(() => {
        const id = "voltguard-styles";
        if (document.getElementById(id)) return;
        const el = document.createElement("style");
        el.id = id; el.textContent = STYLE;
        document.head.appendChild(el);
        return () => { document.getElementById(id)?.remove(); };
    }, []);
    return null;
}

/* ─── Hooks ──────────────────────────────────────────────────────────────── */

function useInViewRepeatable(threshold = 0.15) {
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

/* ─── Decorative helpers ─────────────────────────────────────────────────── */

function BackgroundGrid() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"
                style={{ animation: "gridFade 4s ease-in-out infinite" }}>
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

function ElectricOrbit() {
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ width: 220, height: 220 }}>
            <div className="absolute inset-0 rounded-full border border-[#0797d5]/20" style={{ animation: "spinSlow 20s linear infinite" }}>
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 size-3 rounded-full bg-[#0797d5]" style={{ boxShadow: "0 0 10px #0797d5" }} />
            </div>
            <div className="absolute inset-6 rounded-full border border-[#8ccf2f]/20" style={{ animation: "spinSlow 14s linear infinite reverse" }}>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 size-2 rounded-full bg-[#8ccf2f]" style={{ boxShadow: "0 0 8px #8ccf2f" }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-12 rounded-2xl bg-gradient-to-br from-[#0797d5] to-[#05c4f7] flex items-center justify-center shadow-lg shadow-[#0797d5]/40" style={{ animation: "glowPulse 3s ease-in-out infinite" }}>
                    <Zap size={22} color="white" style={{ animation: "electricPulse 1.5s ease-in-out infinite" }} />
                </div>
            </div>
        </div>
    );
}

/* ─── Stat sub-components ────────────────────────────────────────────────── */

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

/* ─── Feature Card ───────────────────────────────────────────────────────── */

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

/* ─── FAQ ────────────────────────────────────────────────────────────────── */

interface HomeFAQItem { q: string; a: string; }
const homeFaqs: HomeFAQItem[] = [
    { q: "¿Qué tipo de documentación técnica puedo centralizar en cada tablero?", a: "Voltguard está optimizado para almacenar diagramas unifilares (PDF o imágenes), certificados de operatividad, protocolos de pruebas de pozo a tierra, reportes de mantenimiento preventivo e historiales de termografía infrarroja." },
    { q: "¿Cómo funciona el control de estado operativo en tiempo real?", a: "La plataforma te permite registrar y visualizar parámetros críticos como tensión nominal, corriente máxima, temperatura de la barra y balance de fases (A, B, C) mediante un semáforo de alertas dinámico." },
    { q: "¿Puedo segmentar los accesos si gestiono múltiples empresas o contratistas?", a: "Totalmente. Puedes definir Superadmins (control total), Administradores por empresa (solo ven las plantas vinculadas de su organización) y Técnicos o Inspectores en campo." },
    { q: "¿Qué sucede si mi personal en campo necesita revisar un diagrama desde su celular?", a: "La interfaz de Voltguard es 100% responsiva. Los operarios pueden escanear el código del tablero para abrir diagramas unifilares o revisar bitácoras técnicas de manera inmediata." }
];

function HomeFAQRow({ q, a, index }: HomeFAQItem & { index: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const { ref, inView } = useInViewRepeatable(0.1);
    return (
        <div ref={ref} className="border border-slate-200 bg-white rounded-2xl overflow-hidden hover:border-[#0797d5]/40 hover:shadow-md transition-all duration-300"
            style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.6s ease ${index * 100}ms, transform 0.6s ease ${index * 100}ms, border-color 0.3s, box-shadow 0.3s` }}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-950 hover:text-[#0797d5] transition-colors cursor-pointer group">
                <span className="text-sm sm:text-base pr-4">{q}</span>
                <div className={`shrink-0 size-7 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? "bg-[#0797d5] text-white rotate-180" : "bg-slate-100 text-slate-400 group-hover:bg-[#0797d5]/10 group-hover:text-[#0797d5]"}`}>
                    <ChevronDown size={15} />
                </div>
            </button>
            <div className={`transition-all duration-400 ease-in-out overflow-hidden ${isOpen ? "max-h-48 border-t border-slate-100" : "max-h-0"}`}>
                <p className="p-5 text-sm text-slate-500 leading-relaxed bg-slate-50/50">{a}</p>
            </div>
        </div>
    );
}

/* ─── Plan Card ──────────────────────────────────────────────────────────── */

// function PlanLimitBar({ label, value, max, color, active, delay }: { label: string; value: number | string; max: number; color: string; active: boolean; delay: number }) {
//     const isUnlimited = value === "∞";
//     const pct = isUnlimited ? 100 : typeof value === "number" ? Math.min((value / max) * 100, 100) : 0;
//     const [width, setWidth] = useState(0);
//     useEffect(() => {
//         if (active) { const t = setTimeout(() => setWidth(pct), delay); return () => clearTimeout(t); } else { setWidth(0); }
//     }, [active, pct, delay]);
//     return (
//         <div className="space-y-1">
//             <div className="flex justify-between text-xs"><span className="text-slate-500">{label}</span><span className="font-bold text-slate-700">{value === "∞" ? "Ilimitado" : value}</span></div>
//             <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
//                 <div className={`h-full rounded-full ${color} relative overflow-hidden`} style={{ width: `${width}%`, transition: active ? `width 1s cubic-bezier(0.4,0,0.2,1) ${delay}ms` : "none" }}>
//                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" style={{ animation: "shimmer 2s ease-in-out infinite" }} />
//                 </div>
//             </div>
//         </div>
//     );
// }

function PlanCard({ plan, index, active }: { plan: Plan; index: number; active: boolean }) {
    const navigate = useNavigate();
    const [hovered, setHovered] = useState(false);
    const isFree = plan.color === "slate";
    console.log(hovered)

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                opacity: active ? 1 : 0,
                transform: active ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)",
                transition: `opacity 0.6s ease ${index * 150}ms, transform 0.6s ease ${index * 150}ms`,
            }}
            className={`relative rounded-3xl flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-2
                ${isFree
                    ? "border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-[#0797d5]/10"
                    : "border border-[#0797d5]/40 shadow-xl shadow-[#0797d5]/15 hover:shadow-2xl hover:shadow-[#0797d5]/25"
                }`}
        >
            {/* ── HEADER BLOCK ───────────────────────────────────────── */}
            <div className={`relative px-7 py-8 overflow-hidden
                ${isFree
                    ? "bg-slate-100"
                    : "bg-gradient-to-br from-[#0797d5] to-[#05c4f7]"
                }`}>

                {/* Pro: subtle grid + particles inside header */}
                {!isFree && (
                    <>
                        <div className="absolute inset-0 pointer-events-none opacity-10">
                            <svg width="100%" height="100%"><defs><pattern id="hgrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs><rect width="100%" height="100%" fill="url(#hgrid)" /></svg>
                        </div>
                        <div className="absolute -top-6 -right-6 size-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
                        <div className="absolute -bottom-4 -left-4 size-16 rounded-full bg-[#8ccf2f]/20 blur-lg pointer-events-none" />
                    </>
                )}

                {/* Badge corner ribbon */}
                {plan.badge && (
                    <div className="absolute top-0 right-0 overflow-hidden w-24 h-24 pointer-events-none">
                        <div className="absolute top-4 right-[-22px] rotate-45 bg-[#8ccf2f] text-white text-[10px] font-black px-8 py-1 shadow-md tracking-wide uppercase">
                            Popular
                        </div>
                    </div>
                )}

                <span className={`relative z-10 block text-center text-2xl font-black tracking-tight
                    ${isFree ? "text-slate-600" : "text-white"}`}>
                    {plan.name}
                </span>

                {/* {!isFree && (
                    <p className="relative z-10 text-center text-white/70 text-xs mt-1 font-medium">
                        {plan.subLabel}
                    </p>
                )} */}
            </div>

            {/* ── BODY ───────────────────────────────────────────────── */}
            <div className="bg-white flex flex-col flex-1 px-7 pt-7 pb-7 gap-6">

                {/* Price */}
                {/* <div className="text-center py-2">
                    <div className={`text-4xl font-black tracking-tight leading-none
                        ${isFree ? "text-slate-900" : "text-[#0797d5]"}`}>
                        {isFree ? "S/. 0" : "Consulte"}
                        <span className="text-sm font-medium text-slate-400 tracking-normal ms-2">PEN /año</span>
                    </div>
                    <span className="text-xs text-slate-400 mt-2 block font-medium">
                        {isFree ? "Sin tarjetas de crédito" : "Suscripción anual personalizada"}
                    </span>
                    <p className="text-sm text-slate-500 mt-4 leading-relaxed max-w-sm mx-auto">{plan.description}</p>
                </div> */}

                {/* Divider */}
                {/* <div className={`h-px w-full ${isFree ? "bg-slate-100" : "bg-[#0797d5]/10"}`} /> */}

                {/* Feature list — items sin acceso van en gris tachado estilo FLIR */}
                <ul className="space-y-3 flex-1">
                    {plan.features.map((f, fi) => {
                        // Los últimos 2 items del Free los mostramos "deshabilitados"
                        const disabled = isFree && fi >= plan.features.length - 0;
                        console.log(disabled)
                        return (
                            <li key={f} className="flex items-start gap-2.5 text-sm group/item">
                                <span className={`mt-0.5 shrink-0 size-4 rounded-full flex items-center justify-center transition-all duration-300 group-hover/item:scale-110
                                    ${isFree ? "bg-slate-100 text-slate-400" : "bg-[#0797d5]/10 text-[#0797d5]"}`}>
                                    <Check size={10} strokeWidth={3} />
                                </span>
                                <span className={isFree ? "text-slate-600" : "text-slate-700 font-medium"}>
                                    {f}
                                </span>
                            </li>
                        );
                    })}

                    {/* Pro-only locked items shown greyed on Free card */}
                    {isFree && (
                        <>
                            {["Diagramas unifilares CAD (.DWG)", "Análisis termográfico avanzado", "Certificados NFPA 70E / 70B"].map(locked => (
                                <li key={locked} className="flex items-start gap-2.5 text-sm opacity-40 select-none">
                                    <span className="mt-0.5 shrink-0 size-4 rounded-full flex items-center justify-center bg-slate-100 text-slate-300">
                                        <Check size={10} strokeWidth={3} />
                                    </span>
                                    <span className="text-slate-400 line-through">{locked}</span>
                                </li>
                            ))}
                        </>
                    )}
                </ul>

                {/* CTA */}
                <button
                    onClick={() => navigate(plan.path)}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-300
                        hover:-translate-y-0.5 cursor-pointer relative overflow-hidden group/btn
                        ${isFree
                            ? "border-2 border-slate-300 hover:border-[#0797d5] bg-white text-slate-800 hover:text-[#0797d5] hover:shadow-md"
                            : "bg-gradient-to-r from-[#0797d5] to-[#05c4f7] hover:from-[#087fb3] hover:to-[#0797d5] text-white hover:shadow-xl hover:shadow-[#0797d5]/40"
                        }`}
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                        -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500 pointer-events-none" />
                    {plan.cta}
                </button>
            </div>
        </div>
    );
}

/* ─── AI Badge & Widgets ─────────────────────────────────────────────────── */

function AIBadge() {
    const [frame, setFrame] = useState(0);
    useEffect(() => { const t = setInterval(() => setFrame(f => (f + 1) % 4), 600); return () => clearInterval(t); }, []);
    const dots = "·".repeat(frame + 1).padEnd(4, " ");
    return (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#8ccf2f]/30 bg-[#8ccf2f]/8 text-xs font-bold text-[#5a8c1a] mb-3">
            <Cpu size={12} className="text-[#8ccf2f]" style={{ animation: "zap 1.2s ease-in-out infinite" }} />
            IA Integrada con OpenAI {dots}
        </div>
    );
}

function LiveVoltageWidget() {
    const [values, setValues] = useState([220, 219, 221, 220, 218, 222]);
    useEffect(() => { const t = setInterval(() => setValues(v => [...v.slice(1), 218 + Math.round(Math.random() * 6)]), 800); return () => clearInterval(t); }, []);
    const max = 225, min = 215;
    const pts = values.map((v, i) => { const x = (i / (values.length - 1)) * 120; const y = 30 - ((v - min) / (max - min)) * 24; return `${x},${y}`; }).join(" ");
    return (
        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-lg min-w-[160px]" style={{ animation: "float 5s ease-in-out 0.8s infinite" }}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Voltaje L1</span>
                <span className="size-1.5 rounded-full bg-[#8ccf2f]" style={{ animation: "pulseRing 1.5s ease-out infinite", boxShadow: "0 0 6px #8ccf2f" }} />
            </div>
            <div className="flex items-end gap-1.5 mb-1">
                <span className="text-xl font-black text-slate-950 tabular-nums" style={{ animation: "countBounce 0.4s ease" }}>{values[values.length - 1]}</span>
                <span className="text-xs text-slate-400 pb-0.5 font-semibold">V</span>
            </div>
            <svg width="120" height="32" viewBox="0 0 120 32">
                <defs><linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#0797d5" /><stop offset="100%" stopColor="#8ccf2f" /></linearGradient></defs>
                <polyline points={pts} fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {values.map((v, i) => { const x = (i / (values.length - 1)) * 120; const y = 30 - ((v - min) / (max - min)) * 24; return i === values.length - 1 ? <circle key={i} cx={x} cy={y} r="3" fill="#8ccf2f" style={{ filter: "drop-shadow(0 0 4px #8ccf2f)" }} /> : null; })}
            </svg>
        </div>
    );
}

/* ─── Scroll Progress ────────────────────────────────────────────────────── */

function ScrollProgress() {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        const h = () => { const t = document.documentElement.scrollHeight - window.innerHeight; setProgress(t > 0 ? (window.scrollY / t) * 100 : 0); };
        window.addEventListener("scroll", h, { passive: true });
        return () => window.removeEventListener("scroll", h);
    }, []);
    return <div className="fixed top-0 left-0 right-0 z-50 h-0.5"><div className="h-full bg-gradient-to-r from-[#0797d5] via-[#05c4f7] to-[#8ccf2f]" style={{ width: `${progress}%`, transition: "width 0.1s linear" }} /></div>;
}

/* ─── Main ───────────────────────────────────────────────────────────────── */

export default function HomePage() {
    const navigate = useNavigate();

    const { ref: heroCardRef, inView: heroCardVisible } = useInViewRepeatable(0.2);
    const { ref: heroStatsRef, inView: heroStatsVisible } = useInViewRepeatable(0.3);
    const { ref: bannerRef, inView: bannerVisible } = useInViewRepeatable(0.25);
    const { ref: ctaRef, inView: ctaVisible } = useInViewRepeatable(0.15);
    const { ref: featHeadRef, inView: featHeadVisible } = useInViewRepeatable(0.15);
    const { ref: pricingRef, inView: pricingVisible } = useInViewRepeatable(0.1);
    const { ref: pricingHeadRef, inView: pricingHeadVisible } = useInViewRepeatable(0.15);
    const { ref: homeFaqHeadRef, inView: homeFaqHeadVisible } = useInViewRepeatable(0.15);
    const { ref: normHeadRef, inView: normHeadVisible } = useInViewRepeatable(0.15);
    const { ref: testimonialRef, inView: testimonialVisible } = useInViewRepeatable(0.15);

    const [dotScale, setDotScale] = useState(1);
    useEffect(() => { const t = setInterval(() => setDotScale(s => s === 1 ? 0.6 : 1), 900); return () => clearInterval(t); }, []);

    const scrollToFeatures = useCallback(() => {
        document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
    }, []);

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
                <div className="absolute bottom-0 left-1/3 size-64 rounded-full bg-[#05c4f7]/8 blur-3xl pointer-events-none" style={{ animation: "blobMove 12s ease-in-out 4s infinite" }} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    <div style={{ animation: "fadeUp 0.6s ease both" }}>
                        <div className="flex flex-col items-start gap-3 mb-6">
                            <AIBadge />
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#0797d5]/20 bg-[#0797d5]/5 text-sm font-semibold text-[#0797d5]" style={{ animation: "fadeUp 0.5s ease 0.1s both" }}>
                                <span className="size-2 rounded-full bg-[#8ccf2f] relative" style={{ transform: `scale(${dotScale})`, transition: "transform 0.4s ease" }}>
                                    <span className="absolute inset-[-4px] rounded-full border-2 border-[#8ccf2f] animate-ping opacity-60" />
                                </span>
                                Plataforma inteligente de gestión eléctrica
                            </div>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.06]" style={{ animation: "fadeUp 0.6s ease 0.15s both" }}>
                            Gestiona tableros<br />eléctricos con{" "}
                            <span className="bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] bg-clip-text text-transparent" style={{ backgroundSize: "200% 200%", animation: "gradShift 4s ease infinite" }}>Voltguard</span>
                        </h1>
                        <p className="mt-5 text-lg text-slate-600 leading-8 max-w-xl" style={{ animation: "fadeUp 0.6s ease 0.25s both" }}>
                            Centraliza empresas, tableros, diagramas, usuarios, documentos y reportes técnicos en una sola plataforma moderna y profesional.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-3" style={{ animation: "fadeUp 0.6s ease 0.35s both" }}>
                            <button onClick={() => navigate("/auth")} className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#0797d5] to-[#05c4f7] hover:from-[#087fb3] hover:to-[#0797d5] text-white font-bold text-sm rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0797d5]/40 relative overflow-hidden cursor-pointer">
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                                Ingresar al sistema <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform duration-300" />
                            </button>
                            <button onClick={scrollToFeatures} className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 hover:border-[#0797d5]/50 text-slate-700 hover:text-[#0797d5] font-bold text-sm rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#0797d5]/10 cursor-pointer">
                                <TrendingUp size={16} className="group-hover:text-[#0797d5] transition-colors" />
                                Ver funcionalidades
                            </button>
                        </div>
                        <div ref={heroStatsRef} className="mt-8 flex items-center gap-6" style={{ animation: "fadeUp 0.6s ease 0.45s both" }}>
                            {heroStats.map((s, i) => (
                                <div key={s.id} className="flex items-center gap-6">
                                    <AnimatedStat {...s} active={heroStatsVisible} duration={900 + i * 200} />
                                    {i < heroStats.length - 1 && <div className="w-px h-8 bg-gradient-to-b from-transparent via-slate-200 to-transparent" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div ref={heroCardRef} className="relative" style={{ opacity: heroCardVisible ? 1 : 0, transform: heroCardVisible ? "translateX(0)" : "translateX(40px)", transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s" }}>
                        <div className="absolute -top-12 -right-12 pointer-events-none opacity-50"><ElectricOrbit /></div>
                        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/80 hover:shadow-[#0797d5]/20 transition-shadow duration-500" style={{ animation: "float 5s ease-in-out infinite" }}>
                            <img src="/hero-technician2.webp" alt="Ingeniero realizando inspección eléctrica" className="rounded-3xl object-cover h-[520px] w-full" />
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-[#0797d5]/10 via-transparent to-transparent pointer-events-none" />
                        </div>
                        <div className="absolute -top-4 -right-3 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-xl hover:shadow-[#0797d5]/20 hover:border-[#0797d5]/30 hover:scale-105 transition-all duration-300 cursor-default" style={{ animation: "float 4s ease-in-out 0.5s infinite" }}>
                            <div className="text-xl font-black text-[#0797d5]" style={{ animation: "electricPulse 2s ease-in-out infinite" }}>NFPA</div>
                            <div className="text-xs text-slate-500 mt-0.5">70E · 70B</div>
                        </div>
                        <div className="absolute -bottom-4 -left-3" style={{ animation: "float 6s ease-in-out 1s infinite" }}><LiveVoltageWidget /></div>
                        <div className="absolute top-0 -left-4 -translate-y-1/2 bg-gradient-to-r from-[#0797d5] to-[#05c4f7] text-white rounded-2xl px-3 py-2 shadow-lg shadow-[#0797d5]/30" style={{ animation: "floatReverse 5s ease-in-out 2s infinite" }}>
                            <div className="flex items-center gap-1.5 text-xs font-bold"><Activity size={12} style={{ animation: "zap 1s ease-in-out infinite" }} />IA Activa</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SOCIAL PROOF PHOTO STRIP ─────────────────────────────────── */}
            {/* Horizontal strip of 3 field photos with overlay labels */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { src: "/specialized_engineers_home.webp", label: "Inspección en campo", sub: "Levantamiento presencial" },
                        { src: "/thermography_home.webp", label: "Análisis termográfico", sub: "Cámara infrarroja FLIR" },
                        { src: "/certification_nfpa_home.jpeg", label: "Certificación NFPA", sub: "Documentación normativa" },
                    ].map((item, i) => (
                        <div key={i} className="relative rounded-2xl overflow-hidden group cursor-default"
                            style={{ height: 200, opacity: 0, animation: `fadeUp 0.6s ease ${0.15 + i * 0.15}s forwards` }}>
                            <img src={item.src} alt={item.label}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                style={{ animation: "kenBurns 12s ease-in-out infinite" }} />
                            {/* dark overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                            {/* colored top accent */}
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0797d5] to-[#8ccf2f]" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <p className="text-white font-bold text-sm leading-tight">{item.label}</p>
                                <p className="text-white/60 text-xs mt-0.5">{item.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CUMPLIMIENTO NORMATIVO (with bg image) ───────────────────── */}
            <section id="standards" className="relative overflow-hidden py-24">
                {/* full-width background image */}
                <div className="absolute inset-0 pointer-events-none">
                    <img src="/standards-bg.jpg" alt=""
                        className="w-full h-full object-cover object-center"
                        style={{ animation: "kenBurns 18s ease-in-out infinite" }} />
                    <div className="absolute inset-0 bg-slate-50/92" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div ref={normHeadRef} style={{ opacity: normHeadVisible ? 1 : 0, transform: normHeadVisible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.65s ease, transform 0.65s ease" }} className="text-center mb-14">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#0797d5] mb-3">Ingeniería Certificada</p>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">Cumplimiento de estándares internacionales</h2>
                        <p className="mt-4 text-slate-500 max-w-2xl mx-auto leading-7">Nuestros estudios, inspecciones y reportes técnicos se desarrollan bajo estándares reconocidos internacionalmente para garantizar seguridad, confiabilidad y trazabilidad.</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        {[
                            { img: "/nfpa70e.png", alt: "NFPA 70E", badge: "NFPA 70E", badgeColor: "bg-blue-50 text-[#0797d5]", title: "Seguridad Eléctrica en el Trabajo", desc: "Evaluación de riesgos por choque y arco eléctrico, definición de límites de aproximación y etiquetado de seguridad para la protección del personal.", delay: "150ms", accentColor: "#0797d5" },
                            { img: "/nfpa70b.png", alt: "NFPA 70B", badge: "NFPA 70B", badgeColor: "bg-green-50 text-green-700", title: "Mantenimiento Eléctrico", desc: "Programa de mantenimiento basado en inspecciones, pruebas, termografía y análisis de condición para mejorar la confiabilidad y disponibilidad de los equipos eléctricos.", delay: "250ms", accentColor: "#8ccf2f" }
                        ].map(item => (
                            <div key={item.alt} className="group bg-white/90 backdrop-blur-sm border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-[#0797d5]/30 transition-all duration-400 relative overflow-hidden"
                                style={{ opacity: normHeadVisible ? 1 : 0, transform: normHeadVisible ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s ease", transitionDelay: item.delay }}>
                                <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500" style={{ background: `linear-gradient(to right, ${item.accentColor}, transparent)` }} />
                                <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `${item.accentColor}15` }} />
                                <div className="flex items-start gap-5 relative z-10">
                                    <img src={item.img} alt={item.alt} className="w-16 h-16 object-contain shrink-0 group-hover:scale-110 transition-transform duration-300" />
                                    <div>
                                        <span className={`inline-flex items-center rounded-full ${item.badgeColor} text-xs font-semibold px-3 py-1`}>{item.badge}</span>
                                        <h3 className="mt-3 text-xl font-bold text-slate-950 group-hover:text-[#0797d5] transition-colors duration-300">{item.title}</h3>
                                        <p className="mt-3 text-slate-600 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ─────────────────────────────────────────────────── */}
            <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-20 right-10 size-48 rounded-full bg-[#0797d5]/4 blur-2xl" style={{ animation: "blobMove 9s ease-in-out infinite" }} />
                </div>
                <div ref={featHeadRef} style={{ opacity: featHeadVisible ? 1 : 0, transform: featHeadVisible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.65s ease, transform 0.65s ease" }} className="text-center mb-14 relative z-10">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#0797d5] mb-3">Funcionalidades</p>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">Todo lo que necesitas para la gestión eléctrica</h2>
                    <p className="mt-4 text-slate-500 max-w-xl mx-auto leading-7">Diseñado para empresas que necesitan control técnico, documentación y trazabilidad.</p>
                </div>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 relative z-10">
                    {features.map((f, i) => <FeatureCard key={f.title} feature={f} index={i} />)}
                </div>
            </section>

            {/* ── TEAM IN ACTION — split image + text ──────────────────────── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/80">
                    {/* image side */}
                    <div className="relative min-h-[380px]">
                        <img src="/inspection_home.webp" alt="Equipo Voltguard en planta industrial"
                            decoding="async"
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover optimize-animated-img" // <-- AQUÍ
                            style={{ animation: "kenBurns 15s ease-in-out infinite" }} />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/60" />
                        {/* floating stat chip */}
                        <div className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3" style={{ animation: "float 5s ease-in-out infinite" }}>
                            <p className="text-white/70 text-xs font-semibold">Inspecciones completadas</p>
                            <p className="text-white text-2xl font-black mt-0.5">+1,200 <span className="text-[#8ccf2f] text-sm">este año</span></p>
                        </div>
                    </div>
                    {/* text side */}
                    <div className="bg-slate-900 p-10 lg:p-14 flex flex-col justify-center relative overflow-hidden">
                        <BackgroundGrid />
                        <div className="absolute -top-16 -right-16 size-48 rounded-full bg-[#0797d5]/20 blur-3xl" style={{ animation: "blobMove 8s ease-in-out infinite" }} />
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#8ccf2f]/15 border border-[#8ccf2f]/30 text-[#8ccf2f] text-xs font-bold mb-6">
                                <Cpu size={12} style={{ animation: "zap 1.2s ease-in-out infinite" }} />
                                Nuestro equipo técnico
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                                Ingenieros especializados que respaldan cada inspección
                            </h2>
                            <p className="mt-4 text-white/60 text-sm leading-7">
                                Nuestro personal certificado opera bajo protocolos NFPA 70E y 70B, garantizando seguridad, trazabilidad y cumplimiento normativo en cada visita de campo.
                            </p>
                            <ul className="mt-6 space-y-3">
                                {["Equipados con cámaras termográficas FLIR", "Megómetros y analizadores de calidad de energía", "EPP categoría IV para arco eléctrico"].map((item, i) => (
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

            {/* ── AI HIGHLIGHT STRIP ───────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 relative overflow-hidden">
                    <FloatingParticles count={6} />
                    <div className="absolute inset-0 pointer-events-none"><BackgroundGrid /></div>
                    <div className="absolute -top-16 left-1/4 size-48 rounded-full bg-[#0797d5]/20 blur-3xl" />
                    <div className="absolute -bottom-16 right-1/4 size-48 rounded-full bg-[#8ccf2f]/15 blur-3xl" />
                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 justify-between">
                        <div className="flex items-center gap-5">
                            <div className="size-14 rounded-2xl bg-gradient-to-br from-[#0797d5] to-[#05c4f7] flex items-center justify-center shrink-0" style={{ animation: "glowPulse 3s ease-in-out infinite" }}>
                                <Cpu size={26} color="white" style={{ animation: "electricPulse 1.5s ease-in-out infinite" }} />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-xl">Potenciado por Inteligencia Artificial</h3>
                                <p className="text-white/60 text-sm mt-1">OpenAI integrado para análisis predictivo, diagnósticos automáticos y reportes inteligentes.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 shrink-0 flex-wrap justify-center">
                            {["Diagnóstico IA", "Reportes auto", "Alertas predictivas"].map((tag, i) => (
                                <span key={tag} className="px-3 py-1.5 rounded-full border border-[#0797d5]/30 bg-[#0797d5]/10 text-[#05c4f7] text-xs font-bold"
                                    style={{ animation: `fadeUp 0.5s ease ${0.2 + i * 0.1}s both`, boxShadow: "0 0 12px rgba(7,151,213,0.2)" }}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── STATS BANNER (with staff photo bg) ───────────────────────── */}
            <div ref={bannerRef} className="relative overflow-hidden">
                {/* background photo */}
                <img src="/stats-bg-staff.jpg" alt=""
                    className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                    style={{ animation: "kenBurns 20s ease-in-out infinite" }} />
                {/* overlay: brand gradient on top of photo */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0797d5]/92 to-[#05c4f7]/92" />
                <FloatingParticles count={8} />
                <div className="absolute -top-20 -right-20 size-72 rounded-full bg-white/5 pointer-events-none" style={{ animation: "spinSlow 25s linear infinite" }} />
                <div className="absolute -bottom-16 left-1/4 size-48 rounded-full bg-[#8ccf2f]/15 pointer-events-none" style={{ animation: "blobMove 8s ease-in-out infinite" }} />
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                    <div className="absolute top-0 left-0 right-0 h-px bg-white" style={{ animation: "scanLine 3s linear infinite" }} />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {bannerStats.map((s, i) => <BannerStat key={s.id} {...s} active={bannerVisible} duration={1000 + i * 200} />)}
                </div>
            </div>

            {/* ── FIELD TESTIMONIAL — full-bleed photo ─────────────────────── */}
            <section ref={testimonialRef} className="relative overflow-hidden py-28">
                <img src="/section_caso_uso_home2.webp" alt=""
                    className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                    style={{ animation: "kenBurns 22s ease-in-out infinite" }} />
                {/* heavy dark overlay for readability */}
                <div className="absolute inset-0 bg-slate-950/75" />
                {/* top/bottom gradient fades */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50/20 via-transparent to-slate-50/30 pointer-events-none" />

                <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center"
                    style={{ opacity: testimonialVisible ? 1 : 0, transform: testimonialVisible ? "translateY(0)" : "translateY(32px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0797d5]/20 border border-[#0797d5]/40 text-[#05c4f7] text-xs font-bold mb-8">
                        <Activity size={12} style={{ animation: "zap 1.5s ease-in-out infinite" }} />
                        Caso de uso real
                    </div>
                    <blockquote className="text-2xl sm:text-3xl font-black text-white leading-snug">
                        "Antes tardábamos días en ubicar los certificados de un tablero. Con Voltguard lo hacemos en segundos desde el celular."
                    </blockquote>
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <img src="/avatar-engineer.png" alt="Ingeniero de planta"
                            className="size-12 rounded-full object-cover border-2 border-[#0797d5] shadow-lg shadow-[#0797d5]/40" />
                        <div className="text-left">
                            <p className="text-white font-bold text-sm">Jefe de Mantenimiento Eléctrico</p>
                            <p className="text-white/50 text-xs mt-0.5">Planta Industrial — Lima, Perú</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PRICING ──────────────────────────────────────────────────── */}
            <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 size-96 rounded-full bg-[#0797d5]/5 blur-3xl pointer-events-none" style={{ animation: "blobMove 10s ease-in-out infinite" }} />
                <div ref={pricingHeadRef} style={{ opacity: pricingHeadVisible ? 1 : 0, transform: pricingHeadVisible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.65s ease, transform 0.65s ease" }} className="text-center mb-12 relative z-10">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#0797d5] mb-3">Dimensionamiento del Servicio</p>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">Planes a tu medida operativa</h2>
                    <p className="mt-4 text-slate-500 max-w-2xl mx-auto leading-7 text-sm sm:text-base">Prueba la plataforma de manera autónoma con el plan inicial o implementa Voltguard de forma integral en toda tu organización corporativa con la asistencia experta de nuestros ingenieros especialistas.</p>
                </div>
                <div ref={pricingRef} className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto relative z-10">
                    {plans.map((plan, i) => <PlanCard key={plan.name} plan={plan} index={i} active={pricingVisible} />)}
                </div>
                <p className="text-center text-xs text-slate-400 mt-8 relative z-10">La descarga técnica (Etiquetas PDF o Archivos CAD originales) se habilita en tu consola interna basándose estrictamente en el plan corporativo contratado.</p>
            </section>

            {/* ── FAQs ─────────────────────────────────────────────────────── */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div ref={homeFaqHeadRef} className="text-center mb-10" style={{ opacity: homeFaqHeadVisible ? 1 : 0, transform: homeFaqHeadVisible ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.65s ease, transform 0.65s ease" }}>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0797d5]/8 border border-[#0797d5]/20 text-[#0797d5] text-xs font-bold mb-4">
                        <HelpCircle size={13} style={{ animation: "zap 2s ease-in-out infinite" }} />
                        Consultas del Sistema
                    </div>
                    <h2 className="text-3xl font-black text-slate-950 tracking-tight">Preguntas Frecuentes sobre la plataforma</h2>
                    <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto leading-relaxed">Resuelve tus dudas técnicas sobre la gestión, los módulos operativos y el control de accesos en Voltguard.</p>
                </div>
                <div className="space-y-3">
                    {homeFaqs.map((faq, i) => <HomeFAQRow key={i} {...faq} index={i} />)}
                </div>
            </section>

            {/* ── CTA (with staff bg) ───────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div ref={ctaRef} style={{ opacity: ctaVisible ? 1 : 0, transform: ctaVisible ? "translateY(0)" : "translateY(32px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}
                    className="relative rounded-3xl overflow-hidden">
                    {/* background photo */}
                    <img src="/cta-staff-bg.jpg" alt=""
                        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                        style={{ animation: "kenBurns 18s ease-in-out infinite" }} />
                    {/* overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/96 via-slate-900/90 to-slate-800/80" />
                    <BackgroundGrid />
                    <FloatingParticles count={6} />
                    <div className="absolute -top-24 -right-24 size-80 rounded-full bg-[#0797d5]/25 blur-3xl pointer-events-none" style={{ animation: "blobMove 7s ease-in-out infinite" }} />
                    <div className="absolute -bottom-20 left-1/3 size-64 rounded-full bg-[#8ccf2f]/15 blur-3xl pointer-events-none" style={{ animation: "blobMove 9s ease-in-out 3s infinite reverse" }} />
                    <div className="absolute top-8 right-8 pointer-events-none opacity-30">
                        <div className="size-24 rounded-full border border-[#0797d5]/50" style={{ animation: "spinSlow 15s linear infinite" }}>
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 size-2 rounded-full bg-[#0797d5]" />
                        </div>
                    </div>
                    <div className="relative z-10 p-10 lg:p-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#8ccf2f]/15 border border-[#8ccf2f]/30 text-[#8ccf2f] text-xs font-bold mb-5">
                                <CheckCircle2 size={13} />Plataforma operativa
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                                Lleva el control total de tus<br />
                                <span className="bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] bg-clip-text text-transparent" style={{ backgroundSize: "200% 200%", animation: "gradShift 4s ease infinite" }}>tableros eléctricos</span>
                            </h2>
                            <p className="mt-4 text-white/60 text-sm leading-7 max-w-lg">Gestiona empresas, usuarios, documentos y tableros desde una sola plataforma moderna y centralizada.</p>
                        </div>
                        <button onClick={() => navigate("/login")} className="group shrink-0 inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-white to-slate-50 hover:from-slate-50 hover:to-white text-slate-900 font-extrabold text-sm rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-black/40 relative overflow-hidden">
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0797d5]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-600 pointer-events-none" />
                            Comenzar ahora <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
