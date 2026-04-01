import { useEffect, useState } from "react";
import { useAuth } from "../../../shared/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getBoards } from "../../../services/board.service";
import { BarChart2, Eye } from "lucide-react";
import type { BoardResponseDTO } from "../../../shared/types/BoardProps";

const UserDashboardPage = () => {
const { auth } = useAuth();
  const [boards, setBoards] = useState<BoardResponseDTO[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getBoards().then(setBoards);
  }, []);

  return (
    <section className="flex flex-col gap-y-6">

      {/* 👋 Bienvenida */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Bienvenido, {auth?.firstname} 👋
        </h1>
        <p className="text-sm text-gray-500">
          Aquí puedes ver y gestionar tus tableros eléctricos
        </p>
      </div>

      {/* 📊 Cards resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <BarChart2 size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total tableros</p>
            <p className="text-lg font-semibold text-gray-800">
              {boards.length}
            </p>
          </div>
        </div>

      </div>

      {/* 📋 Lista de tableros */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        
        <div className="p-4 border-b">
          <h2 className="text-sm font-semibold text-gray-700">
            Tus tableros
          </h2>
        </div>

        <div className="divide-y">
          {boards.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">
              No tienes tableros registrados
            </p>
          ) : (
            boards.map((board) => (
              <div
                key={board._id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 hover:bg-gray-50"
              >
                {/* Info */}
                <div>
                  <p className="font-medium text-gray-800">
                    {board.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {board.location || "Sin ubicación"}
                  </p>
                </div>

                {/* Acción */}
                <button
                  onClick={() => navigate(`/board/${board.code}`)}
                  className="flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition w-full md:w-auto"
                >
                  <Eye size={16} />
                  Ver tablero
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </section>
  );
}

export default UserDashboardPage;