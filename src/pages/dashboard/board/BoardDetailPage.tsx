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
  BoardResponseDTO
} from "../../../shared/types/BoardProps";

const value = (data: unknown) =>
  data === null || data === undefined || data === "" ? "-" : String(data);

const bool = (data?: boolean) => (data ? "Sí" : "No");

const formatMeasurementWithUnit = (
  data: number | null | undefined,
  unit = "MΩ"
) => {
  if (data === null || data === undefined) return "-";
  return `${data} ${unit}`;
};

// const getStatusLabel = (status?: string) => {
//   if (status === "PENDING_REVIEW") return "Pendiente de revisión";
//   if (status === "CONFIRMED") return "Confirmado";
//   if (status === "FAILED") return "Fallido";
//   return value(status);
// };

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
    </section>
  );

  const renderInsulationMeasurements = () => {
    const records = board?.insulationMeasurements ?? [];
    const record = records.length > 0 ? records[records.length - 1] : null;
    const row = record?.rows?.[0];

    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-semibold">Mediciones de aislamiento</h2>
            <p className="text-xs text-gray-500">
              Medición fase-tierra expresada en MΩ
            </p>
          </div>

          {/* {record && (
            <span
              className={`w-fit rounded px-2 py-1 text-xs ${getStatusClasses(
                record.status
              )}`}
            >
              {getStatusLabel(record.status)}
            </span>
          )} */}
        </div>

        {!row ? (
          <p className="text-sm text-gray-500">
            Sin mediciones de aislamiento registradas
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:hidden">
              <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <p>
                  <strong>Descripción:</strong>{" "}
                  {value(row.description || "Barras generales")}
                </p>

                <p>
                  <strong>Fase 1 - Tierra:</strong>{" "}
                  {formatMeasurementWithUnit(
                    row.measurement_l1_g,
                    row.unit || record.unit || "MΩ"
                  )}
                </p>

                <p>
                  <strong>Fase 2 - Tierra:</strong>{" "}
                  {formatMeasurementWithUnit(
                    row.measurement_l2_g,
                    row.unit || record.unit || "MΩ"
                  )}
                </p>

                <p>
                  <strong>Fase 3 - Tierra:</strong>{" "}
                  {formatMeasurementWithUnit(
                    row.measurement_l3_g,
                    row.unit || record.unit || "MΩ"
                  )}
                </p>
              </div>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2 text-left">Descripción</th>
                    <th className="border p-2 text-center">Fase 1 - Tierra</th>
                    <th className="border p-2 text-center">Fase 2 - Tierra</th>
                    <th className="border p-2 text-center">Fase 3 - Tierra</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td className="border p-2">
                      {value(row.description || "Barras generales")}
                    </td>

                    <td className="border p-2 text-center">
                      {formatMeasurementWithUnit(
                        row.measurement_l1_g,
                        row.unit || record.unit || "MΩ"
                      )}
                    </td>

                    <td className="border p-2 text-center">
                      {formatMeasurementWithUnit(
                        row.measurement_l2_g,
                        row.unit || record.unit || "MΩ"
                      )}
                    </td>

                    <td className="border p-2 text-center">
                      {formatMeasurementWithUnit(
                        row.measurement_l3_g,
                        row.unit || record.unit || "MΩ"
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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
        type="button"
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

              <h1 className="text-2xl font-bold md:text-3xl">{board.name}</h1>

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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-4 font-semibold">Información general</h2>

          <div className="space-y-2">
            {renderField("Código real del tablero", board.boardCode)}
            {renderField("Nombre", board.name)}
            {renderField("Tipo", board.type)}
            {renderField("Sistema", board.sistema)}
            {renderField("Estado general", board.estadoGeneral)}
            {renderField("Ubicación", board.location)}
            {renderField("Descripción", board.description)}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-4 font-semibold">Información eléctrica</h2>

          <div className="space-y-2">
            {renderField(
              "Tensión nominal",
              board.tensionNominal ? `${board.tensionNominal} V` : "-"
            )}
            {renderField("Número de fases", board.numeroFases)}

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Incluye neutro
              </p>

              <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                {bool(board.incluyeNeutro)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-3 font-semibold">Leyenda</h2>

        {!board.circuits?.length ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            Sin circuitos registrados
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {board.circuits.map((c, i) => (
                <div key={i} className="space-y-1 rounded border p-4 text-sm">
                  <p>
                    <strong>Circuito:</strong> {value(c.circuito)}
                  </p>
                  <p>
                    <strong>Descripción:</strong> {value(c.descripcion)}
                  </p>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] border text-sm">
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

      {renderImageSection(
        "Imágenes del tablero",
        "Fotografías generales del tablero eléctrico",
        board.images?.tablero
      )}

      {renderImageSection(
        "Diagrama unifilar",
        "Imágenes del diagrama unifilar registrado",
        board.images?.unifilar
      )}

      {renderImageSection(
        "Termografía",
        "Imágenes termográficas asociadas al tablero",
        board.images?.termografia
      )}

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