import { useState } from "react";
import { createBoard } from "../../../services/board.service";
import DragAndDrop from "../../../shared/components/DragAndDrop";
import Input from "../../../shared/components/Input";
import type { BoardCreateDTO } from "../../../shared/types/BoardProps";

const BoardsCreatePage = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [tensionNominal, setTensionNominal] = useState<number>(0);
  const [numeroFases, setNumeroFases] = useState<number>(1);
  const [incluyeNeutro, setIncluyeNeutro] = useState(false);

  // const [diagrama, setDiagrama] = useState<File | null>(null);
  // const [leyenda, setLeyenda] = useState<File | null>(null);
  const [diagrama, setDiagrama] = useState<File[]>([]);
  const [leyenda, setLeyenda] = useState<File[]>([]);
  const [galeria, setGaleria] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Crear DTO tipado
    const payload: BoardCreateDTO = {
      name,
      type,
      tensionNominal,
      numeroFases,
      incluyeNeutro,
    };

    try {
      await createBoard(payload, diagrama, leyenda, galeria);
      alert("Board creado correctamente 🚀");

      // Resetear formulario
      setName("");
      setType("");
      setTensionNominal(0);
      setNumeroFases(1);
      setIncluyeNeutro(false);
      setDiagrama(null);
      setLeyenda(null);
      setGaleria([]);
    } catch (error) {
      console.error(error);
      alert("Error al crear el board");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Crear Board</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 bg-white p-6 rounded-lg shadow-md">
        {/* Nombre */}
        <Input
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Tipo */}
        <Input
          label="Tipo"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        />

        {/* Tensión nominal */}
        <Input
          label="Tensión nominal"
          type="number"
          value={tensionNominal}
          onChange={(e) => setTensionNominal(Number(e.target.value))}
          required
        />

        {/* Número de fases */}
        <Input
          label="Número de fases sin neutro"
          type="number"
          value={numeroFases}
          onChange={(e) => setNumeroFases(Number(e.target.value))}
          required
        />

        {/* Incluye neutro */}
        <label className="flex items-center gap-2 col-span-2">
          <span>¿Incluye fases neutro?</span>
          <input
            type="checkbox"
            checked={incluyeNeutro}
            onChange={(e) => setIncluyeNeutro(e.target.checked)}
            className="w-4 h-4"
          />
        </label>

        {/* Diagrama */}
        <div className="col-span-2">
          <h2 className="font-semibold mb-1">Diagrama unifilar</h2>
          {/* <DragAndDrop onFilesChange={(files) => setDiagrama(files[0])} /> */}
          {/* {diagrama && <p className="text-sm mt-1">{diagrama.name}</p>} */}
          <DragAndDrop multiple onFilesChange={(files) => setDiagrama(files)} />
          {diagrama.length > 0 && (
            <ul className="text-sm mt-1 list-disc list-inside">
              {diagrama.map((file) => (
                <li key={file.name}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Leyenda */}
        <div className="col-span-2">
          <h2 className="font-semibold mb-1">Leyenda</h2>
          {/* <DragAndDrop onFilesChange={(files) => setLeyenda(files[0])} /> */}
          {/* {leyenda && <p className="text-sm mt-1">{leyenda.name}</p>} */}
          <DragAndDrop multiple onFilesChange={(files) => setLeyenda(files)} />
          {leyenda.length > 0 && (
            <ul className="text-sm mt-1 list-disc list-inside">
              {leyenda.map((file) => (
                <li key={file.name}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Galería */}
        <div className="col-span-2">
          <h2 className="font-semibold mb-1">Galería</h2>
          <DragAndDrop multiple onFilesChange={(files) => setGaleria(files)} />
          {galeria.length > 0 && (
            <ul className="text-sm mt-1 list-disc list-inside">
              {galeria.map((file) => (
                <li key={file.name}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Botones */}
        <div className="col-span-2 flex justify-end gap-4 mt-4">
          <button
            type="button"
            className="w-full md:w-auto bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition"
            onClick={() => {
              setName("");
              setType("");
              setTensionNominal(0);
              setNumeroFases(1);
              setIncluyeNeutro(false);
              setDiagrama(null);
              setLeyenda(null);
              setGaleria([]);
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="w-full md:w-auto bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default BoardsCreatePage;
