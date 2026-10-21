import { ArrowLeft, Save, Sun } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const NewSolarInstallationView = () => {
  const { companyCode } = useParams<{ companyCode: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    capacityKwp: "",
    panelsCount: "",
    panelBrand: "",
    inverterBrand: "",
    tiltAngle: "15",
    azimuth: "0",
    installationType: "ROOFTOP", // ROOFTOP, GROUND, CARPORT
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Llamada al endpoint para registrar instalación:
      // await createSolarInstallation(companyCode, formData);
      await new Promise((r) => setTimeout(r, 600));
      navigate(`/dashboard/companies/${companyCode}/solar`);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Botón Volver */}
      <button
        onClick={() => navigate(`/dashboard/companies/${companyCode}/solar`)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} />
        <span>Volver a Paneles Solares</span>
      </button>

      {/* Cabecera */}
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xs">
          <Sun size={22} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Registrar Arreglo Solar</h1>
          <p className="text-xs text-slate-500">Agrega una nueva matriz fotovoltaica para la empresa {companyCode}</p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Código del Arreglo *</label>
            <input
              type="text"
              required
              placeholder="ej: PV-ARRAY-04"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Nombre Descriptivo *</label>
            <input
              type="text"
              required
              placeholder="ej: Techo Nave Almacén Principal"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Capacidad Pico (kWp) *</label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="ej: 75.5"
              value={formData.capacityKwp}
              onChange={(e) => setFormData({ ...formData, capacityKwp: e.target.value })}
              className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Número de Módulos (Paneles) *</label>
            <input
              type="number"
              required
              placeholder="ej: 140"
              value={formData.panelsCount}
              onChange={(e) => setFormData({ ...formData, panelsCount: e.target.value })}
              className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Marca / Modelo de Inversor</label>
            <input
              type="text"
              placeholder="ej: Huawei SUN2000-50KTL"
              value={formData.inverterBrand}
              onChange={(e) => setFormData({ ...formData, inverterBrand: e.target.value })}
              className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Tipo de Montaje</label>
            <select
              value={formData.installationType}
              onChange={(e) => setFormData({ ...formData, installationType: e.target.value })}
              className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs outline-none focus:border-amber-500 bg-white"
            >
              <option value="ROOFTOP">Cubierta / Techo (Rooftop)</option>
              <option value="GROUND">Estructura en Suelo (Ground Mounted)</option>
              <option value="CARPORT">Carport / Marquesina Solar</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`/dashboard/companies/${companyCode}/solar`)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-amber-600 hover:bg-amber-700 px-5 py-2 text-xs font-bold text-white transition-all shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
          >
            <Save size={14} />
            <span>{saving ? "Registrando..." : "Guardar Instalación"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};