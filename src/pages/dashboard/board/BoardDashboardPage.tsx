import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, QrCode } from "lucide-react";
import type { BoardResponseDTO } from "../../../shared/types/BoardProps";
import { mockBoards } from "../../../shared/mocks/data";
import QrModal from "../../../components/dashboard/modals/QrModal";
import DeleteBoardModal from "../../../components/dashboard/modals/DeleteBoardModal";

const BoardDashboard = () => {
  const navigate = useNavigate();

  const [boards, setBoards] =
    useState<BoardResponseDTO[]>(Object.values(mockBoards).flat());

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [showQrModal, setShowQrModal] = useState(false);

  // eliminar
  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setBoards((prev) => prev.filter((b) => b._id !== selectedId));
    setShowDeleteModal(false);
  };

  // QR empresa
  const publicCode =
    typeof boards[0]?.company === "string"
      ? "demo"
      : boards[0]?.company.publicCode;

  const qrUrl = `http://localhost:5173/public/${publicCode}`;

  return (
    <section className="flex flex-col gap-y-6 p-4 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tableros</h1>
          <p className="text-sm text-gray-500">
            Lista de tableros de tu empresa
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-white"
          >
            QR Empresa
          </button>

          <button
            onClick={() => navigate("/dashboard/boards/create")}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white"
          >
            Crear tablero
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
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
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {board.name}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {board.location || "Sin ubicación"}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-3">
                      {/* <button
                        onClick={() => setShowQrModal(true)}
                        className="text-gray-700"
                      >
                        <QrCode size={18} />
                      </button> */}

                      <button
                        onClick={() =>
                          navigate(`/dashboard/boards/${board._id}/edit`)
                        }
                        className="text-yellow-600"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(board._id)}
                        className="text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {boards.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-500">
                    No hay tableros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALES */}
      {showQrModal && (
        <QrModal boardName="Recoleta" qrUrl={qrUrl} onClose={() => setShowQrModal(false)} />
      )}

      {showDeleteModal && (
        <DeleteBoardModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </section>
  );
};

export default BoardDashboard;