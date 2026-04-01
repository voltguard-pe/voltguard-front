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

    {/* Header */}
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Tableros
        </h1>
        <p className="text-sm text-gray-500">
          Lista de todos los tableros eléctricos registrados en el sistema
        </p>
      </div>

      <button
        className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition w-full md:w-auto"
        onClick={() => navigate("/dashboard/boards/create")}
      >
        <Plus size={18} />
        Nuevo tablero
      </button>
    </div>

    {/* Tabla */}
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      
      {/* 👇 scroll horizontal en mobile */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 md:px-6 py-3 md:py-4 text-left font-medium">
                Nombre
              </th>
              <th className="px-4 md:px-6 py-3 md:py-4 text-left font-medium">
                Ubicación
              </th>
              <th className="px-4 md:px-6 py-3 md:py-4 text-right font-medium">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {boards.map((board) => (
              <tr key={board._id} className="hover:bg-gray-50">
                
                <td className="px-4 md:px-6 py-3 md:py-4 font-medium text-gray-800 whitespace-nowrap">
                  {board.name}
                </td>

                <td className="px-4 md:px-6 py-3 md:py-4 text-gray-600 whitespace-nowrap">
                  {board.location || "Sin ubicación"}
                </td>

                <td className="px-4 md:px-6 py-3 md:py-4">
                  <div className="flex justify-end gap-3 text-gray-500">
                    
                    <button
                      className="hover:text-yellow-600"
                      onClick={() =>
                        navigate(`/dashboard/boards/${board._id}/edit`)
                      }
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      className="hover:text-red-600"
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
    </div>

  </section>
);
};

export default BoardDashboardPage;