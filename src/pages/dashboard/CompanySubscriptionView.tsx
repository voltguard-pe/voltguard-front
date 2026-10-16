import { Check, Clock, KeyRound, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
// import { ActivateLicenseModal } from "../../components/ActivateLicenseModal";
import { ActivateLicenseModal } from "../../components/dashboard/modals/ActivateLicenseModal";
// import { useAuth } from "../../shared/hooks/useAuth";

export const CompanySubscriptionView = () => {
//   const { auth } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estos datos vendrán de tu auth/empresa (auth?.company?.plan, etc.)
  const [currentPlan, setCurrentPlan] = useState("Plan Básico (Gratuito)");
  const [expiresAt, setExpiresAt] = useState("Sin caducidad");

  const handleActivationSuccess = (newPlan: string) => {
    setCurrentPlan(newPlan);
    setExpiresAt("365 días restantes");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Mi Suscripción</h1>
        <p className="text-xs text-slate-500">Administra los beneficios y el estado de tu licencia en VoltGuard</p>
      </div>

      {/* Banner de Estado Actual */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">{currentPlan}</h2>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                Activo
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <Clock size={13} className="text-slate-400" />
              <span>Vencimiento: {expiresAt}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
        >
          <KeyRound size={15} />
          <span>Canjear Nueva Licencia</span>
        </button>
      </div>

      {/* Comparativa rápida y contacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Beneficios Disponibles</h3>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <Check size={14} className="text-emerald-500" /> Monitoreo de tableros eléctricos
            </li>
            <li className="flex items-center gap-2">
              <Check size={14} className="text-emerald-500" /> Registro de pozos a tierra (SPAT)
            </li>
            <li className="flex items-center gap-2">
              <Check size={14} className="text-emerald-500" /> Módulo de documentos e inspección ITSE
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">¿Necesitas ampliar tu plan?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Comunícate con el equipo comercial para habilitar más tableros, usuarios concurrentes o módulos de subestaciones.
            </p>
          </div>
          <a
            href="mailto:ventas@voltguard.pe?subject=Consulta%20Plan%20VoltGuard"
            className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#0797d5] hover:underline"
          >
            <Mail size={14} />
            <span>Contactar a Ventas (ventas@voltguard.pe)</span>
          </a>
        </div>
      </div>

      {/* Modal montado */}
      <ActivateLicenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleActivationSuccess}
      />
    </div>
  );
};