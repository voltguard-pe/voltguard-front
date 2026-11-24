import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Award,
    Check,
    CheckCircle2,
    ChevronDown,
    Cpu,
    Download,
    HelpCircle,
    MessageSquare,
    QrCode,
    ShieldCheck,
    Smartphone,
    Zap
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HOME_CONTENT, type FAQItem, type Plan, type Stat, type Story } from "../../data/HomeContent.ts";

/* ─── Styles & Animations ────────────────────────────────────────────────── */

const STYLE = `
@keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
@keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
@keyframes gridFade { 0%,100%{opacity:0.03} 50%{opacity:0.07} }
@keyframes blobMove { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
@keyframes kenBurns { 0%{transform:scale(1) translate(0,0)} 50%{transform:scale(1.05) translate(-1%,-1%)} 100%{transform:scale(1) translate(0,0)} }
`;

function InjectStyles() {
    useEffect(() => {
        const id = "voltguard-unified-styles";
        if (document.getElementById(id)) return;
        const el = document.createElement("style");
        el.id = id;
        el.textContent = STYLE;
        document.head.appendChild(el);
        return () => {
            document.getElementById(id)?.remove();
        };
    }, []);
    return null;
}

/* ─── Hooks ──────────────────────────────────────────────────────────────── */

function usePageMeta(title: string, description: string) {
    useEffect(() => {
        document.title = title;
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
            meta = document.createElement("meta");
            meta.setAttribute("name", "description");
            document.head.appendChild(meta);
        }
        meta.setAttribute("content", description);
    }, [title, description]);
}

function useInViewRepeatable(threshold = 0.12) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold });
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, inView };
}

function useCountUp(target: number, prefix = "", suffix = "", active: boolean, duration = 1200) {
    const [display, setDisplay] = useState(`${prefix}0${suffix}`);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!active) {
            setDisplay(`${prefix}0${suffix}`);
            return;
        }
        let start = 0;
        const inc = target / (duration / 16);
        timerRef.current = setInterval(() => {
            start = Math.min(start + inc, target);
            setDisplay(`${prefix}${Math.round(start).toLocaleString("en-US")}${suffix}`);
            if (start >= target && timerRef.current) clearInterval(timerRef.current);
        }, 16);
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [active, target, prefix, suffix, duration]);
    return display;
}

/* ─── Elementos Decorativos & Previews Reales de VoltGuard ───────────────── */

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

function AnimatedStat({ target, prefix, suffix, label, active, duration }: Stat & { active: boolean; duration?: number }) {
    const display = useCountUp(target, prefix, suffix, active, duration);
    return (
        <div className="flex flex-col justify-between h-full">
            <span className="block text-2xl sm:text-3xl font-black text-slate-950 tracking-tight tabular-nums group-hover:text-[#0797d5] transition-colors">
                {display}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">{label}</span>
        </div>
    );
}

