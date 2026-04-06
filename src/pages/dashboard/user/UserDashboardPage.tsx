import { useEffect, useState } from "react";
import { getBoards } from "../../../services/board.service";
import { useAuth } from "../../../shared/hooks/useAuth";
import type { BoardResponseDTO } from "../../../shared/types/BoardProps";

const UserDashboardPage = () => {
    const { auth } = useAuth();
    const [boards, setBoards] = useState<BoardResponseDTO[]>([]);

    useEffect(() => {
        getBoards().then(setBoards);
    }, []);

    console.log("Boards del usuario:", boards);

    return (
        <section className="flex flex-col gap-y-6">

            {/* 👋 Bienvenida */}
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                    Bienvenido, {auth?.firstname} 👋
                </h1>
            </div>

            {/* 📊 Cards resumen */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

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

            </div> */}

            {/* 📋 Lista de tableros */}
            

        </section>
    );
}

export default UserDashboardPage;