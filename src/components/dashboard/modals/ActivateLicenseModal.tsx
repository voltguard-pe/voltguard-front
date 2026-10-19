// src/components/ActivateLicenseModal.tsx
import { AlertCircle, CheckCircle2, Sparkles, X } from "lucide-react";
import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPlan: string) => void;
}

export const ActivateLicenseModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const [licenseKey, setLicenseKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successPlan, setSuccessPlan] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Llamada al endpoint para canjear:
      // const res = await activateLicenseApi({ key: licenseKey.trim() });
      await new Promise((r) => setTimeout(r, 800));

      // Simulación de validación
      if (!licenseKey.startsWith("VG-")) {
        throw new Error("Clave de licencia inválida o expirada");
      }

      const planName = licenseKey.includes("PRO") ? "Plan Profesional" : "Plan Enterprise";
      setSuccessPlan(planName);
      onSuccess(planName);
    } catch (err: any) {
      setError(err.message || "Error al validar la licencia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 rounded-lg p-1"
        >
          <X size={18} />
        </button>

        {successPlan ? (
          <div className="text-center py-4 space-y-3">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900">¡Plan Activado con Éxito!</h3>
            <p className="text-xs text-slate-500">
              Tu cuenta ahora cuenta con los beneficios de <strong className="text-slate-800">{successPlan}</strong>.
            </p>
            <button
              onClick={onClose}
              className="mt-2 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              Comenzar a usar
            </button>
          </div>
        ) : (
          <form onSubmit={handleActivate} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#0797d5]/10 text-[#0797d5]">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Activar Licencia</h3>
                <p className="text-[11px] text-slate-500">Ingresa el código proporcionado por el área comercial</p>
              </div>
            </div>

            <div>
              <input
                type="text"
                placeholder="VG-PRO-XXXX-XXXX"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 font-mono text-center text-xs tracking-widest uppercase outline-none focus:border-[#0797d5] focus:bg-white"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-[11px] text-rose-600">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !licenseKey.trim()}
              className="w-full rounded-xl bg-[#0797d5] py-2.5 text-xs font-bold text-white hover:bg-[#0680b5] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Validando..." : "Desbloquear Funciones"}
            </button>

            <p className="text-center text-[10px] text-slate-400">
              ¿Aún no tienes licencia?{" "}
              <a href="mailto:ventas@voltguard.pe" className="text-[#0797d5] font-semibold underline">
                Contactar a Ventas
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};