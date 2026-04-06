import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../../../shared/components/Input";
import {
  getCompanyByCode,
  updateCompany,
} from "../../../services/company.service";

const CompaniesEditPage = () => {
  const { publicCode } = useParams<{ publicCode: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [ruc, setRuc] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!publicCode) {
      setLoading(false);
      return;
    }

    const fetchCompany = async () => {
      try {
        const data = await getCompanyByCode(publicCode);
        setName(data.name || "");
        setRuc(data.ruc || "");
      } catch (error) {
        console.error("Error al cargar empresa", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [publicCode]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!publicCode) return;

    try {
      setSaving(true);

      await updateCompany(publicCode, {
        name: name.trim(),
        ruc: ruc.trim(),
      });

      alert("Empresa actualizada correctamente 🚀");
      navigate("/dashboard/companies");
    } catch (error) {
      console.error("Error al actualizar empresa", error);
      alert("Error al actualizar empresa");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando empresa...</p>;
  }

  return (
    <section className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm">
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        Editar Empresa
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <Input
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="col-span-2"
        />

        <Input
          label="RUC"
          value={ruc}
          onChange={(e) => setRuc(e.target.value)}
          className="col-span-2"
        />

        <div className="col-span-2 flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard/companies")}
            className="px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CompaniesEditPage;