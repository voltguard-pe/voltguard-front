import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBoardByCode, updateBoard } from "../../../services/board.service";
import DragAndDrop from "../../../shared/components/DragAndDrop";
import Input from "../../../shared/components/Input";
import type {
  BoardResponseDTO
} from "../../../shared/types/BoardProps";

const BoardsEditPage = () => {
  const { publicCode, code } = useParams<{
    publicCode: string;
    code: string;
  }>();
  const navigate = useNavigate();

  const [board, setBoard] = useState<BoardResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [tensionNominal, setTensionNominal] = useState<number>(0);
  const [numeroFases, setNumeroFases] = useState<number>(1);
  const [incluyeNeutro, setIncluyeNeutro] = useState(false);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [galeria, setGaleria] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    if (!code || !publicCode) return;

    const fetchBoard = async () => {
      try {
        setLoading(true);

        const data = await getBoardByCode(publicCode, code);

        setBoard(data);
        setName(data.name || "");
        setType(data.type || "");
        setTensionNominal(data.tensionNominal || 0);
        setNumeroFases(data.numeroFases || 1);
        setIncluyeNeutro(Boolean(data.incluyeNeutro));
        setLocation(data.location || "");
        setDescription(data.description || "");
        setExistingImages(data.images || []);
      } catch (error) {
        console.error("Error cargando board", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [code, publicCode]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!board) return;

    const formData = new FormData();

    formData.append("name", name);
    formData.append("type", type);
    formData.append("tensionNominal", String(tensionNominal));
    formData.append("numeroFases", String(numeroFases));
    formData.append("incluyeNeutro", String(incluyeNeutro));
    formData.append("location", location);
    formData.append("description", description);

    // imágenes existentes (las que NO borraste)
    existingImages.forEach((img) => {
      formData.append("existingImages", img);
    });

    // nuevas imágenes
    galeria.forEach((file) => {
      formData.append("tablero", file);
    });


    try {
      setSaving(true);
      await updateBoard(publicCode!, code!, formData);

      alert("Tablero actualizado correctamente");
      navigate(`/dashboard/boards/${publicCode}`);
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
          <div className="col-span-2">
            <h2 className="font-semibold mb-1">Galería</h2>

            <DragAndDrop multiple onFilesChange={(files) => setGaleria(files)} />

            {/* EXISTENTES */}
            {existingImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {/* {existingImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img}
                      className="h-32 w-full object-cover rounded"
                    />
                    <button
                    type="button"
                      onClick={() =>
                        setExistingImages(prev => prev.filter((_, i) => i !== index))
                      }
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded"
                    >
                      X
                    </button>
                  </div>
                ))} */}

                {existingImages.map((img, index) => {
                  const thumb = img.replace(
                    "/upload/",
                    "/upload/w_300,f_auto/"
                  );

                  return (
                    <div key={index} className="relative">
                      <img
                        src={thumb}
                        loading="lazy"
                        onClick={() => setSelectedImage(img)} // 👈 original HD
                        className="h-32 w-full object-cover rounded cursor-pointer hover:opacity-80"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setExistingImages(prev => prev.filter((_, i) => i !== index))
                        }
                        className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded"
                      >
                        X
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* NUEVAS */}
            {galeria.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {/* {galeria.map((file, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(file)}
                    className="h-32 w-full object-cover rounded"
                  />
                ))} */}
                {galeria.map((file, index) => {
                  const preview = URL.createObjectURL(file);

                  return (
                    <img
                      key={index}
                      src={preview}
                      className="h-32 w-full object-cover rounded"
                      onLoad={() => URL.revokeObjectURL(preview)} // 👈 limpia memoria
                    />
                  );
                })}
              </div>
            )}

            {selectedImage && (
              <div
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                onClick={() => setSelectedImage(null)}
              >
                <img
                  src={selectedImage} // ORIGINAL HD
                  className="max-h-[90vh] max-w-[90vw] rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />

                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-5 right-5 text-white text-2xl"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-4 md:col-span-2">
          <button
            type="button"
            onClick={() => navigate(`/dashboard/boards/${publicCode}`)}
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