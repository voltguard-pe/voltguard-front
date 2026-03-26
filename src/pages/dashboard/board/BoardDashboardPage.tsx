import { Pencil, QrCode, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DeleteFileModal from "../../../components/dashboard/modals/DeleteFileModal";
import { deleteBoard, getAllBoards } from "../../../services/board.service";
import type { PageProps } from "../../../shared/types/PageProps";
import QrModal from "../../../components/dashboard/modals/QrModal";

export interface BoardPayload {
  id: number;
  name: string;
  type: string;
  tensionNominal: number;
  numeroFases: number;
  incluyeNeutro: boolean;
}

const BoardDashboardPage = () => {
  const navigate = useNavigate();

  const [boards, setBoards] = useState<PageProps<BoardPayload>>();
  const [loading, setLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<BoardPayload | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1) - 1;

  const pageSize = 5;

  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedQrBoard, setSelectedQrBoard] = useState<BoardPayload | null>(null);

  const fetchBoards = async () => {
    try {
      // const response = await getBoards(auth.id);
      const response = await getAllBoards(page, pageSize)
      console.log(response)
      setBoards(response);
    } catch (error) {
      console.error("Error obteniendo boards", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleDelete = async () => {
    if (!selectedBoard) return;

    try {
      await deleteBoard(selectedBoard.id);
      // Refrescar lista desde backend
      await fetchBoards();
    } catch (error) {
      console.error("Error eliminando board", error);
    } finally {
      setShowDeleteModal(false);
      setSelectedBoard(null);
    }
  };

  const handleOpenQr = (board: BoardPayload) => {
    setSelectedQrBoard(board);
    setShowQrModal(true);
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando tableros...</p>;
  }

  return (
    <section className="flex flex-col gap-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tableros</h1>
          <p className="text-sm text-gray-500">
            Lista de tableros creados
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard/boards/create")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
        >
          Crear tablero
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-4 text-left">Nombre</th>
              <th className="px-6 py-4 text-left">Tipo</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {boards?.content.map((board) => (
              <tr key={board.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">
                  {board.name}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {board.type}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-3">
                    {/* Este boton debe abrir un modal donde se vera el codigo qr con la opcion de descargar */}
                    <button
                      className="text-blue-600 hover:text-blue-700 cursor-pointer"
                      onClick={() => handleOpenQr(board)}
                    >
                      <QrCode size={18} />
                    </button>

                    <button
                      className="text-yellow-600 hover:text-yellow-700 cursor-pointer"
                      onClick={() => navigate(`/dashboard/boards/${board.id}/edit`)}
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      className="text-red-600 hover:text-red-700 cursor-pointer"
                      onClick={() => {
                        setSelectedBoard(board);
                        setShowDeleteModal(true);
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showQrModal && selectedQrBoard && (
        <QrModal
          boardName={selectedQrBoard.name}
          qrUrl={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://tusistema.com/qr/${selectedQrBoard.id}`}
          onClose={() => setShowQrModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteFileModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />
      )}
    </section>
  );
};

export default BoardDashboardPage;
