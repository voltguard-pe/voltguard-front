import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Detectamos si viene del plan free desde la URL (/signup?plan=free)
    const planSelected = searchParams.get("plan") || "free";

    // Estados del formulario (Solo datos de usuario, CERO fricción)
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Aquí simulas o ejecutas la petición real a tu backend de Node.js/Express
            // const response = await axios.post("http://localhost:5000/api/auth/signup", { ...formData, plan: planSelected });
            
            // Simulación de respuesta de red por 1.5 segundos
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Guardas el token ficticio o real en localStorage
            localStorage.setItem("token", "voltguard_token_simulado");

            // IMPORTANTE SaaS: Redirigimos al Onboarding (Bienvenida y creación de empresa)
            navigate("/onboarding");
        } catch (err: any) {
            setError(err.response?.data?.message || "Hubo un error al crear la cuenta. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Decoraciones de fondo minimalistas */}
            <div className="absolute -top-32 -left-32 size-96 rounded-full bg-[#0797d5]/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 -right-32 size-80 rounded-full bg-[#8ccf2f]/5 blur-3xl pointer-events-none" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
                <div className="inline-flex size-12 rounded-2xl bg-[#0797d5] text-white items-center justify-center shadow-lg shadow-[#0797d5]/20 mb-4">
                    <ShieldCheck size={24} />
                </div>
                <h2 className="text-3xl font-black text-slate-950 tracking-tight">
                    Crea tu cuenta en VoltGuard
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Estás registrándote en el <span className="font-bold text-[#0797d5] uppercase">{planSelected}</span>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 border border-slate-200/60 sm:rounded-3xl sm:px-10">
                    
                    {error && (
                        <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Nombre completo</label>
                            <input
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ing. Carlos Mendoza"
                                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0797d5] focus:bg-white transition-all text-slate-950"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Correo corporativo o personal</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="carlos@empresa.com"
                                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0797d5] focus:bg-white transition-all text-slate-950"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Contraseña</label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:border-[#0797d5] focus:bg-white transition-all text-slate-950"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="text-xs text-slate-400 leading-normal">
                            Al registrarte, aceptas nuestros Términos de Servicio y Políticas de Privacidad en Ingeniería Eléctrica.
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0797d5] hover:bg-[#087fb3] text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-[#0797d5]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70 cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Creando tu entorno...
                                </>
                            ) : (
                                <>
                                    Empezar ahora gratis
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 border-t border-slate-100 pt-6 text-center">
                        <p className="text-xs text-slate-500">
                            ¿Ya tienes una cuenta del sistema?{" "}
                            <button 
                                onClick={() => navigate("/login")} 
                                className="font-bold text-[#0797d5] hover:underline cursor-pointer"
                            >
                                Iniciar Sesión
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}