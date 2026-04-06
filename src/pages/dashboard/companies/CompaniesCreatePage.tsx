import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../shared/components/Input";
import { createCompany } from "../../../services/company.service";

const CompaniesCreatePage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [ruc, setRuc] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      await createCompany({
        name: name.trim(),
        ruc: ruc.trim(),
      });

      alert("Empresa creada correctamente 🚀");
      navigate("/dashboard/companies");
    } catch (error) {
      console.error("Error al crear empresa", error);
      alert("Error al crear empresa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm">
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        Crear Empresa
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
            disabled={loading}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Creando..." : "Crear empresa"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CompaniesCreatePage;