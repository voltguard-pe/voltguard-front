import { useEffect, useMemo, useState } from "react";
import { Building2, Eye, FileText, Plus, Search, Trash2, Loader2, Download } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";

// Servicios
import { getDocumentsByCompany, deleteDocument } from "../../../services/document.service";
import { getCompanies } from "../../../services/company.service";
import type { DocumentResponseDTO, CompanySummaryDTO } from "../../../shared/types/BoardProps";
import { UploadDocumentsModal } from "../../../components/dashboard/modals/UploadDocumentsModal";
import { useSidebar } from "../../../contexts/SidebarContext";

// Un documento cuenta como informe si su category es "informe".
// (Requiere que el backend guarde y devuelva el campo `category`.)
const isReport = (d: DocumentResponseDTO) => (d as any).category === "informe";

interface CompanyGroup {
  publicCode: string;
  name: string;
  reports: DocumentResponseDTO[];
}

const ReportDashboardPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { triggerRefresh } = useSidebar();
  const [search, setSearch] = useState("");
  // Si vienes desde el sidebar (?company=CODIGO), la empresa llega preseleccionada
  const [selectedCompany, setSelectedCompany] = useState(searchParams.get("company") ?? "");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [companiesList, setCompaniesList] = useState<CompanySummaryDTO[]>([]);
  const [groupedData, setGroupedData] = useState<CompanyGroup[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar lista de empresas iniciales
  useEffect(() => {
    const loadInitialCompanies = async () => {
      try {
        const companies = await getCompanies();
        setCompaniesList(companies);
      } catch {
        toast.error("Error al cargar el catálogo de empresas");
      }
    };
    loadInitialCompanies();
  }, []);

  // Cargar informes por empresa
  const fetchAllData = async () => {
    if (companiesList.length === 0) return;
    setLoading(true);
    try {
      const activeCompanies = companiesList.filter((c) => c.publicCode);

      const promises = activeCompanies.map(async (company) => {
        const docs = await getDocumentsByCompany(company.publicCode!);
        return {
          publicCode: company.publicCode!,
          name: company.name,
          reports: (docs || []).filter(isReport),
        };
      });

      const results = await Promise.all(promises);
      setGroupedData(results);
    } catch {
      toast.error("Error al sincronizar los informes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [companiesList]);

  // Filtros en memoria
  const filteredCompanies = useMemo(() => {
    return groupedData
      .filter((company) => (selectedCompany ? company.publicCode === selectedCompany : true))
      .map((company) => ({
        ...company,
        reports: company.reports.filter((r) =>
          r.title.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((company) => company.reports.length > 0);
  }, [search, selectedCompany, groupedData]);

  // Total global de informes
  const totalReports = useMemo(
    () => groupedData.reduce((acc, c) => acc + c.reports.length, 0),
    [groupedData]
  );

  const handleDelete = async (reportId: string, companyPublicCode?: string) => {
    if (!confirm("¿Deseas remover este informe permanentemente?")) return;
    try {
      await deleteDocument(reportId);
      toast.success("Informe eliminado correctamente");
      if (companyPublicCode) {
        triggerRefresh(companyPublicCode);
      }
      fetchAllData();
    } catch {
      toast.error("Imposible eliminar el informe");
    }
  };

  const downloadPdfFile = (url: string) => {
    if (!url) return;
    const downloadUrl = url.includes("/upload/")
      ? url.replace("/upload/", "/upload/fl_attachment/")
      : url;
    window.location.assign(downloadUrl);
  };

  return (
    <div className="space-y-6">
      {/* ── ENCABEZADO PRINCIPAL ── */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Informes por Empresa</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Gestiona los informes técnicos almacenados por cada empresa.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087fb3] cursor-pointer shadow-sm active:scale-98"
        >
          <Plus size={18} /> Nuevo informe
        </button>
      </div>

      {/* ── TARJETAS DE INDICADORES (KPIs) ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500">
              <FileText size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Informes Totales</p>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight mt-0.5">
                {loading ? "..." : totalReports}
              </h2>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#8ccf2f]/15 text-[#3aaa35]">
              <Building2 size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Empresas Registradas</p>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight mt-0.5">
                {companiesList.length}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* ── BARRA DE CONTROL DE FILTROS ── */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar informe por título..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#0797d5]"
            />
          </div>

          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0797d5] lg:max-w-xs cursor-pointer"
          >
            <option value="">Todas las empresas</option>
            {companiesList.map((company) => (
              <option key={company.publicCode} value={company.publicCode}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        {/* ── TABLAS POR EMPRESA ── */}
        <div className="space-y-5 p-5">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-[#0797d5]" size={32} />
            </div>
          ) : (
            filteredCompanies.map((company) => (
              <section
                key={company.publicCode}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs"
              >
                {/* Cabecera de la empresa */}
                <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-[#0797d5]/10 text-[#0797d5]">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h2 className="font-black text-slate-950 tracking-tight">{company.name}</h2>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">Código: {company.publicCode}</p>
                    </div>
                  </div>
                  <span className="w-fit rounded-xl bg-[#8ccf2f]/15 px-3 py-1 text-xs font-bold text-[#3aaa35]">
                    {company.reports.length} archivos
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left border-collapse">
                    <thead className="text-[11px] font-bold uppercase text-slate-400 bg-slate-50/30 border-b border-slate-100 tracking-wider">
                      <tr>
                        <th className="px-5 py-3.5">Informe</th>
                        <th className="px-5 py-3.5">Fecha de Carga</th>
                        <th className="px-5 py-3.5 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {company.reports.map((report) => (
                        <tr key={report._id} className="transition-colors hover:bg-slate-50/50">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-500">
                                <FileText size={18} />
                              </div>
                              <div>
                                <p className="font-bold text-slate-950 text-sm">{report.title}</p>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {report._id.slice(0, 10)}...</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-xs font-medium text-slate-500">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex justify-end gap-1">
                              {/* Descargar */}
                              <button
                                type="button"
                                onClick={() => downloadPdfFile(report.cloudinaryUrl)}
                                title="Descargar archivo PDF"
                                className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-950 cursor-pointer"
                              >
                                <Download size={16} />
                              </button>

                              {/* Ver visor interno */}
                              <button
                                type="button"
                                onClick={() => navigate(`/dashboard/reports/view/${report._id}`)}
                                title="Visualizar informe"
                                className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-950 cursor-pointer"
                              >
                                <Eye size={16} />
                              </button>

                              {/* Eliminar */}
                              <button
                                type="button"
                                onClick={() => handleDelete(report._id, company.publicCode)}
                                title="Eliminar informe"
                                className="flex size-9 items-center justify-center rounded-xl text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))
          )}

          {/* Estado vacío */}
          {!loading && filteredCompanies.length === 0 && (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                <FileText size={26} />
              </div>
              <h3 className="mt-4 font-bold text-slate-950">Sin informes</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
                No se detectaron informes para el criterio ingresado.
              </p>
            </div>
          )}
        </div>
      </div>

      <UploadDocumentsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        companies={companiesList}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchAllData();
        }}
      />
    </div>
  );
};

export default ReportDashboardPage;
