import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Check,
    X,
    ArrowRight,
    HelpCircle,
    ChevronDown,
    Shield,
    Zap,
    Users,
    FileText,
    Award,
    Star,
    Image,
    Layers,
    FileCode,
    Activity,
    ShieldAlert,
    Loader2
} from "lucide-react";
import { useAuth } from "../../shared/hooks/useAuth";
import { subscription } from "../../services/subscription.service";

/* ─── Types & Data ───────────────────────────────────────────────────────── */

type PlanBilling = "monthly" | "yearly";

interface FAQItem {
    q: string;
    a: string;
}

const faqs: FAQItem[] = [
    {
        q: "¿Quién se encarga de subir los diagramas, fotos y certificados al sistema?",
        a: "Todo el trabajo de campo, levantamiento técnico y procesamiento de archivos es realizado exclusivamente por el personal calificado de Voltguard. Tus usuarios y clientes solo ingresan al sistema web para visualizar el estado de sus activos y descargar la documentación autorizada según su plan."
    },
    {
        q: "¿Cómo funciona el límite de tableros en cada plan?",
        a: "Los límites representan el alcance máximo del inventario de ingeniería contratado. El Plan Free incluye únicamente el Tablero General (TG) piloto; el Plan Básico cubre hasta 50 tableros (distribución y sub-tableros); y el Plan Pro se despliega a nivel industrial cubriendo hasta 200 tableros eléctricos."
    },
    {
        q: "¿Cuál es la diferencia entre los entregables PDF y CAD?",
        a: "El Plan Básico te permite descargar reportes ejecutivos, estudios NFPA 70E y etiquetas normativas listas para impresión en formato PDF. El Plan Pro añade la entrega de los planos originales digitalizados en formato CAD (.DWG), ideales para modificaciones de ingeniería interna o futuras ampliaciones."
    },
    {
        q: "¿Qué normativas de seguridad se aplican en las inspecciones?",
        a: "Para el Plan Básico, nuestro equipo realiza la rotulación e identificación de riesgos de choque y arco eléctrico basándose en la norma NFPA 70E. Para el Plan Pro, añadimos los estándares de la norma NFPA 70B, orientada a la implementación de programas robustos de mantenimiento predictivo y preventivo."
    }
];

interface Plan {
    id: "free" | "basic" | "pro";
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
        tableros: number | string;
        tipoTG: string;
        descarga: string;
    };
}

const plansData: Plan[] = [
    {
        id: "free",
        name: "Free",
        monthlyPrice: 0,
        yearlyPrice: 0,
        description: "Mapeo piloto inicial para explorar el visor y el ecosistema digital de Voltguard.",
        color: "slate",
        featured: false,
        cta: "Comenzar gratis",
        features: [
            "1 Tablero Eléctrico",
            "Exclusivo para Tablero General (TG)",
            "Seguimiento de parámetros operativos",
            "Visor web interactivo en tiempo real",
            "Soporte estándar por email"
        ],
        limits: { tableros: 1, tipoTG: "Solo TG Principal", descarga: "Solo Visualización Web" }
    },
    {
        id: "basic",
        name: "Básico",
        badge: "Más popular",
        monthlyPrice: 49,
        yearlyPrice: 39,
        description: "Ideal para colegios, pymes y comercios que requieren ingeniería obligatoria esencial.",
        color: "blue",
        featured: true,
        cta: "Adquirir Plan Básico",
        features: [
            "Hasta 50 Tableros Eléctricos",
            "Levantamiento fotográfico técnico",
            "Diseño de diagramas unifilares",
            "Rotulación de circuitos y leyendas",
            "Análisis de Seguridad NFPA 70E",
            "Descarga de Etiquetas y Reportes (PDF)"
        ],
        limits: { tableros: 50, tipoTG: "TG y Distribución", descarga: "Formatos PDF" }
    },
    {
        id: "pro",
        name: "Pro",
        monthlyPrice: 149,
        yearlyPrice: 119,
        description: "Para plantas industriales masivas, corporaciones y mantenimiento predictivo avanzado.",
        color: "green",
        featured: false,
        cta: "Contactar ventas",
        features: [
            "Hasta 200 Tableros Eléctricos",
            "Servicio e inspección presencial",
            "Pruebas de aislamiento (Megado)",
            "Escaneo por termografía infrarroja",
            "Cuadro de cargas y demanda máxima",
            "Emisión de certificados oficiales",
            "Programa predictivo NFPA 70B",
            "Descarga completa de archivos PDF y CAD"
        ],
        limits: { tableros: 200, tipoTG: "Toda la Red Interna", descarga: "PDF y CAD (.DWG)" }
    }
];

