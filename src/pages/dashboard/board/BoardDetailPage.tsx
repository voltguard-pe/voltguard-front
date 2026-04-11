import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBoardByCode } from "../../../services/board.service";
import type { BoardResponseDTO } from "../../../shared/types/BoardProps";

const BoardDetailPage = () => {
  const navigate = useNavigate();
  const { publicCode, code } = useParams();

  const [board, setBoard] = useState<BoardResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchBoardDetail = async () => {
    if (!code) {
      setError("Código de tablero no proporcionado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getBoardByCode(publicCode?.toString() || "", code);

      const boardCompanyPublicCode =
        typeof data.company === "object" && data.company !== null
          ? data.company.publicCode
          : undefined;

      if (
        publicCode &&
        boardCompanyPublicCode &&
        boardCompanyPublicCode !== publicCode
      ) {
        setError("El tablero no pertenece a la empresa seleccionada");
        setBoard(null);
        return;
      }

      setBoard(data);
    } catch (err) {
      console.error("Error cargando detalle del tablero", err);
      setError("No se pudo cargar el tablero");
      setBoard(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardDetail();
  }, [code, publicCode]);

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando detalle...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  if (!board) {
    return (
      <p className="text-sm text-red-500">
        No se pudo cargar el tablero.
      </p>
    );
  }

  const companyName =
    typeof board.company === "object" && board.company !== null
      ? board.company.name
      : "Sin empresa";

  const renderSection = (title: string, images: string[]) => {
    if (!images || images.length === 0) return null;

    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {title}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => {
            const thumb = image.replace(
              "/upload/",
              "/upload/w_400,f_auto/"
            );

            return (
              <img
                key={index}
                src={thumb}
                alt=""
                loading="lazy"
                onClick={() => setSelectedImage(image)}
                className="cursor-pointer h-56 w-full object-cover rounded-lg"
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="flex flex-col gap-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() =>
            navigate(`/dashboard/boards/${publicCode}`)
          }
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={18} />
          Volver
        </button>
      </div>

      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          {board.name}
        </h1>
        <p className="text-sm text-gray-500">
          Empresa: {companyName}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 space-y-3 text-sm">
        <p>
          <strong>Tipo:</strong> {board.type}
        </p>
        <p>
          <strong>Tensión nominal:</strong>{" "}
          {board.tensionNominal}
        </p>
        <p>
          <strong>Número de fases:</strong>{" "}
          {board.numeroFases}
        </p>
        <p>
          <strong>Incluye neutro:</strong>{" "}
          {board.incluyeNeutro ? "Sí" : "No"}
        </p>
        <p>
          <strong>Ubicación:</strong>{" "}
          {board.location || "Sin ubicación"}
        </p>
        <p>
          <strong>Descripción:</strong>{" "}
          {board.description || "Sin descripción"}
        </p>
      </div>

      {renderSection("Diagrama unifilar", board.images?.unifilar || [])}
      {renderSection("Leyenda", board.images?.leyenda || [])}
      {renderSection("Galería", board.images?.tablero || [])}
      {renderSection("Termografía", board.images?.termografia || [])}

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
    </section>
  );
};

export default BoardDetailPage;