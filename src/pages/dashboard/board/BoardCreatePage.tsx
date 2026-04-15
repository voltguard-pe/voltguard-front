import { useEffect, useState } from "react";
import { createBoard } from "../../../services/board.service";
import DragAndDrop from "../../../shared/components/DragAndDrop";
import Input from "../../../shared/components/Input";
import type { BoardCreateDTO, BoardLeyendaItem } from "../../../shared/types/BoardProps";
import { getCompanies } from "../../../services/company.service";

const BoardsCreatePage = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [boardCode, setBoardCode] = useState("");
  const [tensionNominal, setTensionNominal] = useState<number>(0);
  const [numeroFases, setNumeroFases] = useState<number>(1);
  const [incluyeNeutro, setIncluyeNeutro] = useState(false);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [company, setCompany] = useState("");
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [diagrama, setDiagrama] = useState<File[]>([]);
  const [galeria, setGaleria] = useState<File[]>([]);
  const [termografia, setTermografia] = useState<File[]>([]); // <-- corregido

    const [leyenda, setLeyenda] = useState<BoardLeyendaItem[]>([
    { circuito: "", descripcion: "" }
  ]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getCompanies();
        setCompanies(data);
      } catch (error) {
        console.error("Error cargando empresas", error);
      }
    };

    fetchCompanies();
  }, []);

  // =========================
  // 📊 MANEJO LEYENDA
  // =========================
  const handleLeyendaChange = (
    index: number,
    field: keyof BoardLeyendaItem,
    value: string
  ) => {
    const updated = [...leyenda];
    updated[index][field] = value;
    setLeyenda(updated);
  };

  const addLeyendaRow = () => {
    setLeyenda([...leyenda, { circuito: "", descripcion: "" }]);
  };

  const removeLeyendaRow = (index: number) => {
    setLeyenda(leyenda.filter((_, i) => i !== index));
  };

    // =========================
  // 🚀 SUBMIT
  // =========================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload: BoardCreateDTO = {
      boardCode,
      name,
      type,
      tensionNominal,
      numeroFases,
      incluyeNeutro,
      location,
      description,
      publicCode: company
    };

    try {
      await createBoard({
        ...payload,
        diagrama,
        leyenda,
        galeria,
        termografia,
      });

      alert("Board creado correctamente 🚀");

      setName("");
      setType("");
      setBoardCode("");
      setTensionNominal(0);
      setNumeroFases(1);
      setIncluyeNeutro(false);
      setLocation("");
      setDescription("");
      setDiagrama([]);
      setLeyenda([{ circuito: "", descripcion: "" }]);
      setGaleria([]);
      setTermografia([]);
    } catch (error) {
      console.error(error);
      alert("Error al crear el board");
    }
  };

  const renderPreview = (
    files: File[],
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
  ) => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
        {files.map((file, index) => {
          const preview = URL.createObjectURL(file);

          return (
            <div key={index} className="relative group">
              <img
                src={preview}
                loading="lazy"
                onClick={() => setSelectedImage(preview)} // 👈 modal
                className="h-32 w-full object-cover rounded-lg border cursor-pointer hover:opacity-80 transition"
                // onLoad={() => URL.revokeObjectURL(preview)}
              />

              {/* ELIMINAR */}
              <button
                type="button"
                onClick={() =>
                  setFiles((prev) => prev.filter((_, i) => i !== index))
                }
                className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded shadow hover:bg-red-700"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Crear Board</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 bg-white p-6 rounded-lg shadow-md"
      >
        <Input
          label="Código Board"
          value={boardCode}
          onChange={(e) => setBoardCode(e.target.value)}
          required
        />

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Empresa
          </label>

          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition"
          >
            <option value="">Selecciona empresa</option>
            {companies.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2">
          <span>¿Incluye neutro?</span>
          <input
            type="checkbox"
            checked={incluyeNeutro}
            onChange={(e) => setIncluyeNeutro(e.target.checked)}
            className="w-4 h-4"
          />
        </label>

        {/* =========================
           📊 LEYENDA (TABLA)
        ========================= */}
        <div className="col-span-2">
          <h2 className="font-semibold mb-2">Leyenda</h2>

          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Circuito</th>
                <th className="p-2 border">Descripción</th>
                <th className="p-2 border">Acción</th>
              </tr>
            </thead>
            <tbody>
              {leyenda.map((item, index) => (
                <tr key={index}>
                  <td className="border p-2">
                    <input
                      value={item.circuito}
                      onChange={(e) =>
                        handleLeyendaChange(index, "circuito", e.target.value)
                      }
                      className="w-full border px-2 py-1 rounded"
                    />
                  </td>

                  <td className="border p-2">
                    <input
                      value={item.descripcion}
                      onChange={(e) =>
                        handleLeyendaChange(index, "descripcion", e.target.value)
                      }
                      className="w-full border px-2 py-1 rounded"
                    />
                  </td>

                  <td className="border p-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeLeyendaRow(index)}
                      className="text-red-500"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            type="button"
            onClick={addLeyendaRow}
            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
          >
            + Agregar fila
          </button>
        </div>

        <div className="col-span-2">
          <h2 className="font-semibold mb-1">Diagrama unifilar</h2>
          <DragAndDrop multiple onFilesChange={(files) => setDiagrama(files)} />
          {diagrama.length > 0 && renderPreview(diagrama, setDiagrama)}
        </div>

        <div className="col-span-2">
          <h2 className="font-semibold mb-1">Galería</h2>
          <DragAndDrop multiple onFilesChange={(files) => setGaleria(files)} />
          {galeria.length > 0 && renderPreview(galeria, setGaleria)}
        </div>

        <div className="col-span-2">
          <h2 className="font-semibold mb-1">Termografia</h2>
          <DragAndDrop multiple onFilesChange={(files) => setTermografia(files)} />
          {termografia.length > 0 && renderPreview(termografia, setTermografia)}
        </div>

        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setSelectedImage(null)}
          >
            <img
              src={selectedImage}
              alt="Preview"
              className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
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

        <div className="col-span-2 flex justify-end gap-4 mt-4">
          <button
            type="button"
            className="w-full md:w-auto bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition"
            onClick={() => {
              setName("");
              setType("");
              setBoardCode("");
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