import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlanGuardProps {
    currentPlan: string;
    allowedPlans: string[];
    children: React.ReactNode;
    featureName: string;
}

const PlanGuard = ({ currentPlan, allowedPlans, children, featureName }: PlanGuardProps) => {
    const navigate = useNavigate()
    const isAllowed = allowedPlans.includes(currentPlan);

    if (isAllowed) return <>{children}</>;

    return (
        <div className="relative rounded-3xl border border-slate-200 bg-slate-50/50 p-6 overflow-hidden">
            {/* Contenido difuminado de fondo */}
            <div className="blur-sm pointer-events-none select-none opacity-40">
                {children}
            </div>
            {/* Mensaje de Restricción */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-6 text-center text-white">
                <Lock className="w-8 h-8 mb-2 text-amber-400" />
                <h3 className="text-lg font-bold">Función Exclusiva</h3>
                <p className="text-xs text-slate-200 max-w-sm mt-1">
                    La sección <strong className="text-white">{featureName}</strong> está disponible a partir del plan{" "}
                    <span className="uppercase font-extrabold text-amber-300">{allowedPlans[0]}</span>.
                </p>
                <button
                    onClick={() => navigate("/pricing")}
                    className="mt-4 rounded-xl bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-90 transition-all cursor-pointer"
                >
                    Mejorar Plan
                </button>
            </div>
        </div>
    );
};

export default PlanGuard