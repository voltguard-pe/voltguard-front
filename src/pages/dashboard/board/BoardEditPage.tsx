import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCompanyBoardById,
  updateBoard,
} from "../../../services/board.service";
import Input from "../../../shared/components/Input";
import type {
  BoardResponseDTO,
  BoardUpdateDTO,
} from "../../../shared/types/BoardProps";

const BoardsEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [board, setBoard] = useState<BoardResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string>("");

  useEffect(() => {
    if (!id) return;

    const fetchBoard = async () => {
      try {
        setLoading(true);
        const data = await getCompanyBoardById(id);
        setBoard(data);
        setName(data.name);
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
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!board) return;

    const payload: BoardUpdateDTO = {
      name: name.trim(),
      location: location.trim(),
      description: description.trim(),
      images: images
        .split("\n")
        .map((img) => img.trim())
        .filter(Boolean),
    };

    try {
      setSaving(true);
      await updateBoard(board._id, payload);
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
        className="grid grid-cols-1 gap-4 rounded-lg bg-white p-6 shadow-md"
      >
        <Input
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Ubicación"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ej. Pabellón A"
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
            placeholder="Describe el tablero"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Imágenes
          </label>
          <textarea
            value={images}
            onChange={(e) => setImages(e.target.value)}
            rows={6}
            className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500"
            placeholder={"Una URL por línea\nhttps://ejemplo.com/imagen1.jpg\nhttps://ejemplo.com/imagen2.jpg"}
          />
          <p className="text-xs text-gray-500">
            Ingresa una URL de imagen por línea.
          </p>
        </div>

        {images.trim() && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

        <div className="mt-4 flex justify-end gap-4">
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