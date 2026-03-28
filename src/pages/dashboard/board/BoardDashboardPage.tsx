import { Pencil, QrCode, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteFileModal from "../../../components/dashboard/modals/DeleteFileModal";
import QrModal from "../../../components/dashboard/modals/QrModal";
import {
  deleteBoard,
  getCompanyBoards,
} from "../../../services/board.service";
import type { BoardResponseDTO } from "../../../shared/types/BoardProps";

const BoardDashboardPage = () => {
  const navigate = useNavigate();

  const [boards, setBoards] = useState<BoardResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<BoardResponseDTO | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedQrBoard, setSelectedQrBoard] = useState<BoardResponseDTO | null>(null);

  const fetchBoards = async () => {
    try {
      const response = await getCompanyBoards();
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
      await deleteBoard(selectedBoard._id);
      await fetchBoards();
    } catch (error) {
      console.error("Error eliminando board", error);
    } finally {
      setShowDeleteModal(false);
      setSelectedBoard(null);
    }
  };

  const handleOpenQr = (board: BoardResponseDTO) => {
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
          <p className="text-sm text-gray-500">Lista de tableros de tu empresa</p>
        </div>

        <button
          onClick={() => navigate("/dashboard/boards/create")}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          Crear tablero
        </button>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-4 text-left">Nombre</th>
              <th className="px-6 py-4 text-left">Ubicación</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {boards.map((board) => (
              <tr key={board._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{board.name}</td>
                <td className="px-6 py-4 text-gray-600">
                  {board.location || "Sin ubicación"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-3">
                    <button
                      className="cursor-pointer text-blue-600 hover:text-blue-700"
                      onClick={() => handleOpenQr(board)}
                    >
                      <QrCode size={18} />
                    </button>

                    <button
                      className="cursor-pointer text-yellow-600 hover:text-yellow-700"
                      onClick={() => navigate(`/dashboard/boards/${board._id}/edit`)}
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      className="cursor-pointer text-red-600 hover:text-red-700"
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
          qrUrl={`${import.meta.env.VITE_FRONT_URL}/board/${selectedQrBoard.code}`}
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