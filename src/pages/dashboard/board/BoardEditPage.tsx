import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBoardByCode, updateBoard } from "../../../services/board.service";
import DragAndDrop from "../../../shared/components/DragAndDrop";
import Input from "../../../shared/components/Input";
import type {
  BoardCircuit,
  BoardResponseDTO,
} from "../../../shared/types/BoardProps";
import Select from "../../../shared/components/Select";
import Checkbox from "../../../shared/components/Checkbox";
import { getCompanies } from "../../../services/company.service";
import { toast } from "react-toastify";

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

const BoardsEditPage = () => {
  const { publicCode, code } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState<BoardResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // =========================
  // 🔹 STATES
  // =========================
  const [boardCode, setBoardCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [tensionNominal, setTensionNominal] = useState<number | undefined>();
  const [numeroFases, setNumeroFases] = useState<number | undefined>();
  const [incluyeNeutro, setIncluyeNeutro] = useState(false);
  const [sistema, setSistema] = useState<"MONOFASICO" | "TRIFASICO" | undefined>();
  const [estadoGeneral, setEstadoGeneral] = useState<
    "OPERATIVO" | "OBSERVACION" | "CRITICO" | undefined
  >();

  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [company, setCompany] = useState("");
  const [companies, setCompanies] = useState<any[]>([]);
  console.log(companies)

  const [circuits, setCircuits] = useState<BoardCircuit[]>([]);

  const [mainBreaker, setMainBreaker] = useState({
    amperaje: undefined as number | undefined,
    polos: undefined as number | undefined,
    marca: "",
    modelo: "",
  });

  const [proteccion, setProteccion] = useState({
    sobretension: false,
    marca: "",
    modelo: "",
  });

  const [unifilar, setUnifilar] = useState<File[]>([]);
  const [tablero, setTablero] = useState<File[]>([]);
  const [termografia, setTermografia] = useState<File[]>([]);

  const [existingUnifilar, setExistingUnifilar] = useState<string[]>([]);
  const [existingTablero, setExistingTablero] = useState<string[]>([]);
  const [existingTermografia, setExistingTermografia] = useState<string[]>([]);

  const [errors, setErrors] = useState<FormErrors>({});

  // =========================
  // 🔄 LOAD DATA
  // =========================
  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getBoardByCode(publicCode!, code!);
        console.log(data)
        setBoard(data);

        setBoardCode(data.boardCode);
        setName(data.name || "");
        setType(data.type || "");
        setTensionNominal(data.tensionNominal);
        setNumeroFases(data.numeroFases);
        setIncluyeNeutro(data.incluyeNeutro);
        setSistema(data.sistema);
        setEstadoGeneral(data.estadoGeneral);

        setLocation(data.location || "");
        setDescription(data.description || "");

        setCircuits(data.circuits || []);

        // ⚠️ IMPORTANTE (para select)
        if (typeof data.company === "object") {
          setCompany(data.company.publicCode ?? "");
        }

        setMainBreaker({
          amperaje: data.mainBreaker?.amperaje,
          polos: data.mainBreaker?.polos,
          marca: data.mainBreaker?.marca || "",
          modelo: data.mainBreaker?.modelo || "",
        });

        setProteccion({
          sobretension: data.proteccion?.sobretension || false,
          marca: data.proteccion?.marca || "",
          modelo: data.proteccion?.modelo || "",
        });

        setExistingUnifilar(data.images?.unifilar || []);
        setExistingTablero(data.images?.tablero || []);
        setExistingTermografia(data.images?.termografia || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [code, publicCode]);

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
  // ⚡ CIRCUITS
  // =========================
  const handleCircuitChange = (
    i: number,
    field: keyof BoardCircuit,
    value: any
  ) => {
    const updated = [...circuits];

    if (field === "amperaje") {
      updated[i][field] = value === "" ? null : Number(value);
    } else if (field === "fase" || field === "tipo") {
      updated[i][field] = value === "" ? null : value;
    } else {
      updated[i][field] = value;
    }

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
  // 🧠 VALIDACIÓN (IGUAL A CREATE)
  // =========================
 const validate = () => {
  const newErrors: FormErrors = {};

  // =========================
  // CAMPOS PRINCIPALES
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
  // CIRCUITOS (FIX REAL)
  // =========================
  if (!circuits.length) {
    newErrors.circuits = "Debe agregar al menos un circuito";
  } else {
    const circuitsErrors: CircuitError[] = [];
    let hasErrors = false;

    circuits.forEach((c, i) => {
      const error: CircuitError = {};

      if (!c.circuito?.trim()) {
        error.circuito = "Código requerido";
        hasErrors = true;
      }

      if (!c.descripcion?.trim()) {
        error.descripcion = "Descripción requerida";
        hasErrors = true;
      }

      circuitsErrors[i] = error;
    });

    // 🔥 SOLO SI HAY ERRORES
    if (hasErrors) {
      newErrors.circuitsDetail = circuitsErrors;
    }
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};

  // =========================
  // 🧹 CLEAN DATA
  // =========================
  const cleanData = () => ({
    boardCode,
    name,
    type,
    tensionNominal,
    numeroFases,
    incluyeNeutro,
    sistema: sistema || undefined,
    estadoGeneral: estadoGeneral || undefined,
    location: location.trim() || "",
    description: description.trim() || "",

    circuits: circuits
      .filter((c) => c.circuito || c.descripcion)
      .map((c) => ({
        circuito: c.circuito,
        descripcion: c.descripcion,
        amperaje: c.amperaje ?? null,
        fase: c.fase || null,
        tipo: c.tipo || null,
        estado: c.estado || "ACTIVO",
      })),

    mainBreaker:
      !mainBreaker.amperaje &&
        !mainBreaker.polos &&
        !mainBreaker.marca &&
        !mainBreaker.modelo
        ? undefined
        : mainBreaker,

    proteccion:
      !proteccion.sobretension &&
        !proteccion.marca &&
        !proteccion.modelo
        ? undefined
        : proteccion,
  });

  // =========================
  // 🚀 SUBMIT
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSaving(true);

      const cleaned = cleanData();

      await updateBoard(publicCode!, code!, {
        ...cleaned,
        existingUnifilar,
        existingTablero,
        existingTermografia,
        unifilar,
        tablero,
        termografia,
      });

      navigate(-1);
    } catch (error) {
      console.error(error);
      alert("Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // 🖼 PREVIEWS
  // =========================
  const renderExisting = (
    images: string[],
    setImages: React.Dispatch<React.SetStateAction<string[]>>
  ) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
      {images.map((img, i) => (
        <div key={i} className="relative group">
          <img
            src={img}
            onClick={() => setSelectedImage(img)}
            className="h-28 w-full object-cover rounded cursor-pointer hover:opacity-80"
          />
          <button
            type="button"
            onClick={() =>
              setImages((prev) => prev.filter((_, idx) => idx !== i))
            }
            className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );

  const renderPreview = (
    files: File[],
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
  ) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
      {files.map((file, i) => {
        const url = URL.createObjectURL(file);
        return (
          <div key={i} className="relative group">
            <img
              src={url}
              onClick={() => setSelectedImage(url)}
              className="h-28 w-full object-cover rounded cursor-pointer hover:opacity-80"
            />
            <button
              type="button"
              onClick={() =>
                setFiles((prev) => prev.filter((_, idx) => idx !== i))
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

  // =========================
  // ⏳ STATES UI
  // =========================
  if (loading) return <p>Cargando...</p>;
  if (!board) return <p>No encontrado</p>;

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6 space-y-6">

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h1 className="text-xl font-bold">Editar Tablero Eléctrico</h1>
        <p className="text-sm text-gray-500">
          Modifica la información técnica del tablero
        </p>
      </div>

      {/* ========================= */}
      {/* INFO GENERAL */}
      {/* ========================= */}
      <section className="bg-white p-5 rounded-xl shadow">
        <h2 className="font-semibold mb-4">Información General del Tablero</h2>

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

          {/* <Select
            label="Empresa responsable"
            value={company}
            required
            error={errors.company}
            onChange={(e) => setCompany(e.target.value)}
            options={companies.map((c) => ({
              label: c.name,
              value: c._id, // ⚠️ IMPORTANTE (no publicCode)
            }))}
          /> */}

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
      {/* BREAKER + PROTECCION */}
      {/* ========================= */}
      <section className="bg-white p-5 rounded-xl shadow grid md:grid-cols-2 gap-6">

        <div className="flex flex-col gap-y-4">
          <h2 className="font-semibold">Interruptor General (Main Breaker)</h2>


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

        <div className="flex flex-col gap-y-4">
          <h2 className="font-semibold">Sistema de Protección</h2>

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
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Circuitos del Tablero</h2>

          <button
            type="button"
            onClick={addCircuit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
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

              <div className="grid md:grid-cols-3 gap-4">

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
      {/* IMÁGENES */}
      {/* ========================= */}
      <section className="bg-white p-5 rounded-xl shadow space-y-4">
        <h2 className="font-semibold">Archivos</h2>

        <div>
          <h3 className="font-medium">Diagrama unifilar</h3>
          <DragAndDrop multiple onFilesChange={setUnifilar} />
          {renderExisting(existingUnifilar, setExistingUnifilar)}
          {renderPreview(unifilar, setUnifilar)}
        </div>

        <div>
          <h3 className="font-medium">Galería</h3>
          <DragAndDrop multiple onFilesChange={setTablero} />
          {renderExisting(existingTablero, setExistingTablero)}
          {renderPreview(tablero, setTablero)}
        </div>

        <div>
          <h3 className="font-medium">Termografía</h3>
          <DragAndDrop multiple onFilesChange={setTermografia} />
          {renderExisting(existingTermografia, setExistingTermografia)}
          {renderPreview(termografia, setTermografia)}
        </div>
      </section>

      {/* ========================= */}
      {/* SUBMIT */}
      {/* ========================= */}
      <div className="flex justify-end">
        <button
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
        >
          {saving ? "Guardando..." : "Guardar Tablero"}
        </button>
      </div>

      {/* ========================= */}
      {/* MODAL PREVIEW */}
      {/* ========================= */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />

          <button
          type="submit"
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

export default BoardsEditPage;