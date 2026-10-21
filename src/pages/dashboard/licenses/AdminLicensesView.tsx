// src/pages/dashboard/AdminLicensesView.tsx
import { AlertTriangle, Building2, Check, Copy, KeyRound, Send } from "lucide-react";
import { useState } from "react";

const PLANS = [
  { id: "BASIC", name: "Plan Básico", color: "border-slate-300 text-slate-700", limit: "3 Tableros, 1 Pozo" },
  { id: "PRO", name: "Plan Profesional", color: "border-[#0797d5] text-[#0797d5]", limit: "Tableros Ilimitados, 10 Pozos, ITSE" },
  { id: "ENTERPRISE", name: "Plan Enterprise", color: "border-indigo-600 text-indigo-600", limit: "Todo ilimitado + Soporte 24/7" },
];

export const AdminLicensesView = () => {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("PRO");
  const [durationMonths, setDurationMonths] = useState(12);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generador visual de claves tipo: VG-PRO-A89F-9021
  const handleGenerateLicense = async () => {
    if (!selectedCompany) return alert("Selecciona una empresa");
    setIsGenerating(true);

    try {
      await new Promise((r) => setTimeout(r, 600));
      const randomSegment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
      const mockKey = `VG-${selectedPlan}-${randomSegment()}-${randomSegment()}`;
      setGeneratedKey(mockKey);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8 animate-fade-in">
      
      {/* ── Header Estilizado con Gradiente ── */}
      <div className="sticky top-0 z-20 rounded-2xl border border-slate-200/80 bg-white/90 shadow-md backdrop-blur-md">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] p-4 px-6 text-white">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 to-transparent" />
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm shadow-sm">
              <KeyRound size={22} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight md:text-xl">Emisión Manual de Licencias</h1>
              <p className="text-xs font-medium text-white/90">Genera accesos para clientes que coordinaron con el equipo comercial</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulario de Emisión */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 space-y-5 shadow-sm">
          
          {/* Empresa */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Empresa Cliente</label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Código de empresa o RUC (ej: COMP-8921)"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-3 text-xs outline-none focus:border-[#0797d5] focus:ring-2 focus:ring-[#0797d5]/10 font-medium text-slate-800 transition-all bg-slate-50/50 focus:bg-white"
              />
            </div>
          </div>

          {/* Selector de Plan */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Plan Adquirido</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                    selectedPlan === plan.id
                      ? "bg-gradient-to-r from-[#0797d5] to-[#0680b5] text-white border-transparent shadow-md shadow-[#0797d5]/25"
                      : "border-slate-200/80 hover:border-[#0797d5]/40 hover:bg-[#0797d5]/5 bg-white"
                  }`}
                >
                  <p className={`text-xs font-bold ${selectedPlan === plan.id ? "text-white" : "text-slate-800"}`}>{plan.name}</p>
                  <p className={`text-[10px] mt-1 leading-tight ${selectedPlan === plan.id ? "text-white/90" : "text-slate-500"}`}>{plan.limit}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Vigencia */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Duración de la Suscripción</label>
            <div className="flex items-center gap-3">
              {[1, 3, 6, 12].map((months) => (
                <button
                  key={months}
                  type="button"
                  onClick={() => setDurationMonths(months)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${
                    durationMonths === months
                      ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                      : "border-slate-200 text-slate-600 hover:border-[#0797d5]/40 hover:bg-[#0797d5]/5"
                  }`}
                >
                  {months} {months === 1 ? "Mes" : "Meses"}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateLicense}
            disabled={isGenerating}
            className="w-full rounded-2xl bg-[#0797d5] hover:bg-[#0680b5] py-3.5 text-xs font-bold text-white transition-all shadow-md shadow-[#0797d5]/20 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? "Generando clave..." : "Generar Clave de Licencia"}
          </button>
        </div>

        {/* Panel de Resultado / Envío */}
        <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Licencia Generada</h2>
            <p className="text-[11px] text-slate-500 mb-4">
              Copia esta clave y compártela al cliente por correo o WhatsApp.
            </p>

            {generatedKey ? (
              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Clave de Activación</span>
                  <p className="font-mono text-sm font-black text-[#0797d5] tracking-wider select-all mt-1">
                    {generatedKey}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:border-[#0797d5]/40 hover:bg-[#0797d5]/5 transition-all cursor-pointer shadow-2xs"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>{copied ? "Copiado" : "Copiar clave"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Simulando envío de correo al cliente...")}
                    className="flex items-center justify-center p-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0797d5] hover:border-[#0797d5]/40 hover:bg-[#0797d5]/5 transition-all cursor-pointer shadow-2xs"
                    title="Enviar por correo directo"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-slate-300 rounded-2xl p-6 text-center text-slate-400 bg-white/50">
                <KeyRound size={28} className="mx-auto mb-2 opacity-40 text-[#0797d5]" />
                <p className="text-xs font-medium">No hay clave activa para mostrar</p>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2.5 text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 p-3.5 rounded-2xl mt-6">
            <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
            <p className="font-medium leading-relaxed">La clave expira automáticamente una vez canjeada o al vencer el plazo configurado.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLicensesView;