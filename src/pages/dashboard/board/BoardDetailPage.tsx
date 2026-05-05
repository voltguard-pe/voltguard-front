import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBoardByCode } from "../../../services/board.service";
import type { BoardResponseDTO } from "../../../shared/types/BoardProps";

const value = (data: unknown) =>
  data === null || data === undefined || data === "" ? "-" : String(data);

const bool = (data?: boolean) => (data ? "Sí" : "No");

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleString("es-PE") : "-";

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
          <h2 className="font-semibold mb-2">Identificación</h2>
          {renderField("ID interno", board.code)}
          {renderField("Código real del tablero", board.boardCode)}
          {renderField("Empresa", companyName)}
          {renderField(
            "Código público de empresa",
            (board as BoardResponseDTO & { companyPublicCode?: string }).companyPublicCode
          )}
        </div>

        <div className="bg-white p-4 sm:p-5 rounded shadow space-y-2">
          <h2 className="font-semibold mb-2">Información general</h2>
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

        <div className="bg-white p-4 sm:p-5 rounded shadow space-y-2">
          <h2 className="font-semibold mb-2">Interruptor principal</h2>
          {renderField(
            "Amperaje",
            board.mainBreaker?.amperaje
              ? `${board.mainBreaker.amperaje} A`
              : "-"
          )}
          {renderField("Polos", board.mainBreaker?.polos)}
          {renderField("Marca", board.mainBreaker?.marca)}
          {renderField("Modelo", board.mainBreaker?.modelo)}
        </div>

        <div className="bg-white p-4 sm:p-5 rounded shadow space-y-2 lg:col-span-2">
          <h2 className="font-semibold mb-2">Protección</h2>
          <p className="text-sm">
            <strong>Sobretensión:</strong>{" "}
            {bool(board.proteccion?.sobretension)}
          </p>
          {renderField("Marca", board.proteccion?.marca)}
          {renderField("Modelo", board.proteccion?.modelo)}
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
                  <p>
                    <strong>Amperaje:</strong>{" "}
                    {c.amperaje ? `${c.amperaje} A` : "-"}
                  </p>
                  <p>
                    <strong>Fase:</strong> {value(c.fase)}
                  </p>
                  <p>
                    <strong>Tipo:</strong> {value(c.tipo)}
                  </p>
                  <p>
                    <strong>Estado:</strong> {value(c.estado)}
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
                    <th className="border p-2 text-left">Amperaje</th>
                    <th className="border p-2 text-left">Fase</th>
                    <th className="border p-2 text-left">Tipo</th>
                    <th className="border p-2 text-left">Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {board.circuits.map((c, i) => (
                    <tr key={i}>
                      <td className="border p-2">{value(c.circuito)}</td>
                      <td className="border p-2">{value(c.descripcion)}</td>
                      <td className="border p-2">
                        {c.amperaje ? `${c.amperaje} A` : "-"}
                      </td>
                      <td className="border p-2">{value(c.fase)}</td>
                      <td className="border p-2">{value(c.tipo)}</td>
                      <td className="border p-2">{value(c.estado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {renderImageSection("Imágenes del tablero", board.images?.tablero)}
      {renderImageSection("Diagrama unifilar", board.images?.unifilar)}
      {renderImageSection("Termografía", board.images?.termografia)}

      <div className="bg-white p-4 sm:p-5 rounded shadow space-y-2">
        <h2 className="font-semibold mb-2">Auditoría</h2>
        {renderField("Creado por", board.createdBy)}
        {renderField("Fecha de creación", formatDate(board.createdAt))}
        {renderField("Última actualización", formatDate(board.updatedAt))}
      </div>

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