function QrBoardPreview() {
    const realPhoto = HOME_CONTENT.realCaptures.qrBoardPhoto;

    if (realPhoto) {
        return (
            <figure className="bg-slate-900 rounded-3xl overflow-hidden text-white border border-slate-800 shadow-xl flex flex-col justify-between w-full">
                <img
                    src={realPhoto}
                    alt="Etiqueta QR VoltGuard adherida en puerta de tablero eléctrico"
                    loading="lazy"
                    className="w-full h-[300px] sm:h-[340px] object-cover"
                />
                <figcaption className="p-5 text-xs text-slate-300 leading-relaxed">
                    Cada tablero recibe su placa QR de autenticidad adherida en puerta para consulta instantánea en auditorías ITSE y mantenimiento.
                </figcaption>
            </figure>
        );
    }

    return (
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl flex flex-col justify-between w-full relative overflow-hidden">
            <div className="absolute -right-12 -top-12 size-44 rounded-full bg-[#0797d5]/15 blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#8ccf2f]/20 text-[#8ccf2f]">
                    <QrCode size={13} /> Etiqueta Física en Planta
                </span>
                <span className="text-xs text-slate-400 font-mono">TG-01 · 380/220V</span>
            </div>

            <div className="bg-white text-slate-950 rounded-2xl p-5 border-2 border-[#0797d5] shadow-lg">
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                        <div className="size-6 rounded-md bg-[#0797d5] flex items-center justify-center text-white shrink-0">
                            <Zap size={14} />
                        </div>
                        <span className="font-black text-sm tracking-tight">VoltGuard · Gemelo Digital</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 shrink-0">
                        V°B° CIP ACTIVO
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="bg-slate-100 rounded-xl p-3 flex flex-col items-center justify-center border border-slate-200 shrink-0">
                        <QrCode size={68} className="text-slate-950" strokeWidth={1.75} />
                        <span className="text-[9px] font-mono text-slate-500 mt-1">ID: VG-TG01</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                        <p className="font-black text-slate-950 text-sm">TABLERO GENERAL (TG-01)</p>
                        <p className="text-slate-600">
                            <strong className="text-slate-800">Unifilar & Leyenda:</strong> Actualizado CNE
                        </p>
                        <p className="text-slate-600">
                            <strong className="text-slate-800">Última Termografía:</strong> Sin anomalías (NFPA 70B)
                        </p>
                        <p className="text-slate-600">
                            <strong className="text-slate-800">Calidad de Energía:</strong> Clase A · IEC 61000-4-30
                        </p>
                    </div>
                </div>
            </div>

            <p className="mt-5 text-xs text-slate-400 leading-relaxed">
                Cada tablero recibe su placa QR de autenticidad adherida en puerta para consulta instantánea en auditorías ITSE y mantenimiento.
            </p>
        </div>
    );
}

