import { ArrowLeft } from "lucide-react";
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
    <p className="text-sm break-words">
      <strong>{label}:</strong> {value(data)}
    </p>
  );

  const renderImageSection = (title: string, images: string[] = []) => (
    <div className="bg-white p-4 sm:p-5 rounded shadow">
      <h2 className="font-semibold mb-3">{title}</h2>

      {images.length === 0 ? (
        <p className="text-gray-500 text-sm">Sin imágenes registradas</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`${title} ${i + 1}`}
              onClick={() => setSelectedImage(img)}
              className="h-40 sm:h-48 w-full object-cover cursor-pointer rounded border hover:opacity-90 transition"
            />
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
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <p>Cargando...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <p className="text-red-500">{error}</p>
      </section>
    );
  }

  if (!board) {
    return (
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <p>No encontrado</p>
      </section>
    );
  }

  const companyName =
    typeof board.company === "object" ? board.company.name : "Sin empresa";

  return (
    <section className="space-y-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm hover:underline"
      >
        <ArrowLeft size={18} /> Volver
      </button>

      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold break-words">
          {board.name}
        </h1>
        <p className="text-sm text-gray-500 break-words">{companyName}</p>
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
          <p className="text-gray-500 text-sm">Sin circuitos registrados</p>
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
          className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Vista ampliada"
            className="max-w-full max-h-full rounded"
          />
        </div>
      )}
    </section>
  );
};

export default BoardDetailPage;