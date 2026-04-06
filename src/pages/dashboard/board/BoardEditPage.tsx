import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBoardByCode, updateBoard } from "../../../services/board.service";
import Input from "../../../shared/components/Input";
import type {
  BoardResponseDTO,
  BoardUpdateDTO,
} from "../../../shared/types/BoardProps";

const BoardsEditPage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const [board, setBoard] = useState<BoardResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [tensionNominal, setTensionNominal] = useState<number>(0);
  const [numeroFases, setNumeroFases] = useState<number>(1);
  const [incluyeNeutro, setIncluyeNeutro] = useState(false);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState("");

  useEffect(() => {
    if (!code) return;

    const fetchBoard = async () => {
      try {
        setLoading(true);
        const data: BoardResponseDTO = await getBoardByCode(code);

        setBoard(data);
        setName(data.name || "");
        setType(data.type || "");
        setTensionNominal(data.tensionNominal || 0);
        setNumeroFases(data.numeroFases || 1);
        setIncluyeNeutro(Boolean(data.incluyeNeutro));
        setLocation(data.location || "");
        setDescription(data.description || "");
        setImages(Array.isArray(data.images) ? data.images.join("\n") : "");
      } catch (error) {
        console.error("Error cargando board", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [code]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!board) return;

    const payload: BoardUpdateDTO = {
      name: name.trim(),
      type: type.trim(),
      tensionNominal,
      numeroFases,
      incluyeNeutro,
      location: location.trim(),
      description: description.trim(),
      images: images
        .split("\n")
        .map((img) => img.trim())
        .filter(Boolean),
    };

    try {
      setSaving(true);
      await updateBoard(board.code, payload);
      alert("Tablero actualizado correctamente");
      navigate("/dashboard/boards");
    } catch (error) {
      console.error("Error actualizando board", error);
      alert("Error al actualizar tablero");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Cargando tablero...</p>;
  }

  if (!board) {
    return <p className="text-red-500">Tablero no encontrado</p>;
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-4 text-2xl font-bold">Editar tablero</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 rounded-lg bg-white p-6 shadow-md md:grid-cols-2"
      >
        <Input
          label="Nombre"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Tipo"
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        />

        <Input
          label="Tensión nominal"
          name="tensionNominal"
          type="number"
          value={tensionNominal}
          onChange={(e) => setTensionNominal(Number(e.target.value))}
          required
          min={0}
        />

        <Input
          label="Número de fases"
          name="numeroFases"
          type="number"
          value={numeroFases}
          onChange={(e) => setNumeroFases(Number(e.target.value))}
          required
          min={1}
        />

        <Input
          label="Ubicación"
          name="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ej. Pabellón A"
          className="md:col-span-2"
        />

        <label className="flex items-center gap-2 md:col-span-2">
          <span className="text-sm font-medium text-gray-700">
            ¿Incluye neutro?
          </span>
          <input
            type="checkbox"
            checked={incluyeNeutro}
            onChange={(e) => setIncluyeNeutro(e.target.checked)}
            className="h-4 w-4"
          />
        </label>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200"
            placeholder="Describe el tablero"
          />
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">
            Imágenes
          </label>
          <textarea
            value={images}
            onChange={(e) => setImages(e.target.value)}
            rows={6}
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200"
            placeholder={
              "Una URL por línea\nhttps://ejemplo.com/imagen1.jpg\nhttps://ejemplo.com/imagen2.jpg"
            }
          />
          <p className="text-xs text-gray-500">
            Ingresa una URL de imagen por línea.
          </p>
        </div>

        {images.trim() && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 md:col-span-2">
            {images
              .split("\n")
              .map((img) => img.trim())
              .filter(Boolean)
              .map((img, index) => (
                <div
                  key={`${img}-${index}`}
                  className="overflow-hidden rounded-lg border border-gray-200"
                >
                  <img
                    src={img}
                    alt={`preview-${index}`}
                    className="h-40 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              ))}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-4 md:col-span-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard/boards")}
            className="rounded-lg bg-gray-400 px-4 py-2 text-white hover:bg-gray-500"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BoardsEditPage;