import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBoardById, updateBoard } from "../../../services/board.service";
import DragAndDrop from "../../../shared/components/DragAndDrop";
import Input from "../../../shared/components/Input";
import type { BoardResponseDTO, BoardUpdateDTO } from "../../../shared/types/BoardProps";

const BoardsEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [board, setBoard] = useState<BoardResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [tensionNominal, setTensionNominal] = useState<number>(0);
  const [numeroFases, setNumeroFases] = useState<number>(1);
  const [incluyeNeutro, setIncluyeNeutro] = useState(false);

  // Archivos nuevos a subir
  // const [diagrama, setDiagrama] = useState<File | null>(null);
  // const [leyenda, setLeyenda] = useState<File | null>(null);
  const [diagrama, setDiagrama] = useState<File[]>([]);
  const [leyenda, setLeyenda] = useState<File[]>([]);
  const [galeria, setGaleria] = useState<File[]>([]);

  // Archivos existentes a eliminar
  const [filesToDelete, setFilesToDelete] = useState<number[]>([]);

  // Cargar datos del board
  useEffect(() => {
    if (!id) return;
    const fetchBoard = async () => {
      setLoading(true);
      try {
        const data = await getBoardById(Number(id));
        setBoard(data);
        setName(data.name);
        setType(data.type);
        setTensionNominal(data.tensionNominal);
        setNumeroFases(data.numeroFases);
        setIncluyeNeutro(data.incluyeNeutro);
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [id]);

  // Submit de actualización
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!board) return;

    const payload: BoardUpdateDTO = {
      name,
      type,
      tensionNominal,
      numeroFases,
      incluyeNeutro,
    };

    try {
      await updateBoard(board.id, payload, diagrama, leyenda, galeria, filesToDelete);
      alert("Board actualizado correctamente 🚀");
      navigate("/dashboard/boards");
    } catch (error) {
      console.error(error);
      alert("Error al actualizar board");
    }
  };

  if (loading) return <p className="text-gray-500">Cargando...</p>;
  if (!board) return <p className="text-red-500">Board no encontrado</p>;

  const markForDelete = (fileId: number) => {
    setFilesToDelete(prev =>
      prev.includes(fileId) ? prev : [...prev, fileId]
    );

    setBoard(prev =>
      prev
        ? { ...prev, files: prev.files.filter(f => f.id !== fileId) }
        : prev
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Board</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 bg-white p-6 rounded-lg shadow-md">
        {/* Campos de texto */}
        <Input label="Nombre" value={name} onChange={e => setName(e.target.value)} required />
        <Input label="Tipo" value={type} onChange={e => setType(e.target.value)} required />
        <Input
          label="Tensión nominal"
          type="number"
          value={tensionNominal}
          onChange={e => setTensionNominal(Number(e.target.value))}
          required
        />
        <Input
          label="Número de fases sin neutro"
          type="number"
          value={numeroFases}
          onChange={e => setNumeroFases(Number(e.target.value))}
          min={1}
          max={3}
          required
        />

        <label className="flex items-center gap-2 col-span-2">
          <span>¿Incluye fases neutro?</span>
          <input
            type="checkbox"
            checked={incluyeNeutro}
            onChange={e => setIncluyeNeutro(e.target.checked)}
            className="w-4 h-4"
          />
        </label>

        {/* Diagrama */}
        <div className="col-span-2">
          <h2 className="font-semibold mb-1">Diagrama unifilar</h2>
          {/* <DragAndDrop onFilesChange={(files) => setDkiagrama(files[0])} /> */}
          <DragAndDrop multiple onFilesChange={(files) => setDiagrama(prev => [...prev, ...files])} />
          {board.files
            .filter(f => f.fileType === "DIAGRAMA" && !filesToDelete.includes(f.id))
            .map(f => (
              <div key={f.id} className="relative w-48 h-48 mt-2">
                <img src={f.url} alt={f.filename} className="w-full h-full object-cover rounded border" />
                {/* <button
                  type="button"
                  onClick={() => setFilesToDelete(prev => [...prev, f.id])}
                  className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs hover:bg-red-700"
                >
                  ×
                </button> */}

                <button
                  type="button"
                  onClick={() => markForDelete(f.id)}

                  className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs hover:bg-red-700"
                >
                  ×
                </button>

              </div>
            ))}
        </div>

        {/* Leyenda */}
        <div className="col-span-2">
          <h2 className="font-semibold mb-1">Leyenda</h2>
          {/* <DragAndDrop onFilesChange={(files) => setLeyenda(files[0])} /> */}
          <DragAndDrop multiple onFilesChange={(files) => setLeyenda(prev => [...prev, ...files])} />
          {board.files
            .filter(f => f.fileType === "LEYENDA" && !filesToDelete.includes(f.id))
            .map(f => (
              <div key={f.id} className="relative w-48 h-48 mt-2">
                <img src={f.url} alt={f.filename} className="w-full h-full object-cover rounded border" />
                {/* <button
                  type="button"
                  onClick={() => setFilesToDelete(prev => [...prev, f.id])}
                  className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs hover:bg-red-700"
                >
                  ×
                </button> */}

                <button
                  type="button"
                  onClick={() => markForDelete(f.id)}

                  className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs hover:bg-red-700"
                >
                  ×
                </button>

              </div>
            ))}
        </div>

        {/* Galería */}
        <div className="col-span-2">
          <h2 className="font-semibold mb-1">Galería</h2>
          <DragAndDrop multiple onFilesChange={(files) =>
            setGaleria(prev => [...prev, ...files])
          } />
          <div className="flex flex-wrap gap-2 mt-2">
            {/* Archivos existentes */}
            {board.files
              .filter(f => f.fileType === "GALERIA" && !filesToDelete.includes(f.id))
              .map(f => (
                <div key={f.id} className="relative w-24 h-24">
                  <img src={f.url} alt={f.filename} className="w-full h-full object-cover rounded border" />
                  {/* <button
                    type="button"
                    onClick={() => setFilesToDelete(prev => [...prev, f.id])}
                    className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs hover:bg-red-700"
                  >
                    ×
                  </button> */}

                  <button
                    type="button"
                    onClick={() => markForDelete(f.id)}

                    className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs hover:bg-red-700"
                  >
                    ×
                  </button>

                </div>
              ))}

            {/* Archivos nuevos seleccionados */}
            {galeria.map(file => (
              <div key={file.name} className="relative w-24 h-24">
                <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover rounded border" />
                <button
                  type="button"
                  onClick={() => setGaleria(prev => prev.filter(f => f.name !== file.name))}
                  className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs hover:bg-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Botones */}
        <div className="col-span-2 flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard/boards")}
            className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Actualizar
          </button>
        </div>
      </form>
    </div>
  );
};

export default BoardsEditPage;
