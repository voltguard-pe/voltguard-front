import { ChevronDown, Eye, Pencil, Plus, QrCode, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteBoard,
  publicGetCompanyBoards,
} from "../../../services/board.service";
import { getCompanies } from "../../../services/company.service";
import type {
  PublicCompanyBoardsItemDTO,
} from "../../../shared/types/BoardProps";
import type { CompanyResponseDTO } from "../../../shared/types/CompanyProps";
import { generateBoardPDF } from "../../../shared/utils/generateBoardPDF";
import { PdfIcon } from "../../../shared/icons/Icons";
import { useAuth } from "../../../shared/hooks/useAuth";
import QRCode from "react-qr-code";

const BoardDashboardPage = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { publicCode } = useParams();

  const [companies, setCompanies] = useState<CompanyResponseDTO[]>([]);
  const [selectedCompany, setSelectedCompany] =
    useState<CompanyResponseDTO | null>(null);
  const [boards, setBoards] = useState<PublicCompanyBoardsItemDTO[]>([]);

  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingBoards, setLoadingBoards] = useState(false);

  const [showQR, setShowQR] = useState(false);

  // 🔥 CLAVE: empresa efectiva
  const effectivePublicCode =
    auth?.role === "ADMIN"
      ? typeof auth.company === "string"
        ? auth.company
        : auth.company?.publicCode
      : publicCode;

  const qrUrl = `${window.location.origin}/dashboard/boards/${effectivePublicCode}`;


  // =========================
  // 🔹 FETCH EMPRESAS (solo SUPERADMIN)
  // =========================
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true);

        const data = await getCompanies();
        setCompanies(data);

        if (publicCode) {
          const companyFound =
            data.find((c) => c.publicCode === publicCode) || null;
          setSelectedCompany(companyFound);
        }
      } catch (error) {
        console.error("Error cargando empresas", error);
      } finally {
        setLoadingCompanies(false);
      }
    };

    if (auth?.role === "SUPERADMIN") {
      fetchCompanies();
    } else {
      setLoadingCompanies(false);
    }
  }, [auth, publicCode]);

  // =========================
  // 🔹 FETCH BOARDS
  // =========================
  useEffect(() => {
    const fetchBoards = async (companyPublicCode: string) => {
      try {
        setLoadingBoards(true);
        const data = await publicGetCompanyBoards(companyPublicCode);
        setBoards(data.boards);
      } catch (error) {
        console.error("Error cargando tableros", error);
        setBoards([]);
      } finally {
        setLoadingBoards(false);
      }
    };

    if (!effectivePublicCode) {
      setBoards([]);
      return;
    }

    fetchBoards(effectivePublicCode);
  }, [effectivePublicCode]);

  // =========================
  // 🔹 CAMBIAR EMPRESA (solo SUPERADMIN)
  // =========================
  const handleSelectCompany = (selectedPublicCode: string) => {
    if (!selectedPublicCode) {
      navigate("/dashboard/boards");
      return;
    }

    navigate(`/dashboard/boards/${selectedPublicCode}`);
  };

  // =========================
  // 🔹 DELETE
  // =========================
  const handleDelete = async (code: string) => {
    if (!effectivePublicCode) return;

    const confirmDelete = confirm("¿Eliminar este tablero?");
    if (!confirmDelete) return;

    try {
      await deleteBoard(effectivePublicCode, code);
      setBoards((prev) => prev.filter((b) => b.code !== code));
      alert("Eliminado correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al eliminar");
    }
  };

  return (
    <section className="flex flex-col gap-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Tableros
          </h1>
          <p className="text-sm text-gray-500">
            {auth?.role === "ADMIN"
              ? "Mostrando tableros de tu empresa"
              : "Selecciona una empresa para ver sus tableros"}
          </p>
        </div>

        {auth?.role === "SUPERADMIN" && (
          <button
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition w-full md:w-auto"
            onClick={() => navigate("/dashboard/boards/create")}
          >
            <Plus size={18} />
            Nuevo tablero
          </button>
        )}

        {auth?.role === "ADMIN" && effectivePublicCode && (
          <button
            onClick={() => setShowQR(true)}
            className="flex items-center justify-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition w-full md:w-auto cursor-pointer"
          >
            <QrCode size={16} />
            Ver QR
          </button>
        )}

        {showQR && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center gap-4">
              <h2 className="text-lg font-semibold">QR de la empresa</h2>

              <QRCode value={qrUrl} size={200} />

              <p className="text-xs text-gray-500 text-center break-all">
                {qrUrl}
              </p>

              <button
                onClick={() => setShowQR(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SELECT SOLO SUPERADMIN */}
      {auth?.role === "SUPERADMIN" && (
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="relative">
            <select
              className="w-full border rounded-lg px-4 py-3 pr-10 text-sm appearance-none bg-white"
              value={selectedCompany?.publicCode || ""}
              onChange={(e) => handleSelectCompany(e.target.value)}
              disabled={loadingCompanies}
            >
              <option value="">
                {loadingCompanies
                  ? "Cargando empresas..."
                  : "Seleccionar empresa"}
              </option>

              {companies.map((company) => (
                <option key={company.publicCode} value={company.publicCode}>
                  {company.name}
                </option>
              ))}
            </select>

            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            />
          </div>
        </div>
      )}

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* 🔥 ADMIN: nunca mostrar "selecciona empresa" */}
        {auth?.role === "ADMIN" && loadingBoards ? (
          <div className="p-6">
            <p className="text-sm text-gray-500">Cargando tableros...</p>
          </div>
        ) : auth?.role === "ADMIN" && boards.length === 0 ? (
          <div className="p-6">
            <p className="text-sm text-gray-500">
              Tu empresa no tiene tableros registrados
            </p>
          </div>
        ) : auth?.role === "SUPERADMIN" && !effectivePublicCode ? (
          <div className="p-6">
            <p className="text-sm text-gray-500">
              Selecciona una empresa para ver sus tableros
            </p>
          </div>
        ) : loadingBoards ? (
          <div className="p-6">
            <p className="text-sm text-gray-500">Cargando tableros...</p>
          </div>
        ) : boards.length === 0 ? (
          <div className="p-6">
            <p className="text-sm text-gray-500">
              Esta empresa no tiene tableros registrados
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    Ubicación
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {boards.map((board) => (
                  <tr key={board.code} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {board.name}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {board.location || "Sin ubicación"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => generateBoardPDF(board)}
                          className="p-2 hover:bg-gray-200 rounded"
                        >
                          <PdfIcon size={18} />
                        </button>

                        <button
                          onClick={() =>
                            navigate(
                              `/dashboard/boards/${effectivePublicCode}/${board.code}`
                            )
                          }
                          className="p-2 hover:bg-indigo-200 rounded text-indigo-600"
                        >
                          <Eye size={18} />
                        </button>

                        {auth?.role === "SUPERADMIN" && (
                          <>
                            <button
                              onClick={() =>
                                navigate(
                                  `/dashboard/boards/${effectivePublicCode}/${board.code}/edit`
                                )
                              }
                              className="p-2 hover:bg-yellow-200 rounded text-yellow-600"
                            >
                              <Pencil size={18} />
                            </button>

                            <button
                              onClick={() => handleDelete(board.code)}
                              className="p-2 hover:bg-red-200 rounded text-red-600"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default BoardDashboardPage;