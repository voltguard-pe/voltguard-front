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
      // Aquí llamas a tu backend:
      // const res = await createLicenseApi({ companyCode: selectedCompany, plan: selectedPlan, durationMonths });
      
      // Simulación de respuesta de backend:
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
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-slate-900 text-white">
          <KeyRound size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Emisión Manual de Licencias</h1>
          <p className="text-xs text-slate-500">Genera accesos para clientes que coordinaron con el equipo comercial</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Emisión */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 space-y-5 shadow-xs">
          {/* Empresa */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Empresa Cliente</label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Código de empresa o RUC (ej: COMP-8921)"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-[#0797d5] focus:ring-2 focus:ring-[#0797d5]/10"
              />
            </div>
          </div>

          {/* Selector de Plan */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Plan Adquirido</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                    selectedPlan === plan.id
                      ? "border-[#0797d5] bg-[#0797d5]/5 ring-2 ring-[#0797d5]/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <p className="text-xs font-bold text-slate-800">{plan.name}</p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-tight">{plan.limit}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Vigencia */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Duración de la Suscripción</label>
            <div className="flex items-center gap-3">
              {[1, 3, 6, 12].map((months) => (
                <button
                  key={months}
                  type="button"
                  onClick={() => setDurationMonths(months)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                    durationMonths === months
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {months} {months === 1 ? "Mes" : "Meses"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateLicense}
            disabled={isGenerating}
            className="w-full rounded-xl bg-[#0797d5] hover:bg-[#0680b5] py-2.5 text-xs font-bold text-white transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? "Generando clave..." : "Generar Clave de Licencia"}
          </button>
        </div>

        {/* Panel de Resultado / Envío */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Licencia Generada</h2>
            <p className="text-[11px] text-slate-500 mb-4">
              Copia esta clave y compártela al cliente por correo o WhatsApp.
            </p>

            {generatedKey ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <span className="text-[10px] text-slate-400 block font-medium">Clave de Activación</span>
                  <p className="font-mono text-sm font-black text-slate-800 tracking-wider select-all mt-0.5">
                    {generatedKey}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shadow-2xs"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>{copied ? "Copiado" : "Copiar clave"}</span>
                  </button>
                  <button
                    onClick={() => alert("Simulando envío de correo al cliente...")}
                    className="flex items-center justify-center p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0797d5] hover:bg-slate-100 transition-all cursor-pointer shadow-2xs"
                    title="Enviar por correo directo"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-400">
                <KeyRound size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs">No hay clave activa para mostrar</p>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200/80 p-2.5 rounded-xl mt-6">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            <p>La clave expira automáticamente una vez canjeada o al vencer el plazo configurado.</p>
          </div>
        </div>
      </div>
    </div>
  );
};