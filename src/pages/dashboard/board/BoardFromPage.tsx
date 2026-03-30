import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { BoardCreateDTO } from "../../../shared/types/BoardProps";

const BoardFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = !!id;

  const [form, setForm] = useState<BoardCreateDTO>({
    name: "",
    location: "",
    description: "",
    images: [],
  });

  useEffect(() => {
    if (isEdit) {
      setForm({
        name: "T. Transferencia",
        location: "Piso 1",
        description: "Demo",
        images: [],
      });
    }
  }, [id]);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    console.log(isEdit ? "EDIT" : "CREATE", form);

    navigate("/dashboard/boards");
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">
        {isEdit ? "Editar tablero" : "Crear tablero"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-4"
      >
        <input
          className="input"
          placeholder="Nombre"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          className="input"
          placeholder="Ubicación"
          value={form.location}
          onChange={(e) =>
            setForm({ ...form, location: e.target.value })
          }
        />

        <textarea
          className="input"
          placeholder="Descripción"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <button className="btn-primary w-full">
          Guardar
        </button>
      </form>
    </div>
  );
};

export default BoardFormPage;