import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBoardByCode, updateBoard } from "../../../services/board.service";
import type {
  BoardResponseDTO,
  BoardUpdateDTO,
} from "../../../shared/types/BoardProps";

const BoardDetailPage = () => {
  const navigate = useNavigate();
  const { publicCode, code } = useParams();

  const [board, setBoard] = useState<BoardResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState<BoardUpdateDTO>({
    name: "",
    type: "",
    tensionNominal: 0,
    numeroFases: 0,
    incluyeNeutro: false,
    location: "",
    description: "",
    images: [],
  });

  const fetchBoardDetail = async () => {
    if (!code || !publicCode) {
      setError("Faltan parámetros en la URL");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const data = await getBoardByCode(publicCode, code);

      const boardCompanyPublicCode =
        typeof data.company === "object" && data.company !== null
          ? data.company.publicCode
          : undefined;

      if (boardCompanyPublicCode && boardCompanyPublicCode !== publicCode) {
        setError("El tablero no pertenece a la empresa seleccionada");
        setBoard(null);
        return;
      }

      setBoard(data);
      setForm({
        name: data.name,
        type: data.type,
        tensionNominal: data.tensionNominal,
        numeroFases: data.numeroFases,
        incluyeNeutro: data.incluyeNeutro,
        location: data.location || "",
        description: data.description || "",
        images: data.images || [],
      });
    } catch (err) {
      console.error("Error cargando detalle del tablero", err);
      setError("No se pudo cargar el tablero");
      setBoard(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardDetail();
  }, [code, publicCode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.currentTarget;

    if (e.currentTarget instanceof HTMLInputElement && e.currentTarget.type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: e.currentTarget.checked,
      }));
      return;
    }

    if (name === "tensionNominal" || name === "numeroFases") {
      setForm((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : Number(value),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicCode || !code) {
      setError("Faltan parámetros para actualizar");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const response = await updateBoard(publicCode, code, form);

      setBoard(response.board);
      setSuccessMessage("Tablero actualizado correctamente");
    } catch (err) {
      console.error("Error actualizando tablero", err);
      setError("No se pudo actualizar el tablero");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando detalle...</p>;
  }

  if (error && !board) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  const companyName =
    typeof board?.company === "object" && board.company !== null
      ? board.company.name
      : "Sin empresa";

  return (
    <section className="flex flex-col gap-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/dashboard/boards/${publicCode}`)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={18} />
          Volver
        </button>
      </div>

      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          {form.name || "Editar tablero"}
        </h1>
        <p className="text-sm text-gray-500">Empresa: {companyName}</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm p-5 space-y-5"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              className="rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nombre del tablero"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Tipo</label>
            <input
              type="text"
              name="type"
              value={form.type || ""}
              onChange={handleChange}
              className="rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Tipo de tablero"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Tensión nominal
            </label>
            <input
              type="number"
              name="tensionNominal"
              value={form.tensionNominal ?? 0}
              onChange={handleChange}
              className="rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="220"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Número de fases
            </label>
            <input
              type="number"
              name="numeroFases"
              value={form.numeroFases ?? 0}
              onChange={handleChange}
              className="rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="3"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Ubicación
            </label>
            <input
              type="text"
              name="location"
              value={form.location || ""}
              onChange={handleChange}
              className="rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ubicación del tablero"
            />
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <input
              id="incluyeNeutro"
              type="checkbox"
              name="incluyeNeutro"
              checked={!!form.incluyeNeutro}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <label
              htmlFor="incluyeNeutro"
              className="text-sm font-medium text-gray-700"
            >
              Incluye neutro
            </label>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              name="description"
              value={form.description || ""}
              onChange={handleChange}
              rows={4}
              className="rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Descripción del tablero"
            />
          </div>
        </div>

        {form.images && form.images.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-800">Imágenes</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {form.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Tablero ${form.name} ${index + 1}`}
                  className="h-56 w-full rounded-lg border object-cover"
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default BoardDetailPage;