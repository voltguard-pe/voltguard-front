import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Zap, ArrowRight, Loader2, CheckCircle, Shield } from "lucide-react";

export default function OnboardingPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);

    // Estado unificado para recopilar los datos del asistente
    const [onboardingData, setOnboardingData] = useState({
        // Paso 1: Organización
        companyName: "",
        ruc: "",
        industry: "Industrial",
        // Paso 2: Primer Tablero Piloto
        panelName: "Tablero General Principal (TG-01)",
        location: "Planta Principal - Primer Piso",
        voltage: "380V"
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setOnboardingData({ ...onboardingData, [e.target.name]: e.target.value });
    };

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2); // Avanza al formulario del tablero técnico
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Aquí harás la petición POST estructurada a tu servidor Express:
            // const token = localStorage.getItem("token");
            // await axios.post("http://localhost:5000/api/onboarding", onboardingData, { headers: { Authorization: `Bearer ${token}` } });
            
            // Simulación de procesamiento en la nube (Creación de registros indexados)
            await new Promise((resolve) => setTimeout(resolve, 2000));
            
            // Redirección directa al espacio de trabajo real (Dashboard)
            navigate("/dashboard");
        } catch (error) {
            console.error("Error en el onboarding", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Elipses de diseño sutiles de fondo */}
            <div className="absolute -top-40 left-1/3 size-96 rounded-full bg-[#0797d5]/5 blur-3xl pointer-events-none" />
            
            {/* Indicador de Pasos del Asistente */}
            <div className="max-w-md w-full mb-8 flex items-center justify-between px-2 relative z-10">
                <div className="flex items-center gap-2.5">
                    <span className={`size-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        step >= 1 ? "bg-[#0797d5] text-white shadow-md shadow-[#0797d5]/20" : "bg-slate-200 text-slate-500"
                    }`}>1</span>
                    <span className={`text-xs font-bold ${step === 1 ? "text-slate-900" : "text-slate-400"}`}>Tu Empresa</span>
                </div>
                <div className="flex-1 h-px bg-slate-200 mx-4" />
                <div className="flex items-center gap-2.5">
                    <span className={`size-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        step === 2 ? "bg-[#0797d5] text-white shadow-md shadow-[#0797d5]/20" : "bg-slate-200 text-slate-500"
                    }`}>2</span>
                    <span className={`text-xs font-bold ${step === 2 ? "text-slate-900" : "text-slate-400"}`}>Primer Tablero</span>
                </div>
            </div>

            {/* Tarjeta Principal del Formulario */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl shadow-slate-200/40 relative z-10">
                
                {/* PASO 1: CONFIGURACIÓN DE LA EMPRESA */}
                {step === 1 && (
                    <form onSubmit={handleNextStep} className="space-y-5 animate-fadeIn">
                        <div className="space-y-1">
                            <div className="size-10 rounded-xl bg-[#0797d5]/10 text-[#0797d5] flex items-center justify-center mb-2">
                                <Building2 size={20} />
                            </div>
                            <h3 className="text-xl font-black text-slate-950 tracking-tight">Configura tu organización</h3>
                            <p className="text-xs text-slate-400">Asocia tu cuenta a un entorno empresarial para gestionar los planos y fichas técnicas.</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Nombre de la Empresa / Razón Social</label>
                            <input
                                type="text"
                                name="companyName"
                                required
                                value={onboardingData.companyName}
                                onChange={handleChange}
                                placeholder="Ej. Industrias Eléctricas del Sur"
                                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0797d5] focus:bg-white transition-all text-slate-950"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">RUC / Identificación Fiscal <span className="text-slate-400 font-normal">(Opcional para Plan Free)</span></label>
                            <input
                                type="text"
                                name="ruc"
                                value={onboardingData.ruc}
                                onChange={handleChange}
                                placeholder="Ej. 20123456789"
                                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0797d5] focus:bg-white transition-all text-slate-950"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Sector Industrial</label>
                            <select
                                name="industry"
                                value={onboardingData.industry}
                                onChange={handleChange}
                                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0797d5] focus:bg-white transition-all text-slate-950"
                            >
                                <option value="Industrial">Planta Industrial / Manufactura</option>
                                <option value="Comercial">Centro Comercial / Retail</option>
                                <option value="Salud">Clínica / Hospital</option>
                                <option value="Auditor">Consultoría / Auditoría Eléctrica</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-slate-950 hover:bg-slate-900 text-white py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer mt-2 shadow-lg shadow-slate-950/10"
                        >
                            Siguiente paso
                            <ArrowRight size={16} />
                        </button>
                    </form>
                )}

                {/* PASO 2: MAPEO DEL PRIMER TABLERO PILOTO */}
                {step === 2 && (
                    <form onSubmit={handleFinalSubmit} className="space-y-5 animate-fadeIn">
                        <div className="space-y-1">
                            <div className="size-10 rounded-xl bg-[#8ccf2f]/10 text-[#5a8c1a] flex items-center justify-center mb-2">
                                <Zap size={20} />
                            </div>
                            <h3 className="text-xl font-black text-slate-950 tracking-tight">Tu primer Tablero Eléctrico</h3>
                            <p className="text-xs text-slate-400">Crearemos un espacio piloto para que explores el visor digital de Voltguard de inmediato.</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Identificación del Tablero (Tag Técnico)</label>
                            <input
                                type="text"
                                name="panelName"
                                required
                                value={onboardingData.panelName}
                                onChange={handleChange}
                                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0797d5] focus:bg-white transition-all text-slate-950"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Ubicación Física dentro de la Sede</label>
                            <input
                                type="text"
                                name="location"
                                required
                                value={onboardingData.location}
                                onChange={handleChange}
                                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0797d5] focus:bg-white transition-all text-slate-950"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Tensión Nominal de Operación</label>
                            <select
                                name="voltage"
                                value={onboardingData.voltage}
                                onChange={handleChange}
                                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0797d5] focus:bg-white transition-all text-slate-950"
                            >
                                <option value="380V">380 V (Trifásico - Industrial)</option>
                                <option value="220V">220 V (Monofásico / Trifásico comercial)</option>
                                <option value="440V">440 V (Fuerza / Maquinaria Pesada)</option>
                            </select>
                        </div>

                        {/* Banner informativo de límites del plan free */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-2.5">
                            <Shield size={16} className="text-[#0797d5] shrink-0 mt-0.5" />
                            <p className="text-[11px] text-slate-500 leading-normal">
                                Al ser una cuenta <b>Free</b>, podrás cargar hasta 5 documentos técnicos (PDF/Planos) dentro de este tablero una vez ingreses al panel de control.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                disabled={loading}
                                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                            >
                                Atrás
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-[#0797d5] hover:bg-[#087fb3] text-white py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 cursor-pointer shadow-lg shadow-[#0797d5]/10"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Configurando Consola...
                                    </>
                                ) : (
                                    <>
                                        Finalizar y Entrar
                                        <CheckCircle size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}