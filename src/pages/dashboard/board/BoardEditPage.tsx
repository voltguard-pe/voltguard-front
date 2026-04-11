import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getBoardByCode,
  updateBoard,
} from "../../../services/board.service";
import DragAndDrop from "../../../shared/components/DragAndDrop";
import Input from "../../../shared/components/Input";
import type { BoardResponseDTO } from "../../../shared/types/BoardProps";

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
  const [tensionNominal, setTensionNominal] = useState(0);
  const [numeroFases, setNumeroFases] = useState(1);
  const [incluyeNeutro, setIncluyeNeutro] = useState(false);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [unifilar, setUnifilar] = useState<File[]>([]);
  const [leyenda, setLeyenda] = useState<File[]>([]);
  const [tablero, setTablero] = useState<File[]>([]);
  const [termografia, setTermografia] = useState<File[]>([]);

  const [existingUnifilar, setExistingUnifilar] = useState<string[]>(
    []
  );
  const [existingLeyenda, setExistingLeyenda] = useState<string[]>(
    []
  );
  const [existingTablero, setExistingTablero] = useState<string[]>(
    []
  );
  const [existingTermografia, setExistingTermografia] = useState<
    string[]
  >([]);

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

        const images = data.images || {};

        setExistingUnifilar(images.unifilar || []);
        setExistingLeyenda(images.leyenda || []);
        setExistingTablero(images.tablero || []);
        setExistingTermografia(images.termografia || []);
      } catch (error) {
        console.error("Error cargando board", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [code, publicCode]);

  const renderPreview = (
    files: File[],
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
  ) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
      {files.map((file, index) => {
        const preview = URL.createObjectURL(file);

        return (
          <div key={index} className="relative">
            <img
              src={preview}
              onClick={() => setSelectedImage(preview)}
              className="h-32 w-full object-cover rounded cursor-pointer"
            />
            <button
              type="button"
              onClick={() =>
                setFiles((prev) =>
                  prev.filter((_, i) => i !== index)
                )
              }
              className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );

  const renderExisting = (
    images: string[],
    setImages: React.Dispatch<React.SetStateAction<string[]>>
  ) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
      {images.map((img, index) => {
        const thumb = img.replace(
          "/upload/",
          "/upload/w_300,f_auto/"
        );

        return (
          <div key={index} className="relative">
            <img
              src={thumb}
              onClick={() => setSelectedImage(img)}
              className="h-32 w-full object-cover rounded cursor-pointer"
            />
            <button
              type="button"
              onClick={() =>
                setImages((prev) =>
                  prev.filter((_, i) => i !== index)
                )
              }
              className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!board) return;

    try {
      setSaving(true);

      await updateBoard(publicCode!, code!, {
        name,
        type,
        tensionNominal,
        numeroFases,
        incluyeNeutro,
        location,
        description,
        existingUnifilar,
        existingLeyenda,
        existingTablero,
        existingTermografia,
        unifilar,
        leyenda,
        tablero,
        termografia,
      });

      alert("Tablero actualizado correctamente");
      navigate(`/dashboard/boards/${publicCode}`);
    } catch (error) {
      console.error(error);
      alert("Error al actualizar tablero");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (!board) return <p>No encontrado</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Editar Board
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4"
      >
        <Input
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Tipo"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />

        <Input
          label="Tensión"
          type="number"
          value={String(tensionNominal)}
          onChange={(e) =>
            setTensionNominal(Number(e.target.value))
          }
        />

        <Input
          label="Fases"
          type="number"
          value={String(numeroFases)}
          onChange={(e) =>
            setNumeroFases(Number(e.target.value))
          }
        />

        <Input
          label="Ubicación"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <Input
          label="Descripción"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />

        <label className="flex gap-2">
          <input
            type="checkbox"
            checked={incluyeNeutro}
            onChange={(e) =>
              setIncluyeNeutro(e.target.checked)
            }
          />
          Incluye neutro
        </label>

        <div className="col-span-2">
          <h2>Diagrama unifilar</h2>
          <DragAndDrop multiple onFilesChange={setUnifilar} />
          {renderExisting(
            existingUnifilar,
            setExistingUnifilar
          )}
          {renderPreview(unifilar, setUnifilar)}
        </div>

        <div className="col-span-2">
          <h2>Leyenda</h2>
          <DragAndDrop multiple onFilesChange={setLeyenda} />
          {renderExisting(existingLeyenda, setExistingLeyenda)}
          {renderPreview(leyenda, setLeyenda)}
        </div>

        <div className="col-span-2">
          <h2>Galería</h2>
          <DragAndDrop multiple onFilesChange={setTablero} />
          {renderExisting(existingTablero, setExistingTablero)}
          {renderPreview(tablero, setTablero)}
        </div>

        <div className="col-span-2">
          <h2>Termografía</h2>
          <DragAndDrop
            multiple
            onFilesChange={setTermografia}
          />
          {renderExisting(
            existingTermografia,
            setExistingTermografia
          )}
          {renderPreview(termografia, setTermografia)}
        </div>

        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setSelectedImage(null)}
          >
            <img
              src={selectedImage}
              className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
              onClick={(e) => e.stopPropagation()} // 👈 evita cerrar al hacer click en la imagen
            />

            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-5 right-5 text-white text-2xl"
            >
              ✕
            </button>
          </div>
        )}

        <div className="col-span-2 flex justify-end gap-4">
          <button type="button" onClick={() => navigate(-1)}>
            Cancelar
          </button>

          <button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BoardsEditPage;