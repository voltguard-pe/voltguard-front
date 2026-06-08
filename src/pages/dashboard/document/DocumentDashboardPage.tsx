import { useEffect, useMemo, useState } from "react";
import { Building2, Eye, FileText, Plus, Search, Trash2, UploadCloud, Loader2, Link, Download } from "lucide-react";
import { toast } from "react-toastify";

// Servicios reales
import { getDocumentsByCompany, deleteDocument } from "../../../services/document.service";
import { getBoards } from "../../../services/board.service";
import { getCompanies } from "../../../services/company.service"; // 👈 Importamos el servicio corregido
import type { DocumentResponseDTO, CompanySummaryDTO } from "../../../shared/types/BoardProps";
import { UploadDocumentsModal } from "../../../components/dashboard/modals/UploadDocumentsModal";
import { AssignDocToBoardsModal } from "../../../components/dashboard/modals/AssignDocToBoardsModal";

interface CompanyGroup {
  publicCode: string;
  name: string;
  documents: DocumentResponseDTO[];
}

const DocumentDashboardPage = () => {
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ... tus otros estados ...
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activeDocForAssign, setActiveDocForAssign] = useState<{ id: string; title: string; companyCode: string } | null>(null);

  // Estado para guardar las empresas reales traídas de MongoDB
  const [companiesList, setCompaniesList] = useState<CompanySummaryDTO[]>([]);
  const [groupedData, setGroupedData] = useState<CompanyGroup[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar lista de empresas iniciales
  useEffect(() => {
    const loadInitialCompanies = async () => {
      try {
        const companies = await getCompanies();
        setCompaniesList(companies);
      } catch (error) {
        toast.error("Error al cargar el catálogo de empresas");
      }
    };
    loadInitialCompanies();
  }, []);

  // Sincronizar documentos y mapeo de tableros cuando cambie la lista de empresas
  const fetchAllData = async () => {
    if (companiesList.length === 0) return;
    setLoading(true);
    try {
      const activeCompanies = companiesList.filter(c => c.publicCode);

      const promises = activeCompanies.map(async (company) => {
        const docs = await getDocumentsByCompany(company.publicCode!);
        const boardData = await getBoards(company.publicCode!);

        const documentsWithCount = docs.map(doc => {
          // Aseguramos que el ID del documento actual sea un string limpio
          const docIdStr = String(doc._id);

          const matchedBoards = boardData.boards.filter(b => {
            // Evaluamos de manera segura convirtiendo cada ID del tablero a String
            return b.assignedDocuments?.some(ad => {
              // Si vino populado usará ad._id, si vino como ID plano usará el objeto ad directo
              const assignedIdStr = typeof ad === 'object' && ad !== null && '_id' in ad
                ? String((ad as any)._id)
                : String(ad);

              return assignedIdStr === docIdStr;
            });
          }).length;

          return { ...doc, linkedBoards: matchedBoards };
        });

        return {
          publicCode: company.publicCode!,
          name: company.name,
          documents: documentsWithCount as any[]
        };
      });

      const results = await Promise.all(promises);
      setGroupedData(results);
    } catch (error) {
      toast.error("Error al sincronizar el estado documental");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [companiesList]);

  // Filtros en memoria dinámicos
  const filteredCompanies = useMemo(() => {
    return groupedData
      .filter((company) => (selectedCompany ? company.publicCode === selectedCompany : true))
      .map((company) => ({
        ...company,
        documents: company.documents.filter((doc) =>
          doc.title.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((company) => company.documents.length > 0);
  }, [search, selectedCompany, groupedData]);

  // KPIs calculados en tiempo real
  const totalDocuments = useMemo(() =>
    groupedData.reduce((acc, c) => acc + c.documents.length, 0), [groupedData]
  );

  const totalLinkedBoards = useMemo(() =>
    groupedData.reduce((acc, c) => acc + c.documents.reduce((sum: number, d: any) => sum + (d.linkedBoards || 0), 0), 0), [groupedData]
  );

  const handleDelete = async (docId: string) => {
    if (!confirm("¿Deseas remover este documento permanentemente? Se desvinculará de todos los tableros.")) return;
    try {
      await deleteDocument(docId);
      toast.success("Documento eliminado correctamente");
      fetchAllData();
    } catch (err) {
      toast.error("Imposible eliminar el documento");
    }
  };

  // ABRIR EL DOCUMENTO EN UNA NUEVA PESTAÑA DEL NAVEGADOR
  const openPdfInNewTab = async (url: string, title: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      // Forzamos el tipo de contenido explícitamente a PDF
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(pdfBlob);

      // Abrimos en una pestaña nueva con el visor nativo estructurado
      const newTab = window.open(blobUrl, "_blank");

      if (newTab) {
        newTab.document.title = title;
      }
    } catch (error) {
      console.error("Error al interceptar y renderizar el PDF:", error);
      // Fallback: si falla por CORS o red, lo abre directamente en Cloudinary
      window.open(url, "_blank");
    }
  };

  // DESCARGAR EL DOCUMENTO
  const downloadPdfFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error al descargar:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-950">Documentos por Empresa</h1>
          <p className="mt-1 text-sm text-slate-500">Gestiona múltiples certificados PDF por lote y coordina su despliegue en tableros.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087fb3] cursor-pointer shadow-xs"
        >
          <Plus size={18} /> Nuevo documento
        </button>
      </div>

      {/* Tarjetas de Indicadores */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]"><FileText size={24} /></div>
            <div>
              <p className="text-sm text-slate-500">Documentos Globales</p>
              <h2 className="text-2xl font-black text-slate-950">{loading ? "..." : totalDocuments}</h2>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#8ccf2f]/15 text-[#3aaa35]"><Building2 size={24} /></div>
            <div>
              <p className="text-sm text-slate-500">Empresas en la BD</p>
              <h2 className="text-2xl font-black text-slate-950">{companiesList.length}</h2>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700"><UploadCloud size={24} /></div>
            <div>
              <p className="text-sm text-slate-500">Instancias Vinculadas</p>
              <h2 className="text-2xl font-black text-slate-950">{loading ? "..." : totalLinkedBoards}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar certificado por título..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#0797d5]"
            />
          </div>

          <select
            value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0797d5] lg:max-w-xs"
          >
            <option value="">Todas las empresas</option>
            {companiesList.map((company) => (
              <option key={company.publicCode} value={company.publicCode}>{company.name}</option>
            ))}
          </select>
        </div>

        {/* Listado Principal */}
        <div className="space-y-5 p-5">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#0797d5]" size={32} /></div>
          ) : (
            filteredCompanies.map((company) => (
              <section key={company.publicCode} className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]"><Building2 size={22} /></div>
                    <div>
                      <h2 className="font-black text-slate-950">{company.name}</h2>
                      <p className="text-xs text-slate-500">Código corporativo: {company.publicCode}</p>
                    </div>
                  </div>
                  <span className="w-fit rounded-full bg-[#8ccf2f]/15 px-3 py-1 text-xs font-bold text-[#3aaa35]">
                    {company.documents.length} archivos
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] text-left">
                    <thead className="text-xs uppercase text-slate-400 bg-slate-50/50">
                      <tr>
                        <th className="px-5 py-3.5 font-bold">Documento</th>
                        <th className="px-5 py-3.5 font-bold">Categoría</th>
                        <th className="px-5 py-3.5 font-bold">Fecha de Carga</th>
                        <th className="px-5 py-3.5 font-bold">Asignaciones</th>
                        <th className="px-5 py-3.5 text-right font-bold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {company.documents.map((doc: any) => (
                        <tr key={doc._id} className="transition hover:bg-slate-50/60">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><FileText size={20} /></div>
                              <div>
                                <p className="font-semibold text-slate-950 text-sm">{doc.title}</p>
                                <p className="text-[10px] text-slate-400 font-mono">ID: {doc._id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${doc.type === 'OPERATIVIDAD' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                              {doc.type}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-500">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                              {doc.linkedBoards || 0} tableros
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => {
                                  setActiveDocForAssign({ id: doc._id, title: doc.title, companyCode: company.publicCode });
                                  setIsAssignModalOpen(true);
                                }}
                                title="Asignar a múltiples tableros"
                                className="flex size-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-[#0797d5] cursor-pointer"
                              >
                                <Link size={18} /> {/* Icono de enlace de asignación masiva */}
                              </button>
                              <button
                                onClick={() => downloadPdfFile(doc.cloudinaryUrl, doc.title)}
                                title="Descargar archivo PDF"
                                className="flex size-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-950 cursor-pointer transition-colors"
                              >
                                <Download size={18} /> {/* Asegúrate de importar "Download" de lucide-react si lo usas */}
                              </button>
                              <button
                                onClick={() => openPdfInNewTab(doc.cloudinaryUrl, doc.title)}
                                title="Visualizar certificado PDF"
                                className="flex size-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-950 cursor-pointer transition-colors"
                              >
                                <Eye size={18} />
                              </button>
                              <button onClick={() => handleDelete(doc._id)} className="flex size-9 items-center justify-center rounded-xl text-red-500 hover:bg-red-50 cursor-pointer">
                                <Trash2 size={18} />
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

          {!loading && filteredCompanies.length === 0 && (
            <div className="px-5 py-14 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><FileText size={26} /></div>
              <h3 className="mt-4 font-bold text-slate-950">Sin coincindicencias documentales</h3>
              <p className="mt-1 text-sm text-slate-500">No se detectaron registros para el criterio ingresado o debes registrar nuevos documentos.</p>
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

      {/* INYECTAR EL NUEVO MODAL MASIVO AQUÍ */}
      {activeDocForAssign && (
        <AssignDocToBoardsModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setActiveDocForAssign(null);
          }}
          companyPublicCode={activeDocForAssign.companyCode}
          documentId={activeDocForAssign.id}
          documentTitle={activeDocForAssign.title}
          onSuccess={() => fetchAllData()}
        />
      )}
    </div>
  );
};

export default DocumentDashboardPage;