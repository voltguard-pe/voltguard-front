import {
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    ChevronDown,
    Loader2,
    ShieldAlert
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Importación oficial y moderna bajo la especificación motion/react
import { motion } from "motion/react";

export default function ContactSalesPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);

    // Estado del formulario corporativo orientado a ITSE
    const [formData, setFormData] = useState({
        fullName: "",
        workEmail: "",
        phone: "",
        companyName: "",
        companySize: "1-50",
        estimatedPanels: "1-10",
        requirements: "Ambas normativas e Inspección ITSE", 
        message: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Simulación de envío al backend (Node.js/Express) para registrar el lead ITSE
            await new Promise((resolve) => setTimeout(resolve, 1800));
            setSubmitted(true);
        } catch (error) {
            console.error("Error al enviar la solicitud corporativa ITSE", error);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-600 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Partículas de Fondo en Pantalla de Éxito */}
                <div className="absolute inset-0 pointer-events-none opacity-40">
                    <div className="absolute top-1/4 left-1/4 size-72 rounded-full bg-[#0797d5]/10 blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 size-72 rounded-full bg-[#8ccf2f]/10 blur-3xl" />
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-3xl text-center space-y-6 shadow-xl relative z-10"
                >
                    <motion.div 
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="size-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto border border-green-100 shadow-xs"
                    >
                        <CheckCircle size={32} />
                    </motion.div>
                    
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black tracking-tight text-slate-950">¡Expediente Iniciado!</h2>
                        <p className="text-sm text-slate-500">
                            Un ingeniero especialista en regulaciones <b>ITSE</b> revisará la infraestructura de <span className="text-slate-950 font-semibold">{formData.companyName}</span>.
                        </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs space-y-3 text-slate-600">
                        <p className="font-bold text-[#0797d5] uppercase tracking-wider text-[10px]">Próximos pasos del protocolo:</p>
                        <div className="flex gap-3">
                            <span className="size-5 rounded-full bg-[#0797d5] text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs">1</span>
                            <p>Validaremos la carpeta técnica preliminar y la compatibilidad de planos unifilares en tus instalaciones.</p>
                        </div>
                        <div className="flex gap-3">
                            <span className="size-5 rounded-full bg-[#8ccf2f] text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs">2</span>
                            <p>Nos comunicaremos a <span className="text-slate-950 font-medium">{formData.workEmail}</span> para coordinar el levantamiento presencial o auditoría de tableros.</p>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/")}
                        className="w-full bg-[#0797d5] hover:bg-[#087fb3] text-white py-3.5 rounded-2xl text-sm font-bold transition-all shadow-md shadow-[#0797d5]/20 cursor-pointer"
                    >
                        Volver al inicio
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-600 flex flex-col lg:flex-row relative overflow-hidden antialiased">
            
            {/* ── ELEMENTOS DE FONDO INTERACTIVOS/ANIMADOS ──────────────────────── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4], x: [0, 20, 0] }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                    className="absolute -top-32 -left-32 size-[500px] rounded-full bg-[#0797d5]/8 blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], y: [0, -30, 0] }}
                    transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-10 right-1/3 size-[400px] rounded-full bg-[#8ccf2f]/6 blur-3xl"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />
            </div>

            {/* ── PANEL IZQUIERDO: CONTENIDO INSTITUCIONAL ITSE ───────────────── */}
            <div className="lg:w-5/12 bg-white/60 backdrop-blur-xl p-8 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200 relative z-10">
                <motion.button 
                    whileHover={{ x: -3 }}
                    onClick={() => navigate("/")}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0797d5] transition-colors cursor-pointer group self-start"
                >
                    <ArrowLeft size={14} />
                    Volver a la página principal
                </motion.button>

                <div className="space-y-6 my-12 lg:my-0">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0797d5]/5 border border-[#0797d5]/10 text-[#0797d5] text-xs font-bold cursor-default"
                    >
                        <ShieldAlert size={14} className="text-[#8ccf2f]" />
                        <span>Soporte de Ingeniería y Certificación ITSE</span>
                    </motion.div>
                    
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-[1.12]">
                        Prepara tu infraestructura para la{" "}
                        <span className="bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] bg-clip-text text-transparent bg-[size:200%_auto] animate-[gradient_4s_linear_infinite]">
                            Inspección ITSE
                        </span>
                    </h2>
                    
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Evita penalizaciones y retrasos en la obtención de tu certificado de seguridad. Voltguard digitaliza tus planos unifilares, automatiza las bitácoras de mantenimiento corporativo y detecta riesgos eléctricos críticos mediante modelos predictivos.
                    </p>

                    <div className="space-y-3.5 pt-6 border-t border-slate-200/60 text-xs font-medium text-slate-600">
                        <div className="flex items-center gap-2.5">
                            <span className="size-2 rounded-full bg-[#8ccf2f]" />
                            <p>Levantamiento y validación pericial de tableros eléctricos.</p>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="size-2 rounded-full bg-[#0797d5]" />
                            <p>Expediente técnico con protocolos firmados por ingenieros colegiados.</p>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="size-2 rounded-full bg-[#0797d5]" />
                            <p>SLA de resguardo multimedia en Cloudinary y disponibilidad del 99.9%.</p>
                        </div>
                    </div>
                </div>

                <div className="text-xs text-slate-400 font-medium">
                    VoltGuard ITSE System © {new Date().getFullYear()}. Todos los derechos reservados.
                </div>
            </div>

            {/* ── PANEL DERECHO: FORMULARIO INTERACTIVO ──────────────────────── */}
            <div className="lg:w-7/12 p-4 sm:p-12 lg:p-16 flex items-center justify-center relative z-10 overflow-y-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="max-w-xl w-full bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50"
                >
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-slate-950 tracking-tight">Solicitar Evaluación Técnica ITSE</h3>
                        <p className="text-xs text-slate-400 mt-1 font-medium">Completa los campos obligatorios para agendar la inspección de tus sedes.</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Nombre Completo</label>
                                <motion.input
                                    whileFocus={{ borderColor: "#0797d5", scale: 1.01 }}
                                    type="text"
                                    name="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Ing. Alejandro Silva"
                                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none transition-all text-slate-900 placeholder:text-slate-300 font-medium"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Correo Corporativo</label>
                                <motion.input
                                    whileFocus={{ borderColor: "#0797d5", scale: 1.01 }}
                                    type="email"
                                    name="workEmail"
                                    required
                                    value={formData.workEmail}
                                    onChange={handleChange}
                                    placeholder="asilva@corporacion.com"
                                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none transition-all text-slate-900 placeholder:text-slate-300 font-medium"
                                />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Teléfono de Contacto</label>
                                <motion.input
                                    whileFocus={{ borderColor: "#0797d5", scale: 1.01 }}
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+51 987 654 321"
                                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none transition-all text-slate-900 placeholder:text-slate-300 font-medium"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Nombre de la Empresa</label>
                                <motion.input
                                    whileFocus={{ borderColor: "#0797d5", scale: 1.01 }}
                                    type="text"
                                    name="companyName"
                                    required
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    placeholder="Minera o Corporación S.A."
                                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none transition-all text-slate-900 placeholder:text-slate-300 font-medium"
                                />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Tamaño de la Organización</label>
                                <div className="relative">
                                    <select
                                        name="companySize"
                                        value={formData.companySize}
                                        onChange={handleChange}
                                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0797d5] transition-all text-slate-900 font-medium cursor-pointer appearance-none"
                                    >
                                        <option value="1-50">1 - 50 colaboradores</option>
                                        <option value="51-200">51 - 200 colaboradores</option>
                                        <option value="201-500">201 - 500 colaboradores</option>
                                        <option value="500+">Más de 500 colaboradores</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Tableros Eléctricos Estimados</label>
                                <div className="relative">
                                    <select
                                        name="estimatedPanels"
                                        value={formData.estimatedPanels}
                                        onChange={handleChange}
                                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0797d5] transition-all text-slate-900 font-medium cursor-pointer appearance-none"
                                    >
                                        <option value="1-10">Menos de 10 tableros</option>
                                        <option value="11-50">11 a 50 tableros</option>
                                        <option value="51-200">51 a 200 tableros</option>
                                        <option value="200+">Más de 200 tableros (Multi-sede)</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">Prioridad Regulativa / Requisito Principal</label>
                            <div className="relative">
                                <select
                                    name="requirements"
                                    value={formData.requirements}
                                    onChange={handleChange}
                                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0797d5] transition-all text-slate-900 font-medium cursor-pointer appearance-none"
                                >
                                    <option value="NFPA 70E">Estudio de Arco Eléctrico y Seguridad (NFPA 70E)</option>
                                    <option value="NFPA 70B">Programa de Mantenimiento / Termografía (NFPA 70B)</option>
                                    <option value="Ambas normativas e Inspección ITSE">Ambas normativas e Inspección Técnica de Seguridad (ITSE)</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">Detalles Adicionales del Proyecto</label>
                            <motion.textarea
                                whileFocus={{ borderColor: "#0797d5", scale: 1.005 }}
                                name="message"
                                rows={3}
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Indica brevemente el alcance de las plantas o locales a inspeccionar para agilizar la cotización técnica..."
                                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none transition-all text-slate-900 placeholder:text-slate-300 font-medium resize-none"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0797d5] hover:bg-[#087fb3] text-white py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-[#0797d5]/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-70 cursor-pointer mt-3"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Procesando requerimiento en la red...</span>
                                </>
                            ) : (
                                <>
                                    <span>Solicitar Información Comercial e ITSE</span>
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}