import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileImage,
  ImageIcon,
  Info,
  MapPin,
  X,
  Zap,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getBoardByCode } from "../../../services/board.service";
import type {
  BoardResponseDTO,
  InsulationMeasurementRow,
} from "../../../shared/types/BoardProps";

const value = (data: unknown) =>
  data === null || data === undefined || data === "" ? "-" : String(data);

const bool = (data?: boolean) => (data ? "Sí" : "No");

const formatMeasurement = (data: number | null | undefined) => {
  if (data === null || data === undefined) return "-";
  return String(data);
};

const formatConfidence = (data?: number | null) => {
  if (data === null || data === undefined) return "-";
  return `${Math.round(data * 100)}%`;
};

const getStatusLabel = (status?: string) => {
  if (status === "PENDING_REVIEW") return "Pendiente de revisión";
  if (status === "CONFIRMED") return "Confirmado";
  if (status === "FAILED") return "Fallido";
  return value(status);
};

const getStatusClasses = (status?: string) => {
  if (status === "CONFIRMED") {
    return "bg-green-100 text-green-800";
  }

  if (status === "FAILED") {
    return "bg-red-100 text-red-800";
  }

  return "bg-yellow-100 text-yellow-800";
};

const BoardDetailPage = () => {
  const navigate = useNavigate();
  const { publicCode, code } = useParams();

  const [board, setBoard] = useState<BoardResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const data = await getBoardByCode(publicCode!, code!);
        setBoard(data);
      } catch {
        setError("Error cargando tablero");
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [code, publicCode]);

  const renderField = (label: string, data: unknown) => (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value(data)}
      </p>
    </div>
  );

  const renderImageSection = (
    title: string,
    description: string,
    images: string[] = []
  ) => (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#8ccf2f]/15 text-[#3aaa35]">
          <ImageIcon size={24} />
        </div>

        <div>
          <h2 className="font-bold text-slate-950">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <FileImage size={36} className="text-slate-300" />

          <p className="mt-3 text-sm font-semibold text-slate-600">
            Sin imágenes registradas
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((img, index) => (
            <button
              key={`${img}-${index}`}
              type="button"
              onClick={() => setSelectedImage(img)}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 text-left"
            >
              <img
                src={img}
                alt={`${title} ${index + 1}`}
                className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
              />

              <div className="p-3">
                <p className="truncate text-xs font-semibold text-slate-600">
                  Imagen {index + 1}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderInsulationMeasurements = () => {
    const record = board?.insulationMeasurements?.[0];

    return (
      <div className="bg-white p-4 sm:p-5 rounded shadow">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
          <div>
            <h2 className="font-semibold">Mediciones de aislamiento</h2>
            <p className="text-xs text-gray-500">
              Medición fase-tierra expresada en MΩ
            </p>
          </div>

          {record && (
            <span
              className={`text-xs px-2 py-1 rounded w-fit ${getStatusClasses(
                record.status
              )}`}
            >
              {getStatusLabel(record.status)}
            </span>
          )}
        </div>

        {!record?.rows?.length ? (
          <p className="text-gray-500 text-sm">
            Sin mediciones de aislamiento registradas
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {record.rows.map((row: InsulationMeasurementRow, i: number) => (
                <div key={i} className="border rounded p-4 space-y-1 text-sm">
                  <p>
                    <strong>Circuito:</strong> {value(row.circuit)}
                  </p>
                  <p>
                    <strong>Descripción:</strong> {value(row.description)}
                  </p>
                  <p>
                    <strong>L1-G:</strong>{" "}
                    {formatMeasurement(row.measurement_l1_g)} {row.unit || "MΩ"}
                  </p>
                  <p>
                    <strong>L2-G:</strong>{" "}
                    {formatMeasurement(row.measurement_l2_g)} {row.unit || "MΩ"}
                  </p>
                  <p>
                    <strong>L3-G:</strong>{" "}
                    {formatMeasurement(row.measurement_l3_g)} {row.unit || "MΩ"}
                  </p>
                  <p>
                    <strong>Confianza lectura:</strong>{" "}
                    {formatConfidence(row.readingConfidence)}
                  </p>
                  <p>
                    <strong>Confianza asociación:</strong>{" "}
                    {formatConfidence(row.associationConfidence)}
                  </p>
                  <p>
                    <strong>Observación:</strong> {value(row.observation)}
                  </p>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm border min-w-[900px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2 text-left">Circuito</th>
                    <th className="border p-2 text-left">Descripción</th>
                    <th className="border p-2 text-center">L1-G</th>
                    <th className="border p-2 text-center">L2-G</th>
                    <th className="border p-2 text-center">L3-G</th>
                    <th className="border p-2 text-center">Unidad</th>
                    <th className="border p-2 text-center">
                      Confianza lectura
                    </th>
                    <th className="border p-2 text-center">
                      Confianza asociación
                    </th>
                    <th className="border p-2 text-left">Observación</th>
                  </tr>
                </thead>

                <tbody>
                  {record.rows.map((row: InsulationMeasurementRow, i: number) => (
                    <tr key={i}>
                      <td className="border p-2">{value(row.circuit)}</td>
                      <td className="border p-2">{value(row.description)}</td>
                      <td className="border p-2 text-center">
                        {formatMeasurement(row.measurement_l1_g)}
                      </td>
                      <td className="border p-2 text-center">
                        {formatMeasurement(row.measurement_l2_g)}
                      </td>
                      <td className="border p-2 text-center">
                        {formatMeasurement(row.measurement_l3_g)}
                      </td>
                      <td className="border p-2 text-center">
                        {row.unit || record.unit || "MΩ"}
                      </td>
                      <td className="border p-2 text-center">
                        {formatConfidence(row.readingConfidence)}
                      </td>
                      <td className="border p-2 text-center">
                        {formatConfidence(row.associationConfidence)}
                      </td>
                      <td className="border p-2">
                        {value(row.observation)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {record.warnings?.length ? (
              <div className="mt-3 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="font-semibold mb-1">Advertencias:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {record.warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {record.importedAt && (
              <p className="mt-3 text-xs text-gray-500">
                Importado el{" "}
                {new Date(record.importedAt).toLocaleString("es-PE")}
              </p>
            )}
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="h-28 animate-pulse rounded-3xl bg-slate-200" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-3xl bg-slate-200" />
          <div className="h-72 animate-pulse rounded-3xl bg-slate-200" />
        </div>
        <div className="h-96 animate-pulse rounded-3xl bg-slate-200" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      </section>
    );
  }

  if (!board) {
    return (
      <section className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500">
          No encontrado
        </div>
      </section>
    );
  }

  const companyName =
    typeof board.company === "object" ? board.company.name : "Sin empresa";

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <ArrowLeft size={18} />
        Volver
      </button>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] p-6 text-white">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                <Zap size={14} />
                Tablero eléctrico
              </div>

              <h1 className="text-2xl font-bold md:text-3xl">
                {board.name}
              </h1>

              <p className="mt-2 flex items-center gap-2 text-sm text-white/90">
                <Building2 size={16} />
                {companyName}
              </p>
            </div>

            <div className="rounded-3xl bg-white/15 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase text-white/80">
                Código
              </p>

              <p className="mt-1 text-xl font-bold">
                {value(board.boardCode)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl bg-slate-50 p-5">
            <MapPin className="text-[#0797d5]" size={24} />
            <p className="mt-3 text-xs font-semibold uppercase text-slate-400">
              Ubicación
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {value(board.location)}
            </p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-5">
            <Info className="text-[#0797d5]" size={24} />
            <p className="mt-3 text-xs font-semibold uppercase text-slate-400">
              Tipo
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {value(board.type)}
            </p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-5">
            <Zap className="text-[#0797d5]" size={24} />
            <p className="mt-3 text-xs font-semibold uppercase text-slate-400">
              Sistema
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {value(board.sistema)}
            </p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-5">
            <CheckCircle2 className="text-[#3aaa35]" size={24} />
            <p className="mt-3 text-xs font-semibold uppercase text-slate-400">
              Estado
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {value(board.estadoGeneral)}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
              <Info size={24} />
            </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 sm:p-5 rounded shadow space-y-2">
          <h2 className="font-semibold mb-2">Información general</h2>
          {renderField("Código real del tablero", board.boardCode)}
          {renderField("Nombre", board.name)}
          {renderField("Tipo", board.type)}
          {renderField("Sistema", board.sistema)}
          {renderField("Estado general", board.estadoGeneral)}
          {renderField("Ubicación", board.location)}
          {renderField("Descripción", board.description)}
        </div>

        <div className="bg-white p-4 sm:p-5 rounded shadow space-y-2">
          <h2 className="font-semibold mb-2">Información eléctrica</h2>
          {renderField(
            "Tensión nominal",
            board.tensionNominal ? `${board.tensionNominal} V` : "-"
          )}
          {renderField("Número de fases", board.numeroFases)}
          <p className="text-sm">
            <strong>Incluye neutro:</strong> {bool(board.incluyeNeutro)}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded shadow">
        <h2 className="font-semibold mb-3">Leyenda</h2>

        {!board.circuits?.length ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            Sin circuitos registrados
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {board.circuits.map((c, i) => (
                <div key={i} className="border rounded p-4 space-y-1 text-sm">
                  <p>
                    <strong>Circuito:</strong> {value(c.circuito)}
                  </p>
                  <p>
                    <strong>Descripción:</strong> {value(c.descripcion)}
                  </p>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm border min-w-[720px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2 text-left">Circuito</th>
                    <th className="border p-2 text-left">Descripción</th>
                  </tr>
                </thead>

                <tbody>
                  {board.circuits.map((c, i) => (
                    <tr key={i}>
                      <td className="border p-2">{value(c.circuito)}</td>
                      <td className="border p-2">{value(c.descripcion)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {renderInsulationMeasurements()}

      {renderImageSection("Imágenes del tablero", board.images?.tablero)}
      {renderImageSection("Diagrama unifilar", board.images?.unifilar)}
      {renderImageSection("Termografía", board.images?.termografia)}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute right-5 top-5 flex size-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow"
          >
            <X size={22} />
          </button>

          <img
            src={selectedImage}
            alt="Vista ampliada"
            className="max-h-[90vh] max-w-[90vw] rounded-3xl object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
};

export default BoardDetailPage;