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

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getBoardByCode(publicCode!, code!);
        setBoard(data);
      } catch (err) {
        setError("Error cargando tablero");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [code, publicCode]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!board) return <p>No encontrado</p>;

  const companyName =
    typeof board.company === "object"
      ? board.company.name
      : "Sin empresa";

  const renderSection = (title: string, images: string[]) => {
    if (!images?.length) return null;

    return (
      <div className="bg-white p-5 rounded shadow">
        <h2 className="font-semibold mb-3">{title}</h2>

        <div className="grid grid-cols-3 gap-3">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => setSelectedImage(img)}
              className="h-40 w-full object-cover cursor-pointer rounded"
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-6">

      <button onClick={() => navigate(-1)}>
        <ArrowLeft /> Volver
      </button>

      <h1 className="text-2xl font-bold">{board.name}</h1>
      <p className="text-sm text-gray-500">{companyName}</p>

      {/* INFO GENERAL */}
      <div className="bg-white p-5 rounded shadow space-y-2">
        <p><strong>Tipo:</strong> {board.type}</p>
        <p><strong>Sistema:</strong> {board.sistema}</p>
        <p><strong>Estado:</strong> {board.estadoGeneral}</p>
        <p><strong>Tensión:</strong> {board.tensionNominal}</p>
        <p><strong>Fases:</strong> {board.numeroFases}</p>
        <p><strong>Neutro:</strong> {board.incluyeNeutro ? "Sí" : "No"}</p>
        <p><strong>Ubicación:</strong> {board.location}</p>
        <p><strong>Descripción:</strong> {board.description}</p>
      </div>

      {/* MAIN BREAKER */}
      {board.mainBreaker && (
        <div className="bg-white p-5 rounded shadow">
          <h2 className="font-semibold mb-2">Main Breaker</h2>
          <p>Amperaje: {board.mainBreaker.amperaje}</p>
          <p>Polos: {board.mainBreaker.polos}</p>
          <p>Marca: {board.mainBreaker.marca}</p>
          <p>Modelo: {board.mainBreaker.modelo}</p>
        </div>
      )}

      {/* PROTECCION */}
      {board.proteccion && (
        <div className="bg-white p-5 rounded shadow">
          <h2 className="font-semibold mb-2">Protección</h2>
          <p>Sobretensión: {board.proteccion.sobretension ? "Sí" : "No"}</p>
          <p>Marca: {board.proteccion.marca}</p>
          <p>Modelo: {board.proteccion.modelo}</p>
        </div>
      )}

      {/* CIRCUITS */}
      {board.circuits?.length > 0 && (
        <div className="bg-white p-5 rounded shadow">
          <h2 className="font-semibold mb-3">Circuitos</h2>

          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th>Circuito</th>
                <th>Descripción</th>
                <th>A</th>
                <th>Fase</th>
                <th>Tipo</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {board.circuits.map((c, i) => (
                <tr key={i}>
                  <td>{c.circuito}</td>
                  <td>{c.descripcion}</td>
                  <td>{c.amperaje || "-"}</td>
                  <td>{c.fase || "-"}</td>
                  <td>{c.tipo || "-"}</td>
                  <td>{c.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {renderSection("Unifilar", board.images?.unifilar || [])}
      {renderSection("Galería", board.images?.tablero || [])}
      {renderSection("Termografía", board.images?.termografia || [])}

      {/* MODAL */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex justify-center items-center"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            className="max-w-[90%] max-h-[90%]"
          />
        </div>
      )}
    </section>
  );
};

export default BoardDetailPage;