function ClinicalHistorySection() {
    const navigate = useNavigate();
    const { iticScreenshot, thduScreenshot } = HOME_CONTENT.realCaptures;

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-12">
                <div>
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0797d5]/10 text-[#0797d5] font-semibold text-xs tracking-widest uppercase mb-3 border border-[#0797d5]/20">
                        La Historia Clínica
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                        Así se ve tu instalación en VoltGuard
                    </h2>
                    <p className="mt-2 text-slate-600 text-base max-w-2xl">
                        Diagnóstico real bajo estándares IEEE 519, NTCSE y NFPA 70B. Sin cajas negras ni interpretaciones ambiguas.
                    </p>
                </div>

                <button
                    onClick={() => navigate("/auth")}
                    className="self-start lg:self-end inline-flex items-center gap-2 text-sm font-bold text-[#0797d5] hover:text-[#0684bd] cursor-pointer"
                >
                    Explorar plataforma completa <ArrowRight size={16} />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                {/* Tarjeta 1: Curva ITIC */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow flex flex-col justify-between">
                    <div>
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-2">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                                Curva de Tolerancia ITIC (CBEMA)
                            </span>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                En rango normativo
                            </span>
                        </div>

                        <div className="p-6">
                            {iticScreenshot ? (
                                <img
                                    src={iticScreenshot}
                                    alt="Captura real de Curva de Tolerancia ITIC en VoltGuard"
                                    loading="lazy"
                                    className="w-full h-auto rounded-xl border border-slate-200"
                                />
                            ) : (
                                <>
                                    <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500 mb-3">
                                        <span className="inline-flex items-center gap-1.5">
                                            <span className="size-2.5 rounded-full bg-rose-500" /> Línea L1
                                        </span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <span className="size-2.5 rounded-full bg-emerald-500" /> Línea L2
                                        </span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <span className="size-2.5 rounded-full bg-[#0797d5]" /> Línea L3
                                        </span>
                                    </div>

                                    <svg viewBox="0 0 480 230" className="w-full h-auto rounded-xl border border-slate-200 bg-slate-50">
                                        <polygon points="110,15 465,15 465,120 210,120 150,95 110,95" fill="#fed7aa" opacity="0.65" />
                                        <polygon points="175,215 465,215 465,140 245,140 205,155 175,155" fill="#fef08a" opacity="0.7" />
                                        <polyline points="110,15 110,95 150,95 210,120 465,120" fill="none" stroke="#0f172a" strokeWidth="1.8" />
                                        <polyline points="175,215 175,155 205,155 245,140 465,140" fill="none" stroke="#0f172a" strokeWidth="1.8" />
                                        <line x1="45" y1="130" x2="465" y2="130" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth="1" />
                                        <circle cx="315" cy="133" r="3.5" fill="#0797d5" />
                                        <circle cx="330" cy="128" r="3.5" fill="#10b981" />
                                        <circle cx="348" cy="148" r="3.5" fill="#f43f5e" />
                                        <circle cx="362" cy="146" r="3.5" fill="#0797d5" />
                                        <circle cx="390" cy="149" r="3.5" fill="#10b981" />
                                        <text x="12" y="133" fontSize="10" fill="#475569" fontWeight="bold">100%</text>
                                        <text x="12" y="30" fontSize="10" fill="#475569">200%</text>
                                        <text x="18" y="210" fontSize="10" fill="#475569">0%</text>
                                        <text x="105" y="225" fontSize="9" fill="#64748b">1 ms</text>
                                        <text x="200" y="225" fontSize="9" fill="#64748b">100 ms</text>
                                        <text x="310" y="225" fontSize="9" fill="#64748b">10 s</text>
                                        <text x="425" y="225" fontSize="9" fill="#64748b">1000 s</text>
                                    </svg>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="px-6 py-5 bg-slate-50 border-t border-slate-100">
                        <h3 className="text-base font-bold text-slate-950">Clasificación de Perturbaciones Transitorias</h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                            Identificamos sags, swells y microcortes frente a la envolvente de inmunidad de equipos electrónicos (IEC 61000-4-30).
                        </p>
                    </div>
                </div>

                {/* Tarjeta 2: Calidad de Tensión THD-U */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow flex flex-col justify-between">
                    <div>
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-2">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                                Calidad de Tensión: Distorsión Armónica (THD-U)
                            </span>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                                Alerta crítica
                            </span>
                        </div>

                        <div className="p-6 flex flex-col justify-center">
                            {thduScreenshot ? (
                                <img
                                    src={thduScreenshot}
                                    alt="Captura real de Distorsión Armónica Total THD-U en VoltGuard"
                                    loading="lazy"
                                    className="w-full h-auto rounded-xl border border-slate-200"
                                />
                            ) : (
                                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
                                    <div className="flex items-start justify-between gap-3 mb-5">
                                        <div>
                                            <p className="text-sm font-black text-slate-950">
                                                Supervisión de salud de red bajo IEEE 519 / NTCSE
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Registro continuo de armónicos hasta el orden 50°
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                                            SUPERA LÍMITE
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                                            <span className="block text-[10px] font-bold uppercase text-slate-400">
                                                Pico Máximo
                                            </span>
                                            <span className="text-xl sm:text-2xl font-black text-rose-600 mt-1 block tabular-nums">
                                                13.83%
                                            </span>
                                            <span className="text-[10px] text-slate-400 block mt-0.5">
                                                A las 12:00 hrs
                                            </span>
                                        </div>

                                        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                                            <span className="block text-[10px] font-bold uppercase text-slate-400">
                                                Promedio THD-U
                                            </span>
                                            <span className="text-xl sm:text-2xl font-black text-violet-700 mt-1 block tabular-nums">
                                                9.62%
                                            </span>
                                            <span className="text-[10px] text-slate-400 block mt-0.5">
                                                Barras principales
                                            </span>
                                        </div>

                                        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                                            <span className="block text-[10px] font-bold uppercase text-slate-400">
                                                Límite Norma
                                            </span>
                                            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block tabular-nums">
                                                8.00%
                                            </span>
                                            <span className="text-[10px] text-slate-400 block mt-0.5">
                                                BT ≤ 1 kV (IEEE 519)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="px-6 py-5 bg-slate-50 border-t border-slate-100">
                        <h3 className="text-base font-bold text-slate-950">Armónicos, Demanda HP/HFP y Termografía</h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                            Evita el sobrecalentamiento de transformadores y disparos intempestivos con planes correctivos respaldados por ingeniero CIP.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ─── PlanCard ───────────────────────────────────────────────────────────── */

function PlanCard({ plan, index, active }: { plan: Plan; index: number; active: boolean }) {
    const navigate = useNavigate();
    const isFeatured = plan.featured;

    return (
        <div
            style={{
                opacity: active ? 1 : 0,
                transform: active ? "translateY(0) scale(1)" : "translateY(28px) scale(0.98)",
                transition: `opacity 0.6s ease ${index * 150}ms, transform 0.6s ease ${index * 150}ms`
            }}
            className={`relative rounded-3xl flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-2 bg-white h-full
                ${
                    !isFeatured
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
                <div
                    className={`p-6 sm:p-7 border-b border-slate-100 ${
                        !isFeatured
                            ? "bg-slate-50/60"
                            : "bg-gradient-to-br from-[#0797d5]/10 via-[#0797d5]/5 to-transparent"
                    }`}
                >
                    <span
                        className={`inline-block text-[11px] font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider ${plan.sectorColor}`}
                    >
                        {plan.sectorTag}
                    </span>

                    <h3 className="text-2xl font-black text-slate-950 tracking-tight">{plan.name}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{plan.subLabel}</p>

                    <div className="mt-5">
                        <span
                            className={`text-3xl sm:text-4xl font-black tracking-tight leading-none ${
                                !isFeatured ? "text-slate-900" : "text-[#0797d5]"
                            }`}
                        >
                            {plan.priceLabel}
                        </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-3 leading-relaxed">{plan.description}</p>
                </div>

                <div className="p-6 sm:p-7">
                    <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-3">
                        Incluye entregables:
                    </p>
                    <ul className="space-y-2.5">
                        {plan.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                                <span
                                    className={`mt-0.5 shrink-0 size-4 rounded-full flex items-center justify-center ${
                                        !isFeatured
                                            ? "bg-slate-100 text-slate-700"
                                            : "bg-[#0797d5]/15 text-[#0797d5]"
                                    }`}
                                >
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
                    className={`w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${
                        !isFeatured
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

/* ─── Carrusel de Casos y FAQs ───────────────────────────────────────────── */

function StoryCardMinimal({ story }: { story: Story }) {
    const SectorIcon = story.sectorIcon;

    return (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 h-auto lg:h-[440px]">
            <div className="grid lg:grid-cols-2 h-full">
                <div className="p-8 lg:p-10 flex flex-col justify-between h-full">
                    <div>
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <span
                                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${story.sectorColor}`}
                                style={{
                                    borderColor: `${story.accentColor}30`,
                                    backgroundColor: `${story.accentColor}08`
                                }}
                            >
                                <SectorIcon size={12} />
                                {story.sector} • {story.year}
                            </span>
                            <img src={story.logo} alt={story.company} className="h-10 w-auto object-contain" />
                        </div>

                        <h3 className="text-2xl font-black text-slate-950 tracking-tight">{story.company}</h3>
                        <p className="mt-2 text-sm text-slate-600 font-medium leading-relaxed">{story.tagline}</p>
                        <p className="mt-3 text-xs text-slate-500 leading-relaxed">{story.solution}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100 mt-4">
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
                        src={story.image}
                        alt={`Inspección en ${story.company}`}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                </div>
            </div>
        </div>
    );
}

function StoriesCarousel() {
    const { stories } = HOME_CONTENT;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [displayIndex, setDisplayIndex] = useState(0);

    const changeStory = useCallback(
        (newIndex: number) => {
            if (isAnimating || newIndex === displayIndex) return;
            setIsAnimating(true);
            setTimeout(() => {
                setDisplayIndex(newIndex);
                setCurrentIndex(newIndex);
                setTimeout(() => setIsAnimating(false), 50);
            }, 250);
        },
        [isAnimating, displayIndex]
    );

    const prevStory = () => {
        changeStory(displayIndex === 0 ? stories.length - 1 : displayIndex - 1);
    };

    const nextStory = useCallback(() => {
        changeStory(displayIndex === stories.length - 1 ? 0 : displayIndex + 1);
    }, [displayIndex, changeStory, stories.length]);

    useEffect(() => {
        const timer = setInterval(nextStory, 7000);
        return () => clearInterval(timer);
    }, [nextStory]);

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0797d5]/20 bg-[#0797d5]/5 text-xs font-semibold text-[#0797d5] mb-2">
                        <Award size={13} /> Casos de éxito
                    </div>
                    <h2 className="text-3xl font-black text-slate-950 tracking-tight">Empresas que confían en VoltGuard</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={prevStory}
                        aria-label="Anterior caso"
                        disabled={isAnimating}
                        className="size-11 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:border-[#0797d5] hover:text-[#0797d5] hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <button
                        onClick={nextStory}
                        aria-label="Siguiente caso"
                        disabled={isAnimating}
                        className="size-11 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:border-[#0797d5] hover:text-[#0797d5] hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            <div className="overflow-hidden relative">
                <div
                    className="transition-all duration-500 ease-out"
                    style={{
                        opacity: isAnimating ? 0 : 1,
                        transform: isAnimating ? "translateY(10px)" : "translateY(0)"
                    }}
                >
                    <StoryCardMinimal story={stories[displayIndex]} />
                </div>
            </div>

            <div className="flex justify-center items-center gap-2 mt-6">
                {stories.map((_, idx) => (
                    <button
                        key={idx}
                        aria-label={`Ver caso ${idx + 1}`}
                        onClick={() => changeStory(idx)}
                        className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                            currentIndex === idx ? "w-8 bg-[#0797d5]" : "w-2.5 bg-slate-200 hover:bg-slate-300"
                        }`}
                    />
                ))}
            </div>
        </section>
    );
}

function FAQRow({ q, a }: FAQItem) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-slate-200 bg-white rounded-2xl overflow-hidden hover:border-[#0797d5]/40 hover:shadow-md transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-950 hover:text-[#0797d5] transition-colors cursor-pointer group"
            >
                <span className="text-sm sm:text-base pr-4">{q}</span>
                <div
                    className={`shrink-0 size-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isOpen
                            ? "bg-[#0797d5] text-white rotate-180"
                            : "bg-slate-100 text-slate-400 group-hover:bg-[#0797d5]/10 group-hover:text-[#0797d5]"
                    }`}
                >
                    <ChevronDown size={15} />
                </div>
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-56 border-t border-slate-100" : "max-h-0"}`}>
                <p className="p-5 text-sm text-slate-600 leading-relaxed bg-slate-50/50">{a}</p>
            </div>
        </div>
    );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function HomePage() {
    const navigate = useNavigate();
    const {
        seo,
        hero,
        heroStats,
        problems,
        symptoms,
        beforeAfter,
        digitalTwinSteps,
        methodology,
        cumplimiento,
        otherServiceLines,
        plans,
        planFootnotes,
        faqs,
        whatsappUrl,
        footnoteStats
    } = HOME_CONTENT;

    usePageMeta(seo.title, seo.description);

    const { ref: heroStatsRef, inView: heroStatsVisible } = useInViewRepeatable(0.2);
    const { ref: pricingRef, inView: pricingVisible } = useInViewRepeatable(0.1);
    const { ref: testimonialRef, inView: testimonialVisible } = useInViewRepeatable(0.15);

    const stepIcons = [Cpu, QrCode, Smartphone, ShieldCheck];

    return (
        <div className="bg-slate-50 min-h-screen overflow-x-hidden">
            <InjectStyles />

            {/* ── 1. HERO ──────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden pt-24 sm:pt-28 pb-16 lg:pb-24">
                <BackgroundGrid />
                <div
                    className="absolute -top-32 -left-32 size-96 rounded-full bg-[#0797d5]/12 blur-3xl pointer-events-none"
                    style={{ animation: "blobMove 8s ease-in-out infinite" }}
                />
                <div
                    className="absolute top-10 -right-32 size-80 rounded-full bg-[#8ccf2f]/10 blur-3xl pointer-events-none"
                    style={{ animation: "blobMove 10s ease-in-out 2s infinite reverse" }}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    <div style={{ animation: "fadeUp 0.6s ease both" }} className="flex flex-col items-start">
                        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0797d5]/10 text-[#0797d5] font-bold text-xs tracking-widest uppercase mb-5 border border-[#0797d5]/20">
                            <Zap size={13} /> {hero.badge}
                        </span>

                        <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-slate-950 leading-[1.08]">
                            {hero.titlePrefix}
                            <span
                                className="bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] bg-clip-text text-transparent inline-block"
                                style={{ backgroundSize: "200% 200%", animation: "gradShift 4s ease infinite" }}
                            >
                                {hero.titleHighlight}
                            </span>
                        </h1>

                        <p className="mt-6 text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-xl">
                            {hero.subtitle}
                        </p>

                        <div className="mt-8 w-full sm:w-auto flex flex-col sm:flex-row gap-3.5">
                            <button
                                onClick={() => navigate(hero.primaryCta.path)}
                                className="w-full sm:w-auto px-7 py-4 bg-[#0797d5] hover:bg-[#0684bd] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-[#0797d5]/25 transition-all hover:-translate-y-0.5 cursor-pointer text-center"
                            >
                                {hero.primaryCta.label}
                            </button>
                            <button
                                onClick={() => navigate(hero.secondaryCta.path)}
                                className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-extrabold text-sm rounded-2xl transition-all hover:-translate-y-0.5 cursor-pointer text-center"
                            >
                                {hero.secondaryCta.label}
                            </button>
                        </div>

                        <div
                            ref={heroStatsRef}
                            className="mt-10 pt-8 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full items-stretch"
                        >
                            {heroStats.map((s, i) => (
                                <div
                                    key={s.id}
                                    className="relative group p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#0797d5]/40 transition-all duration-300"
                                >
                                    <AnimatedStat {...s} active={heroStatsVisible} duration={900 + i * 200} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-tr from-[#0797d5]/20 to-[#8ccf2f]/20 rounded-[2.5rem] blur-xl opacity-60 pointer-events-none" />
                        <div className="relative bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/60 group">
                            <img
                                src={hero.image}
                                alt={hero.imageAlt}
                                className="rounded-3xl object-cover h-[420px] lg:h-[520px] w-full transform group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                            />
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 2. PLANES Y LICENCIAS (JUSTO DEBAJO DEL HERO) ────────────── */}
            <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative">
                <div className="text-center mb-14">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0797d5]/10 text-[#0797d5] font-semibold text-xs tracking-widest uppercase mb-3 border border-[#0797d5]/20">
                        Licenciamiento VoltGuard
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                        Elige el plan adecuado según tus tableros y requisitos ITSE
                    </h2>
                </div>

                <div ref={pricingRef} className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto items-stretch">
                    {plans.map((plan, i) => (
                        <PlanCard key={plan.id} plan={plan} index={i} active={pricingVisible} />
                    ))}
                </div>

                <div className="mt-10 text-center space-y-1">
                    {planFootnotes.map((note, idx) => (
                        <p key={idx} className="text-xs text-slate-400">
                            {note}
                        </p>
                    ))}
                    <p className="text-xs text-slate-400">{footnoteStats}</p>
                </div>
            </section>

            {/* ── 3. EL PROBLEMA & LOS SÍNTOMAS ───────────────────────────── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 space-y-16">
                <div>
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0797d5]/10 text-[#0797d5] font-semibold text-xs tracking-widest uppercase mb-3 border border-[#0797d5]/20">
                        El Problema
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                        Lo que cuesta seguir gestionando tableros en papel
                    </h2>

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                        {problems.map((item, idx) => (
                            <div
                                key={idx}
                                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:border-[#0797d5]/40 transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="size-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-950 mb-2">{item.title}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bloque de Síntomas */}
                <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 font-bold text-xs tracking-widest uppercase mb-3 border border-rose-200">
                        Los Síntomas
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                        Duran menos que un parpadeo. Tú no los percibes.
                    </h2>
                    <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-2xl">
                        Perturbaciones transitorias en baja y media tensión que deterioran silenciosamente tu equipamiento crítico.
                    </p>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                        {symptoms.map((sym, idx) => (
                            <div
                                key={idx}
                                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center gap-1.5 text-rose-600 text-xs font-extrabold uppercase tracking-wider mb-2">
                                        <Activity size={14} /> Perturbación
                                    </div>
                                    <h3 className="text-lg font-extrabold text-slate-950">{sym.title}</h3>
                                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{sym.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 4. ANTES VS. AHORA & GEMELO DIGITAL EN 4 PASOS ──────────── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-extrabold uppercase tracking-wider">
                                Antes · Informe Estático (Data Muerta)
                            </span>
                            <ul className="mt-5 space-y-3">
                                {beforeAfter.before.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                                        <span className="text-rose-500 font-black">✕</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col justify-between shadow-xl">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full bg-[#8ccf2f]/20 text-[#8ccf2f] text-xs font-extrabold uppercase tracking-wider">
                                Ahora · Expediente Vivo en VoltGuard
                            </span>
                            <ul className="mt-5 space-y-3">
                                {beforeAfter.after.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-200">
                                        <span className="text-[#8ccf2f] font-black">✓</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Gemelo digital en 4 pasos */}
                <div>
                    <div className="mb-8">
                        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0797d5]/10 text-[#0797d5] font-semibold text-xs tracking-widest uppercase mb-3 border border-[#0797d5]/20">
                            Cómo Funciona
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                            El gemelo digital en cuatro pasos
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-7 min-w-0 w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {digitalTwinSteps.map((step, idx) => {
                                const Icon = stepIcons[idx];
                                return (
                                    <div
                                        key={step.num}
                                        className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-w-0"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-4">
                                                <span className="text-xs font-black text-[#0797d5] bg-[#0797d5]/10 px-3 py-1 rounded-full">
                                                    PASO {step.num}
                                                </span>
                                                <Icon size={20} className="text-slate-700 shrink-0" />
                                            </div>
                                            <h3 className="text-lg font-extrabold text-slate-950">{step.title}</h3>
                                            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{step.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="lg:col-span-5 min-w-0 w-full">
                            <QrBoardPreview />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 5. LA HISTORIA CLÍNICA (CURVA ITIC + THD-U) ──────────────── */}
            <ClinicalHistorySection />

            {/* ── 6. METODOLOGÍA DE INSPECCIÓN EN CAMPO ────────────────────── */}
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
                    {methodology.map((item, i) => (
                        <div
                            key={i}
                            className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-[#0797d5]/20 hover:border-[#0797d5]/50 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
                        >
                            <div className="h-1.5 w-full shrink-0 z-10" style={{ backgroundColor: item.accentColor }} />

                            <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-950 shrink-0">
                                <img
                                    src={item.src}
                                    alt={item.title}
                                    loading="lazy"
                                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                                />

                                <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
                                    <span className="text-2xl font-black text-white drop-shadow-md bg-slate-950/50 px-2.5 py-0.5 rounded-xl backdrop-blur-md">
                                        {item.step}
                                    </span>
                                    <span
                                        className={`text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-md ${item.badgeColor}`}
                                    >
                                        {item.badge}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 bg-slate-900">
                                <div>
                                    <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug group-hover:text-[#0797d5] transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">{item.sub}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── 7. MÁS ALLÁ DEL CHEQUEO: TARIFA, HUELLA Y RENOVABLES ────── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="mb-10">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0797d5]/10 text-[#0797d5] font-semibold text-xs tracking-widest uppercase mb-3 border border-[#0797d5]/20">
                        Más Allá del Chequeo
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                        Tarifa, huella de carbono y generación propia
                    </h2>
                    <p className="mt-2 text-slate-600 text-base max-w-2xl">
                        Todas nuestras líneas de ingeniería convergen en un mismo lugar: el expediente vivo en VoltGuard.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {otherServiceLines.map((line, idx) => (
                        <Link
                            key={idx}
                            to={line.path}
                            className="group bg-white border border-slate-200 rounded-3xl p-7 shadow-sm hover:shadow-xl hover:border-[#0797d5]/50 hover:-translate-y-1 transition-all flex flex-col justify-between"
                        >
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    {line.norm}
                                </span>
                                <h3 className="mt-2 text-xl font-extrabold text-slate-950 group-hover:text-[#0797d5] transition-colors">
                                    {line.title}
                                </h3>
                                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{line.description}</p>
                            </div>
                            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#0797d5]">
                                Ver el alcance <ArrowRight size={15} />
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── 8. CRUCE NORMATIVO INTEGRAL ──────────────────────────────── */}
            <section id="standards" className="relative overflow-hidden py-20">
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                            Cruce Normativo Integral: ITSE, CNE y NFPA
                        </h2>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3 items-stretch">
                        {cumplimiento.map((card) => {
                            const IconComponent = card.icon;
                            return (
                                <div
                                    key={card.id}
                                    className={`group bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1.5 ${card.borderColor} transition-all duration-300 relative flex flex-col justify-between`}
                                >
                                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.accentGradient} rounded-t-3xl`} />
                                    <div>
                                        <div
                                            className={`w-12 h-12 rounded-2xl ${card.badgeColor} flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform duration-300`}
                                        >
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

            {/* ── 9. CASOS DE ÉXITO ────────────────────────────────────────── */}
            <StoriesCarousel />

            {/* ── 10. TESTIMONIAL DESTACADO ────────────────────────────────── */}
            <section ref={testimonialRef} className="relative overflow-hidden py-24">
                <img
                    src="/section_caso_uso_home2.webp"
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                    style={{ animation: "kenBurns 22s ease-in-out infinite" }}
                />
                <div className="absolute inset-0 bg-slate-950/75" />
                <div
                    className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center"
                    style={{
                        opacity: testimonialVisible ? 1 : 0,
                        transform: testimonialVisible ? "translateY(0)" : "translateY(24px)",
                        transition: "opacity 0.8s ease, transform 0.8s ease"
                    }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0797d5]/20 border border-[#0797d5]/40 text-[#05c4f7] text-xs font-bold mb-6">
                        <Activity size={12} /> Caso de éxito en planta
                    </div>
                    <blockquote className="text-2xl sm:text-3xl font-black text-white leading-snug">
                        "Antes tardábamos días en ubicar los certificados de un tablero. Con VoltGuard lo hacemos en segundos desde el celular."
                    </blockquote>
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <img
                            src="/avatar-engineer.png"
                            alt="Ing. César Inga Zapata"
                            className="size-12 rounded-full object-cover border-2 border-[#0797d5] shadow-lg shadow-[#0797d5]/40"
                        />
                        <div className="text-left">
                            <p className="text-white font-bold text-sm">Ing. César Inga Zapata</p>
                            <p className="text-gray-400 font-bold text-xs">Director de Proyectos GESENER · CIP 99496</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 11. PREGUNTAS FRECUENTES (FAQS) ──────────────────────────── */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0797d5]/8 border border-[#0797d5]/20 text-[#0797d5] text-xs font-bold mb-4">
                        <HelpCircle size={13} /> Preguntas Frecuentes
                    </div>
                    <h2 className="text-3xl font-black text-slate-950 tracking-tight">
                        Preguntas Frecuentes sobre Diagnóstico y Norma ITSE
                    </h2>
                </div>
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <FAQRow key={i} {...faq} />
                    ))}
                </div>
            </section>

            {/* ── 12. CTA FINAL ────────────────────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 shadow-2xl border border-slate-800">
                    <BackgroundGrid />
                    <div className="relative z-10 p-10 lg:p-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#8ccf2f]/15 border border-[#8ccf2f]/30 text-[#8ccf2f] text-xs font-bold mb-5">
                                <CheckCircle2 size={13} /> Expediente Vivo en VoltGuard
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                                Deje de archivar papeles.<br />
                                <span
                                    className="bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] bg-clip-text text-transparent"
                                    style={{ backgroundSize: "200% 200%", animation: "gradShift 4s ease infinite" }}
                                >
                                    Gestione su energía y su huella de carbono.
                                </span>
                            </h2>
                            <p className="mt-4 text-slate-300 text-sm leading-7 max-w-lg">
                                Agende el chequeo eléctrico de su instalación o descargue la ficha técnica completa del servicio Power Quality Digital.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 shrink-0 w-full sm:w-auto">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-[#0797d5] hover:bg-[#0684bd] text-white font-extrabold text-sm rounded-2xl transition-all hover:scale-[1.02] shadow-xl shadow-[#0797d5]/30"
                            >
                                <MessageSquare size={18} />
                                Agendar diagnóstico por WhatsApp
                            </a>

                            <button
                                onClick={() => navigate("/technical-sheet")}
                                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/25 font-bold text-sm rounded-2xl transition-all cursor-pointer"
                            >
                                <Download size={18} />
                                Descargar Datasheet (PDF)
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}