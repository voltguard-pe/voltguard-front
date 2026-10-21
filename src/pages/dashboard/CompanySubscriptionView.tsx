// src/pages/dashboard/CompanySubscriptionView.tsx
import { Check, Clock, KeyRound, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { ActivateLicenseModal } from "../../components/dashboard/modals/ActivateLicenseModal";

export const CompanySubscriptionView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [currentPlan, setCurrentPlan] = useState("Plan Básico (Gratuito)");
  const [expiresAt, setExpiresAt] = useState("Sin caducidad");

  const handleActivationSuccess = (newPlan: string) => {
    setCurrentPlan(newPlan);
    setExpiresAt("365 días restantes");
  };

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8 animate-fade-in">
      
      {/* ── Header Estilizado con Gradiente ── */}
      <div className="sticky top-0 z-20 rounded-2xl border border-slate-200/80 bg-white/90 shadow-md backdrop-blur-md">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] p-4 px-6 text-white">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 to-transparent" />
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm shadow-sm">
              <Sparkles size={22} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight md:text-xl">Mi Suscripción</h1>
              <p className="text-xs font-medium text-white/90">Administra los beneficios y el estado de tu licencia en VoltGuard</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Banner de Estado Actual ── */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-slate-300">
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5] border border-[#0797d5]/20 shadow-2xs">
            <Sparkles size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-900">{currentPlan}</h2>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-[10px] font-bold text-emerald-700 shadow-2xs">
                Activo
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
              <Clock size={14} className="text-[#0797d5]" />
              <span>Vencimiento: <strong className="text-slate-700">{expiresAt}</strong></span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-xs font-bold text-white hover:bg-[#0680b5] transition-all cursor-pointer shadow-md shadow-[#0797d5]/20 active:scale-95"
        >
          <KeyRound size={16} />
          <span>Canjear Nueva Licencia</span>
        </button>
      </div>

      {/* ── Secciones de Beneficios y Contacto ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#0797d5]" />
            Beneficios Disponibles
          </h3>
          <ul className="space-y-3 text-xs text-slate-600 font-medium">
            <li className="flex items-center gap-2.5 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
              <Check size={16} className="text-emerald-600 shrink-0" /> Monitoreo de tableros eléctricos
            </li>
            <li className="flex items-center gap-2.5 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
              <Check size={16} className="text-emerald-600 shrink-0" /> Registro de pozos a tierra (SPAT)
            </li>
            <li className="flex items-center gap-2.5 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
              <Check size={16} className="text-emerald-600 shrink-0" /> Módulo de documentos e inspección ITSE
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-dashed border-[#0797d5]/40 bg-[#0797d5]/5 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#0797d5]" />
              ¿Necesitas ampliar tu plan?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Comunícate con el equipo comercial para habilitar más tableros, usuarios concurrentes o módulos de subestaciones.
            </p>
          </div>
          <a
            href="mailto:ventas@voltguard.pe?subject=Consulta%20Plan%20VoltGuard"
            className="mt-6 inline-flex items-center justify-center gap-2 text-xs font-bold text-[#0797d5] hover:text-[#0680b5] bg-white border border-[#0797d5]/30 p-3.5 rounded-2xl transition-all shadow-2xs hover:shadow-sm"
          >
            <Mail size={15} />
            <span>Contactar a Ventas (ventas@voltguard.pe)</span>
          </a>
        </div>
      </div>

      {/* Modal de Activación */}
      <ActivateLicenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleActivationSuccess}
      />
    </div>
  );
};

export default CompanySubscriptionView;