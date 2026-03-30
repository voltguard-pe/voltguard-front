import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { CompanyCreateDTO } from "../../../shared/types/CompanyProps";

const CompanyFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = !!id;

  const [form, setForm] = useState<CompanyCreateDTO>({
    name: "",
  });

  useEffect(() => {
    if (isEdit) {
      setForm({ name: "Recoleta" });
    }
  }, [id]);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    console.log(isEdit ? "EDIT" : "CREATE", form);

    navigate("/dashboard/companies");
  };

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">
        {isEdit ? "Editar empresa" : "Crear empresa"}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
        <input
          className="input"
          placeholder="Nombre"
          value={form.name}
          onChange={(e) =>
            setForm({ name: e.target.value })
          }
        />

        <button className="btn-primary w-full">
          Guardar
        </button>
      </form>
    </div>
  );
};

export default CompanyFormPage;