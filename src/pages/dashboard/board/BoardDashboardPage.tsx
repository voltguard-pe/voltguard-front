import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteBoard,
  getBoards
} from "../../../services/board.service";

const BoardDashboardPage = () => {
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const data = await getBoards();
      setBoards(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar tablero?")) return;
    await deleteBoard(id);
    fetchBoards();
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando tableros...</p>;
  }

  return (
    <section className="flex flex-col gap-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tableros</h1>
          <p className="text-sm text-gray-500">Lista de todos los tableros eléctricos registrados en el sistema</p>
        </div>

        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition" onClick={() => navigate("/dashboard/boards/create")}>
          <Plus size={18} />
          Nuevo tablero
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
                    {/* <button
                      className="cursor-pointer text-blue-600 hover:text-blue-700"
                      onClick={() => handleOpenQr(board)}
                    >
                      <QrCode size={18} />
                    </button> */}

                    <button
                      className="cursor-pointer text-yellow-600 hover:text-yellow-700"
                      onClick={() => navigate(`/dashboard/boards/${board._id}/edit`)}
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      className="cursor-pointer text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(board._id)}
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

      {/* {showQrModal && selectedQrBoard && (
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
      )} */}
    </section>
  );
};

export default BoardDashboardPage;