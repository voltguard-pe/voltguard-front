import { useEffect, useState } from "react";
import { createBoard } from "../../../services/board.service";
import DragAndDrop from "../../../shared/components/DragAndDrop";
import Input from "../../../shared/components/Input";
import type { BoardCircuit } from "../../../shared/types/BoardProps";
import { getCompanies } from "../../../services/company.service";
import { toast } from "react-toastify";
import Select from "../../../shared/components/Select";
import Checkbox from "../../../shared/components/Checkbox";

type CircuitError = {
  circuito?: string;
  descripcion?: string;
};

type FormErrors = {
  boardCode?: string;
  name?: string;
  type?: string;
  tensionNominal?: string;
  numeroFases?: string;
  company?: string;
  incluyeNeutro?: string;

  circuits?: string;
  circuitsDetail?: CircuitError[];
};

const BoardsCreatePage = () => {
  // =========================
  // 🔹 UI STATE
  // =========================
  const [loading] = useState(false);

  // =========================
  // 🔹 DATOS PRINCIPALES
  // =========================
  const [boardCode, setBoardCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");

  const [tensionNominal, setTensionNominal] = useState<number | undefined>();
  const [numeroFases, setNumeroFases] = useState<number | undefined>();
  const [incluyeNeutro, setIncluyeNeutro] = useState(false);
  const [sistema, setSistema] = useState<"MONOFASICO" | "TRIFASICO" | undefined>();

  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [estadoGeneral, setEstadoGeneral] = useState<
    "OPERATIVO" | "OBSERVACION" | "CRITICO" | undefined
  >();

  // =========================
  // 🏢 EMPRESA
  // =========================
  const [company, setCompany] = useState("");
  const [companies, setCompanies] = useState<any[]>([]);

  // =========================
  // 🖼 IMÁGENES
  // =========================
  const [diagrama, setDiagrama] = useState<File[]>([]);
  const [galeria, setGaleria] = useState<File[]>([]);
  const [termografia, setTermografia] = useState<File[]>([]);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // =========================
  // ⚡ CIRCUITOS
  // =========================
  const [circuits, setCircuits] = useState<BoardCircuit[]>([]);

  // =========================
  // ⚡ MAIN BREAKER
  // =========================
  const [mainBreaker, setMainBreaker] = useState({
    amperaje: undefined as number | undefined,
    polos: undefined as number | undefined,
    marca: "",
    modelo: "",
  });

  // =========================
  // ⚡ PROTECCIÓN
  // =========================
  const [proteccion, setProteccion] = useState({
    sobretension: false,
    marca: "",
    modelo: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // =========================
  // 🔹 FETCH EMPRESAS
  // =========================
  useEffect(() => {
    getCompanies()
      .then(setCompanies)
      .catch((err) => {
        console.error(err);
        toast.error("Error cargando empresas");
      });
  }, []);

  // =========================
  // ⚡ CIRCUITOS HANDLERS
  // =========================
  const handleCircuitChange = (
    i: number,
    field: keyof BoardCircuit,
    value: any
  ) => {
    const updated = [...circuits];
    updated[i] = {
      ...updated[i],
      [field]: value,
    };
    setCircuits(updated);
  };

  const addCircuit = () => {
    setCircuits([
      ...circuits,
      {
        circuito: "",
        descripcion: "",
        amperaje: null,
        fase: null,
        tipo: null,
        estado: "ACTIVO",
      },
    ]);
  };

  const removeCircuit = (i: number) => {
    setCircuits(circuits.filter((_, idx) => idx !== i));
  };

  // =========================
  // 🧠 VALIDACIÓN
  // =========================
  const validate = () => {
    const newErrors: Record<string, string> = {};

    // =========================
    // 🔹 CAMPOS PRINCIPALES
    // =========================
    if (!boardCode.trim()) {
      newErrors.boardCode = "El código es obligatorio";
    }

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!type.trim()) {
      newErrors.type = "El tipo es obligatorio";
    }

    if (!tensionNominal || tensionNominal <= 0) {
      newErrors.tensionNominal = "Debe ser mayor a 0";
    }

    if (!numeroFases || numeroFases <= 0) {
      newErrors.numeroFases = "Debe ser mayor a 0";
    }

    if (!company) {
      newErrors.company = "Selecciona una empresa";
    }

    // =========================
    // 🔥 CIRCUITOS
    // =========================
    if (!circuits.length) {
      newErrors.circuits = "Debe agregar al menos un circuito";
    } else {
      circuits.forEach((c, i) => {
        if (!c.circuito.trim()) {
          newErrors[`circuito_${i}`] = "Código requerido";
        }

        if (!c.descripcion.trim()) {
          newErrors[`descripcion_${i}`] = "Descripción requerida";
        }
      });
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // 🚀 SUBMIT
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔥 VALIDAR
    if (!validate()) return;

    try {
      await createBoard({
        boardCode,
        name,
        type,
        tensionNominal: tensionNominal!,
        numeroFases: numeroFases!,
        incluyeNeutro,
        sistema,
        location,
        description,
        publicCode: company,
        circuits,
        mainBreaker,
        proteccion,
        unifilar: diagrama,
        tablero: galeria,
        termografia,
      });

      alert("Tablero creado correctamente");

      // 🔥 LIMPIAR FORM (opcional)
      setBoardCode("");
      setName("");
      setType("");
      setTensionNominal(undefined);
      setNumeroFases(undefined);
      setCompany("");
      setCircuits([{ circuito: "", descripcion: "", estado: "ACTIVO" }]);

    } catch (error) {
      console.error(error);
      alert("Error al crear");
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
                alt="preview"
                loading="lazy"
                onClick={() => setSelectedImage(preview)}
                className="h-32 w-full object-cover rounded-lg border cursor-pointer hover:opacity-80 transition"
                // onLoad={() => URL.revokeObjectURL(preview)} // 🔥 evitar fuga de memoria
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
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6 space-y-6">

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h1 className="text-xl font-bold">Crear Tablero Eléctrico</h1>
        <p className="text-sm text-gray-500">
          Registra la información técnica del tablero
        </p>
      </div>

      {/* ========================= */}
      {/* INFO GENERAL */}
      {/* ========================= */}
      <section className="bg-white p-5 rounded-xl shadow">
        <h2 className="font-semibold mb-4">Información General</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Input
            value={boardCode}
            label="Código del tablero"
            required
            error={errors.boardCode}
            onChange={e => setBoardCode(e.target.value)}
          />

          <Input
            value={name}
            label="Nombre del tablero"
            required
            error={errors.name}
            onChange={e => setName(e.target.value)}
          />

          <Input
            value={type}
            label="Tipo de tablero"
            required
            error={errors.type}
            onChange={e => setType(e.target.value)}
          />

          <Input
            type="number"
            value={tensionNominal ?? ""}
            label="Tensión nominal (V)"
            required
            error={errors.tensionNominal}
            onChange={e =>
              setTensionNominal(e.target.value ? Number(e.target.value) : undefined)
            }
          />

          <Input
            type="number"
            value={numeroFases ?? ""}
            label="Número de fases"
            required
            error={errors.numeroFases}
            onChange={e =>
              setNumeroFases(e.target.value ? Number(e.target.value) : undefined)
            }
          />

          <Select
            label="Sistema eléctrico"
            value={sistema || ""}
            onChange={(e) =>
              setSistema(
                e.target.value ? (e.target.value as any) : undefined
              )
            }
            options={[
              { label: "Monofásico", value: "MONOFASICO" },
              { label: "Trifásico", value: "TRIFASICO" },
            ]}
          />

          <Select
            label="Empresa responsable"
            value={company}
            required
            error={errors.company}
            onChange={(e) => setCompany(e.target.value)}
            options={companies.map((c) => ({
              label: c.name,
              value: c.publicCode,
            }))}
          />

          <Select
            label="Estado general"
            value={estadoGeneral || ""}
            onChange={(e) =>
              setEstadoGeneral(
                e.target.value ? (e.target.value as any) : undefined
              )
            }
            options={[
              { label: "Operativo", value: "OPERATIVO" },
              { label: "Observación", value: "OBSERVACION" },
              { label: "Crítico", value: "CRITICO" },
            ]}
          />

          <Input
            value={location}
            label="Ubicación"
            onChange={e => setLocation(e.target.value)}
          />

          <div className="md:col-span-2">
            <Input
              value={description}
              label="Descripción"
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <Checkbox
            label="Incluye neutro"
            checked={incluyeNeutro}
            required
            error={errors.incluyeNeutro}
            onChange={setIncluyeNeutro}
          />

        </div>
      </section>

      {/* ========================= */}
      {/* MAIN BREAKER + PROTECCIÓN */}
      {/* ========================= */}
      <section className="bg-white p-5 rounded-xl shadow grid md:grid-cols-2 gap-6">

        <div>
          <h2 className="font-semibold mb-3">Interruptor General</h2>

          <div className="space-y-3">

            <Input
              type="number"
              value={mainBreaker.amperaje ?? ""}
              label="Amperaje (A)"
              onChange={e =>
                setMainBreaker({
                  ...mainBreaker,
                  amperaje: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />

            <Input
              type="number"
              value={mainBreaker.polos ?? ""}
              label="Número de polos"
              onChange={e =>
                setMainBreaker({
                  ...mainBreaker,
                  polos: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />

            <Input
              value={mainBreaker.marca}
              label="Marca"
              onChange={e =>
                setMainBreaker({ ...mainBreaker, marca: e.target.value })
              }
            />

            <Input
              value={mainBreaker.modelo}
              label="Modelo"
              onChange={e =>
                setMainBreaker({ ...mainBreaker, modelo: e.target.value })
              }
            />

          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-3">Sistema de Protección</h2>

          <Checkbox
            label="Protección contra sobretensión"
            checked={proteccion.sobretension}
            onChange={checked =>
                setProteccion({
                  ...proteccion,
                  sobretension: checked,
                })
              }
          />

          <div className="space-y-3">

            <Input
              value={proteccion.marca}
              label="Marca del protector"
              onChange={e =>
                setProteccion({ ...proteccion, marca: e.target.value })
              }
            />

            <Input
              value={proteccion.modelo}
              label="Modelo del protector"
              onChange={e =>
                setProteccion({ ...proteccion, modelo: e.target.value })
              }
            />

          </div>
        </div>

      </section>

      {/* ========================= */}
      {/* CIRCUITOS */}
      {/* ========================= */}
      <section className="bg-white p-5 rounded-xl shadow">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">Circuitos del Tablero</h2>

          <button
            type="button"
            onClick={addCircuit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            + Agregar circuito
          </button>
        </div>

        <div className="space-y-4">
          {circuits.map((c, i) => (
            <div key={i} className="border border-gray-300 p-4 rounded-lg shadow">

              <div className="flex justify-between mb-3">
                <span>Circuito #{i + 1}</span>
                <button type="button" onClick={() => removeCircuit(i)}>
                  ❌
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-3">

                <Input
                  label="Código circuito"
                  value={c.circuito}
                  required
                  error={errors.circuitsDetail?.[i]?.circuito}
                  onChange={(e) =>
                    handleCircuitChange(i, "circuito", e.target.value)
                  }
                />

                <Input
                  label="Descripción"
                  value={c.descripcion}
                  required
                  error={errors.circuitsDetail?.[i]?.descripcion}
                  onChange={(e) =>
                    handleCircuitChange(i, "descripcion", e.target.value)
                  }
                />

                <Input
                  type="number"
                  label="Corriente (A)"
                  value={c.amperaje ?? ""}
                  onChange={(e) =>
                    handleCircuitChange(
                      i,
                      "amperaje",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                />

                <Select
                  label="Fase"
                  value={c.fase ?? ""}
                  onChange={(e) =>
                    handleCircuitChange(
                      i,
                      "fase",
                      e.target.value || null
                    )
                  }
                  options={[
                    { label: "Seleccionar", value: "" },
                    { label: "R", value: "R" },
                    { label: "S", value: "S" },
                    { label: "T", value: "T" },
                  ]}
                />

                <Select
                  label="Tipo"
                  value={c.tipo ?? ""}
                  onChange={(e) =>
                    handleCircuitChange(
                      i,
                      "tipo",
                      e.target.value || null
                    )
                  }
                  options={[
                    { label: "Seleccionar", value: "" },
                    { label: "Monofásico", value: "MONOFASICO" },
                    { label: "Trifásico", value: "TRIFASICO" },
                  ]}
                />

                <Select
                  label="Estado"
                  value={c.estado ?? ""}
                  onChange={(e) =>
                    handleCircuitChange(
                      i,
                      "estado",
                      e.target.value || undefined
                    )
                  }
                  options={[
                    { label: "Seleccionar", value: "" },
                    { label: "Activo", value: "ACTIVO" },
                    { label: "Inactivo", value: "INACTIVO" },
                    { label: "Falla", value: "FALLA" },
                  ]}
                />

              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================= */}
      {/* ARCHIVOS */}
      {/* ========================= */}
      <section className="bg-white p-5 rounded-xl shadow space-y-4">
        <h2 className="font-semibold">Archivos</h2>

        <div>
          <p>Diagrama Unifilar</p>
          <DragAndDrop multiple onFilesChange={setDiagrama} />
          {diagrama.length > 0 && renderPreview(diagrama, setDiagrama)}
        </div>

        <div>
          <p>Galería</p>
          <DragAndDrop multiple onFilesChange={setGaleria} />
          {galeria.length > 0 && renderPreview(galeria, setGaleria)}
        </div>

        <div>
          <p>Termografía</p>
          <DragAndDrop multiple onFilesChange={setTermografia} />
          {termografia.length > 0 && renderPreview(termografia, setTermografia)}
        </div>
      </section>

      {/* ========================= */}
      {/* SUBMIT */}
      {/* ========================= */}
      <div className="flex justify-end">
        <button
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Guardando..." : "Guardar Tablero"}
        </button>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="preview"
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

    </form>
  );
};

export default BoardsCreatePage;