/* ─── Hooks Reutilizados ────────────────────────────────────────────────── */

function useInViewRepeatable(threshold = 0.1) {
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

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function FAQRow({ q, a, index, active }: FAQItem & { index: number; active: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div
            className="border border-slate-200 bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#0797d5]/30"
            style={{
                opacity: active ? 1 : 0,
                transform: active ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.55s ease ${index * 80}ms, transform 0.55s ease ${index * 80}ms, border-color 0.3s`,
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

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function PlanesPage() {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [billing, setBilling] = useState<PlanBilling>("monthly");

    // ESTADOS PARA LA SIMULACIÓN DE SUSCRIPCIÓN
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [apiResponse, setApiResponse] = useState<string>("");

    /* Hooks de intersección para disparar animaciones al hacer scroll */
    const { ref: headerRef, inView: headerVisible } = useInViewRepeatable(0.1);
    const { ref: cardsRef, inView: cardsVisible } = useInViewRepeatable(0.1);
    const { ref: tableRef, inView: tableVisible } = useInViewRepeatable(0.05);
    const { ref: faqHeadRef, inView: faqHeadVisible } = useInViewRepeatable(0.1);
    const { ref: faqListRef, inView: faqListVisible } = useInViewRepeatable(0.1);
    const { ref: trustRef, inView: trustVisible } = useInViewRepeatable(0.1);

    const getPrice = (monthly: number, yearly: number) => billing === "monthly" ? monthly : yearly;

        const handleConfirmSubscription = async () => {
        if (!selectedPlan) return;
        if (!auth?._id) {
            setApiResponse("🔴 ERROR: Usuario no autenticado. ID de usuario faltante.");
            return;
        }
        setLoading(true);
        setApiResponse("");

        try {
            // const response = await axios.put("http://localhost:5000/api/subscribe", {
            //     userId: "65f123456789abcdef012345", // ID de usuario ficticio para la simulación
            //     chosenPlan: selectedPlan.id
            // });
            
            const response = await subscription(auth._id, selectedPlan.id)

            if (response.data.success) {
                setApiResponse(`🟢 MONGODB: ${response.data.message}`);
                // Cerramos el modal después de 2 segundos
                setTimeout(() => setSelectedPlan(null), 2000);
            }
        } catch (error: any) {
            setApiResponse(`🔴 ERROR: No se pudo conectar con el Backend local o el ID falló.`);
            // Fallback visual por si tu servidor no está corriendo aún:
            setTimeout(() => {
                setApiResponse(`🟡 MOCK SIMULADOR: El usuario se ha suscrito exitosamente al plan ${selectedPlan.name.toUpperCase()} (Base de datos local actualizada de forma simulada).`);
            }, 1000);
        } finally {
            setTimeout(() => setLoading(false), 1000);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen py-20 overflow-x-hidden relative">

            {/* Fondo decorativo */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-32 -left-32 size-96 rounded-full bg-[#0797d5]/5 blur-3xl" />
                <div className="absolute top-20 -right-32 size-80 rounded-full bg-[#8ccf2f]/5 blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-30">

                {/* ── HEADER ── */}
                <div
                    ref={headerRef}
                    className="text-center max-w-3xl mx-auto mb-12"
                    style={{
                        opacity: headerVisible ? 1 : 0,
                        transform: headerVisible ? "translateY(0)" : "translateY(24px)",
                        transition: "opacity 0.65s ease, transform 0.65s ease"
                    }}
                >
                    <div
                        style={{
                            opacity: headerVisible ? 1 : 0,
                            transform: headerVisible ? "translateY(0)" : "translateY(20px)",
                            transition: "opacity 0.6s ease 0.05s, transform 0.6s ease 0.05s",
                        }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                                                border border-[#0797d5]/20 bg-[#0797d5]/5
                                                text-sm font-semibold text-[#0797d5] mb-6">
                            <Award size={15} />
                            Dimensionamiento Comercial B2B
                        </div>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight leading-none mb-4">
                        Planes estructurados para <br />
                        <span
                            className="bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] bg-clip-text text-transparent"
                            style={{ backgroundSize: "200% 200%", animation: "gradShift 4s ease infinite" }}
                        >
                            tu volumen de tableros eléctricos
                        </span>
                    </h1>
                    <p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
                        Todo el trabajo de campo es realizado por ingenieros de Voltguard. Selecciona la cobertura ideal según la cantidad de activos de tu infraestructura.
                    </p>

                    {/* Selector de periodo */}
                    <div className="inline-flex items-center gap-1 mt-8 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                        {(["monthly", "yearly"] as PlanBilling[]).map((b) => (
                            <button
                                key={b}
                                onClick={() => setBilling(b)}
                                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-250 cursor-pointer ${billing === b
                                    ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                                    : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                {b === "monthly" ? "Mensual" : (
                                    <span className="flex items-center gap-1.5">
                                        Anual
                                        <span className="bg-[#8ccf2f]/20 text-[#4a7c10] text-xs font-bold px-1.5 py-0.5 rounded-full">
                                            -20%
                                        </span>
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── TARJETAS DE PLANES CORREGIDAS ── */}
                <div ref={cardsRef} className="grid gap-6 md:grid-cols-3 mb-24">
                    {plansData.map((plan, i) => {
                        const price = getPrice(plan.monthlyPrice, plan.yearlyPrice);
                        return (
                            <div
                                key={plan.name}
                                className={`bg-white rounded-3xl p-6 flex flex-col justify-between border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative ${
                                    plan.featured ? "border-2 border-[#0797d5] shadow-xl shadow-[#0797d5]/5" : "border-slate-200 shadow-sm"
                                }`}
                                style={{
                                    opacity: cardsVisible ? 1 : 0,
                                    transform: cardsVisible ? "translateY(0)" : "translateY(32px)",
                                    transition: `opacity 0.6s ease ${i * 100}ms, transform 0.6s ease ${i * 100}ms, box-shadow 0.3s, transform 0.3s`,
                                }}
                            >
                                {plan.badge && (
                                    <span className="absolute -top-3 right-6 bg-[#0797d5] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider flex items-center gap-1">
                                        <Star size={10} fill="white" /> {plan.badge}
                                    </span>
                                )}
                                <div>
                                    <span className={`text-xs font-bold uppercase tracking-wider ${
                                        plan.color === "blue" ? "text-[#0797d5]" : plan.color === "green" ? "text-[#5a8c1a]" : "text-slate-400"
                                    }`}>{plan.name}</span>
                                    
                                    <div className="flex items-end gap-1 mt-2">
                                        <span className="text-4xl font-black text-slate-950">
                                            {price === 0 ? "Gratis" : `$${price}`}
                                        </span>
                                        {price > 0 && <span className="text-slate-400 text-sm mb-1">/mes</span>}
                                    </div>
                                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">{plan.description}</p>
                                    
                                    {/* Lista de beneficios simplificada en la tarjeta */}
                                    <ul className="mt-6 space-y-2.5 border-t border-slate-100 pt-4">
                                        {plan.features.map((f, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-tight">
                                                <Check size={14} className={`shrink-0 mt-0.5 ${plan.color === "blue" ? "text-[#0797d5]" : plan.color === "green" ? "text-[#5a8c1a]" : "text-slate-400"}`} strokeWidth={3} />
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button 
                                    // onClick={() => navigate("/login")} 
                                    onClick={() => setSelectedPlan(plan)}
                                    className={`w-full mt-8 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                                        plan.featured 
                                            ? "bg-[#0797d5] hover:bg-[#087fb3] text-white shadow-lg shadow-[#0797d5]/20" 
                                            : plan.color === "green" 
                                                ? "bg-slate-900 hover:bg-slate-800 text-white" 
                                                : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                                    }`}
                                >
                                    {plan.cta}
                                </button>
                            </div>
                        );
                    })}
                </div>


                {/* LOGS EN PANTALLA DE LA BD */}
                {apiResponse && (
                    <div className="max-w-4xl mx-auto mb-16 p-4 bg-slate-900 text-slate-200 rounded-2xl font-mono text-xs border border-slate-800 shadow-inner flex items-center gap-2">
                        <ShieldAlert size={14} className="text-amber-400 shrink-0" />
                        <span>{apiResponse}</span>
                    </div>
                )}

                {/* ── MODAL INTERACTIVO DE CONFIRMACIÓN DE SUSCRIPCIÓN ── */}
                {selectedPlan && (
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-fade-in">
                        <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
                            <button 
                                onClick={() => { setSelectedPlan(null); setApiResponse(""); }} 
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="text-center mb-4">
                                <div className={`size-12 rounded-2xl mx-auto flex items-center justify-center mb-3 ${selectedPlan.color === 'blue' ? 'bg-[#0797d5]/10 text-[#0797d5]' : selectedPlan.color === 'green' ? 'bg-[#8ccf2f]/10 text-[#5a8c1a]' : 'bg-slate-100 text-slate-600'}`}>
                                    <Zap size={22} />
                                </div>
                                <h3 className="text-lg font-black text-slate-950">Confirmar Suscripción B2B</h3>
                                <p className="text-xs text-slate-500 mt-1">Estás a un paso de simular la asignación del plan en la BD.</p>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2.5 mb-6 text-xs text-slate-700">
                                <div className="flex justify-between font-medium">
                                    <span className="text-slate-400">Plan Seleccionado:</span>
                                    <span className="font-bold text-slate-900 uppercase tracking-wider">{selectedPlan.name}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                    <span className="text-slate-400">Carga Máxima de Campo:</span>
                                    <span className="font-bold text-slate-900">{selectedPlan.limits.tableros} Tableros</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                    <span className="text-slate-400">Entrega de Documentos:</span>
                                    <span className="font-bold text-slate-900">{selectedPlan.limits.descarga}</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-200 pt-2.5 font-bold text-sm">
                                    <span className="text-slate-900">Total Simulado:</span>
                                    <span className="text-[#0797d5]">
                                        {selectedPlan.monthlyPrice === 0 ? "Gratis" : `$${getPrice(selectedPlan.monthlyPrice, selectedPlan.yearlyPrice)} / mes`}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleConfirmSubscription}
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl bg-slate-950 text-white font-extrabold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" /> Guardando en MongoDB...
                                    </>
                                ) : (
                                    <>
                                        Confirmar Contrato Eléctrico <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}








                {/* ── TABLA COMPARATIVA DETALLADA CORREGIDA ── */}
                <div
                    ref={tableRef}
                    className="mb-24"
                    style={{
                        opacity: tableVisible ? 1 : 0,
                        transform: tableVisible ? "translateY(0)" : "translateY(28px)",
                        transition: "opacity 0.7s ease, transform 0.7s ease"
                    }}
                >
                    <div className="text-center lg:text-left mb-8">
                        <h2 className="text-2xl font-black text-slate-950 tracking-tight">Comparativa detallada de servicios</h2>
                        <p className="text-sm text-slate-500 mt-1">Revisa el alcance operativo y los formatos autorizados de descarga para tu auditoría.</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/70">
                                        <th className="p-5 text-sm font-bold text-slate-400 uppercase tracking-wider w-2/5">Capacidad y Cobertura</th>
                                        <th className="p-5 text-sm font-black text-slate-800 text-center bg-slate-100/30">Free</th>
                                        <th className="p-5 text-sm font-black text-[#0797d5] text-center bg-[#0797d5]/5">Básico</th>
                                        <th className="p-5 text-sm font-black text-[#5a8c1a] text-center bg-slate-100/30">Pro</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {/* ALCANCE DE ACTIVOS */}
                                    <tr>
                                        <td className="p-5 font-bold text-slate-700 flex items-center gap-2">
                                            <Zap size={16} className="text-slate-400" /> Límite de tableros cubiertos
                                        </td>
                                        <td className="p-5 text-center text-slate-600 font-semibold bg-slate-100/10">1 Tablero</td>
                                        <td className="p-5 text-center text-slate-900 font-bold bg-[#0797d5]/2">Hasta 50 Tableros</td>
                                        <td className="p-5 text-center text-[#5a8c1a] font-extrabold bg-slate-100/10">Hasta 200 Tableros</td>
                                    </tr>
                                    <tr>
                                        <td className="p-5 font-bold text-slate-700 flex items-center gap-2">
                                            <Layers size={16} className="text-slate-400" /> Jerarquía técnica permitida
                                        </td>
                                        <td className="p-5 text-center text-slate-500 bg-slate-100/10">Solo Tablero General (TG)</td>
                                        <td className="p-5 text-center text-slate-800 font-medium bg-[#0797d5]/2">TG y Distribución</td>
                                        <td className="p-5 text-center text-slate-900 font-bold bg-slate-100/10">Toda la Red Interna</td>
                                    </tr>
                                    <tr>
                                        <td className="p-5 font-bold text-slate-700 flex items-center gap-2">
                                            <FileCode size={16} className="text-slate-400" /> Permisos de descarga
                                        </td>
                                        <td className="p-5 text-center text-xs text-slate-400 bg-slate-100/10">Solo Visualización Web</td>
                                        <td className="p-5 text-center text-slate-900 font-semibold bg-[#0797d5]/2">Etiquetas y Reportes PDF</td>
                                        <td className="p-5 text-center text-[#5a8c1a] font-bold bg-slate-100/10">PDF + Planos CAD (.DWG)</td>
                                    </tr>

                                    {/* ENTREGABLES DIGITALES */}
                                    <tr className="bg-slate-50/40">
                                        <td className="p-4 text-xs font-black uppercase tracking-wider text-slate-400" colSpan={4}>Entregables de Ingeniería (Personal Voltguard)</td>
                                    </tr>
                                    <tr>
                                        <td className="p-5 text-slate-600 flex items-center gap-2"><Image size={14} className="text-slate-400" /> Levantamiento de fotos técnicas</td>
                                        <td className="p-5 text-center bg-slate-100/10"><X size={16} className="text-slate-300 mx-auto" /></td>
                                        <td className="p-5 text-center bg-[#0797d5]/2"><Check size={16} className="text-[#0797d5] mx-auto" strokeWidth={3} /></td>
                                        <td className="p-5 text-center bg-slate-100/10"><Check size={16} className="text-[#5a8c1a] mx-auto" strokeWidth={3} /></td>
                                    </tr>
                                    <tr>
                                        <td className="p-5 text-slate-600 flex items-center gap-2"><FileText size={14} className="text-slate-400" /> Elaboración de diagramas unifilares</td>
                                        <td className="p-5 text-center bg-slate-100/10"><X size={16} className="text-slate-300 mx-auto" /></td>
                                        <td className="p-5 text-center bg-[#0797d5]/2"><Check size={16} className="text-[#0797d5] mx-auto" strokeWidth={3} /></td>
                                        <td className="p-5 text-center bg-slate-100/10"><Check size={16} className="text-[#5a8c1a] mx-auto" strokeWidth={3} /></td>
                                    </tr>
                                    <tr>
                                        <td className="p-5 text-slate-600 flex items-center gap-2"><Layers size={14} className="text-slate-400" /> Actualización de leyendas y circuitos</td>
                                        <td className="p-5 text-center bg-slate-100/10"><X size={16} className="text-slate-300 mx-auto" /></td>
                                        <td className="p-5 text-center bg-[#0797d5]/2"><Check size={16} className="text-[#0797d5] mx-auto" strokeWidth={3} /></td>
                                        <td className="p-5 text-center bg-slate-100/10"><Check size={16} className="text-[#5a8c1a] mx-auto" strokeWidth={3} /></td>
                                    </tr>
                                    <tr>
                                        <td className="p-5 text-slate-600 flex items-center gap-2"><Shield size={14} className="text-slate-400" /> Estudio de Seguridad Eléctrica NFPA 70E</td>
                                        <td className="p-5 text-center bg-slate-100/10"><X size={16} className="text-slate-300 mx-auto" /></td>
                                        <td className="p-5 text-center bg-[#0797d5]/2"><Check size={16} className="text-[#0797d5] mx-auto" strokeWidth={3} /></td>
                                        <td className="p-5 text-center bg-slate-100/10"><Check size={16} className="text-[#5a8c1a] mx-auto" strokeWidth={3} /></td>
                                    </tr>

                                    {/* SERVICIOS PRO AVANZADOS */}
                                    <tr className="bg-slate-50/40">
                                        <td className="p-4 text-xs font-black uppercase tracking-wider text-slate-400" colSpan={4}>Ingeniería Avanzada y Campo (Exclusivo Pro)</td>
                                    </tr>
                                    <tr>
                                        <td className="p-5 text-slate-600 flex items-center gap-2"><Users size={14} className="text-slate-400" /> Inspección y despliegue presencial</td>
                                        <td className="p-5 text-center bg-slate-100/10"><X size={16} className="text-slate-300 mx-auto" /></td>
                                        <td className="p-5 text-center bg-[#0797d5]/2"><X size={16} className="text-slate-300 mx-auto" /></td>
                                        <td className="p-5 text-center bg-slate-100/10"><Check size={16} className="text-[#5a8c1a] mx-auto" strokeWidth={3} /></td>
                                    </tr>
                                    <tr>
                                        <td className="p-5 text-slate-600 flex items-center gap-2"><Activity size={14} className="text-slate-400" /> Pruebas de aislamiento (Megado)</td>
                                        <td className="p-5 text-center bg-slate-100/10"><X size={16} className="text-slate-300 mx-auto" /></td>
                                        <td className="p-5 text-center bg-[#0797d5]/2"><X size={16} className="text-slate-300 mx-auto" /></td>
                                        <td className="p-5 text-center bg-slate-100/10"><Check size={16} className="text-[#5a8c1a] mx-auto" strokeWidth={3} /></td>
                                    </tr>
                                    <tr>
                                        <td className="p-5 text-slate-600 flex items-center gap-2"><Activity size={14} className="text-slate-400" /> Escaneo por Termografía Infrarroja</td>
                                        <td className="p-5 text-center bg-slate-100/10"><X size={16} className="text-slate-300 mx-auto" /></td>
                                        <td className="p-5 text-center bg-[#0797d5]/2"><X size={16} className="text-slate-300 mx-auto" /></td>
                                        <td className="p-5 text-center bg-slate-100/10"><Check size={16} className="text-[#5a8c1a] mx-auto" strokeWidth={3} /></td>
                                    </tr>
                                    <tr>
                                        <td className="p-5 text-slate-600 flex items-center gap-2"><FileText size={14} className="text-slate-400" /> Cuadro de cargas y Demanda Máxima</td>
                                        <td className="p-5 text-center bg-slate-100/10"><X size={16} className="text-slate-300 mx-auto" /></td>
                                        <td className="p-5 text-center bg-[#0797d5]/2"><X size={16} className="text-slate-300 mx-auto" /></td>
                                        <td className="p-5 text-center bg-slate-100/10"><Check size={16} className="text-[#5a8c1a] mx-auto" strokeWidth={3} /></td>
                                    </tr>
                                    <tr>
                                        <td className="p-5 text-slate-600 flex items-center gap-2"><Award size={14} className="text-slate-400" /> Emisión de certificados de operatividad</td>
                                        <td className="p-5 text-center bg-slate-100/10"><X size={16} className="text-slate-300 mx-auto" /></td>
                                        <td className="p-5 text-center bg-[#0797d5]/2"><X size={16} className="text-slate-300 mx-auto" /></td>
                                        <td className="p-5 text-center bg-slate-100/10"><Check size={16} className="text-[#5a8c1a] mx-auto" strokeWidth={3} /></td>
                                    </tr>
                                    <tr>
                                        <td className="p-5 text-slate-600 flex items-center gap-2"><ShieldAlert size={14} className="text-slate-400" /> Mantenimiento Predictivo NFPA 70B</td>
                                        <td className="p-5 text-center bg-slate-100/10"><X size={16} className="text-slate-300 mx-auto" /></td>
                                        <td className="p-5 text-center bg-[#0797d5]/2"><X size={16} className="text-slate-300 mx-auto" /></td>
                                        <td className="p-5 text-center bg-slate-100/10"><Check size={16} className="text-[#5a8c1a] mx-auto" strokeWidth={3} /></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ── SECCIÓN FAQS CORREGIDA ── */}
                <div className="max-w-4xl mx-auto mb-24">
                    <div
                        ref={faqHeadRef}
                        className="text-center mb-10"
                        style={{
                            opacity: faqHeadVisible ? 1 : 0,
                            transform: faqHeadVisible ? "translateY(0)" : "translateY(24px)",
                            transition: "opacity 0.65s ease, transform 0.65s ease"
                        }}
                    >
                        <div className="size-12 rounded-2xl bg-[#0797d5]/8 text-[#0797d5] flex items-center justify-center mx-auto mb-4">
                            <HelpCircle size={24} />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Preguntas frecuentes</h2>
                        <p className="text-slate-500 text-sm mt-2">¿Tienes dudas sobre los alcances del servicio o el procesamiento de datos técnicos? Aquí te respondemos.</p>
                    </div>

                    <div ref={faqListRef} className="space-y-3">
                        {faqs.map((faq, index) => (
                            <FAQRow key={index} {...faq} index={index} active={faqListVisible} />
                        ))}
                    </div>
                </div>

                {/* ── BANNER INFERIOR TRUST ── */}
                <div
                    ref={trustRef}
                    className="border border-slate-200 bg-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm"
                    style={{
                        opacity: trustVisible ? 1 : 0,
                        transform: trustVisible ? "translateY(0)" : "translateY(24px)",
                        transition: "opacity 0.65s ease, transform 0.65s ease"
                    }}
                >
                    <div className="flex items-center gap-4 text-left">
                        <div className="size-12 rounded-2xl bg-[#8ccf2f]/10 text-[#4a7c10] flex items-center justify-center shrink-0">
                            <Shield size={22} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-950 text-base">¿Tienes un volumen mayor a 200 tableros?</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Diseñamos propuestas y SLAs corporativos a la medida de grandes complejos industriales o multi-sedes.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/login")}
                        className="group inline-flex items-center gap-2 px-5 py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all duration-200 shrink-0 cursor-pointer"
                    >
                        Contactar con Soporte Corporativo
                        <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>

            </div>
        </div>
    );
}