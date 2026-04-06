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
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [diagrama, setDiagrama] = useState<File[]>([]);
  const [leyenda, setLeyenda] = useState<File[]>([]);
  const [galeria, setGaleria] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload: BoardCreateDTO = {
      name,
      type,
      tensionNominal,
      numeroFases,
      incluyeNeutro,
      location,
      description,
    };

    try {
      await createBoard({
        ...payload,
        diagrama,
        leyenda,
        galeria,
      });

      alert("Board creado correctamente 🚀");

      setName("");
      setType("");
      setTensionNominal(0);
      setNumeroFases(1);
      setIncluyeNeutro(false);
      setLocation("");
      setDescription("");
      setDiagrama([]);
      setLeyenda([]);
      setGaleria([]);
    } catch (error) {
      console.error(error);
      alert("Error al crear el board");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Crear Board</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 bg-white p-6 rounded-lg shadow-md"
      >
        <Input
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Tipo"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        />

        <Input
          label="Tensión nominal"
          type="number"
          value={String(tensionNominal)}
          onChange={(e) => setTensionNominal(Number(e.target.value))}
          required
        />

        <Input
          label="Número de fases"
          type="number"
          value={String(numeroFases)}
          onChange={(e) => setNumeroFases(Number(e.target.value))}
          required
        />

        <Input
          label="Ubicación"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <Input
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="flex items-center gap-2 col-span-2">
          <span>¿Incluye neutro?</span>
          <input
            type="checkbox"
            checked={incluyeNeutro}
            onChange={(e) => setIncluyeNeutro(e.target.checked)}
            className="w-4 h-4"
          />
        </label>

        <div className="col-span-2">
          <h2 className="font-semibold mb-1">Diagrama unifilar</h2>
          <DragAndDrop multiple onFilesChange={(files) => setDiagrama(files)} />
          {diagrama.length > 0 && (
            <ul className="text-sm mt-1 list-disc list-inside">
              {diagrama.map((file) => (
                <li key={file.name}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="col-span-2">
          <h2 className="font-semibold mb-1">Leyenda</h2>
          <DragAndDrop multiple onFilesChange={(files) => setLeyenda(files)} />
          {leyenda.length > 0 && (
            <ul className="text-sm mt-1 list-disc list-inside">
              {leyenda.map((file) => (
                <li key={file.name}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>

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
              setLocation("");
              setDescription("");
              setDiagrama([]);
              setLeyenda([]);
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