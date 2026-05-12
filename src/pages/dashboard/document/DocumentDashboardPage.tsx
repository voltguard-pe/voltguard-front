import {
  Building2,
  Download,
  Eye,
  FileText,
  Plus,
  Search,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useMemo, useState } from "react";

type CompanyDocument = {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  linkedBoards: number;
};

type CompanyWithDocuments = {
  publicCode: string;
  name: string;
  documents: CompanyDocument[];
};

const companiesWithDocuments: CompanyWithDocuments[] = [
  {
    publicCode: "EMP-001",
    name: "Voltguard Demo",
    documents: [
      {
        id: "DOC-001",
        name: "Certificado de mantenimiento.pdf",
        type: "PDF",
        size: "2.4 MB",
        uploadedAt: "2026-05-10",
        linkedBoards: 3,
      },
      {
        id: "DOC-002",
        name: "Plano eléctrico general.dwg",
        type: "DWG",
        size: "8.1 MB",
        uploadedAt: "2026-05-09",
        linkedBoards: 1,
      },
    ],
  },
  {
    publicCode: "EMP-002",
    name: "Empresa Industrial Norte",
    documents: [
      {
        id: "DOC-003",
        name: "Informe termográfico.pdf",
        type: "PDF",
        size: "3.7 MB",
        uploadedAt: "2026-05-08",
        linkedBoards: 2,
      },
    ],
  },
];

const DocumentDashboardPage = () => {
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");

  const filteredCompanies = useMemo(() => {
    return companiesWithDocuments
      .filter((company) =>
        selectedCompany ? company.publicCode === selectedCompany : true,
      )
      .map((company) => ({
        ...company,
        documents: company.documents.filter((document) =>
          document.name.toLowerCase().includes(search.toLowerCase()),
        ),
      }))
      .filter((company) => company.documents.length > 0);
  }, [search, selectedCompany]);

  const totalDocuments = companiesWithDocuments.reduce(
    (total, company) => total + company.documents.length,
    0,
  );

  const totalLinkedBoards = companiesWithDocuments.reduce(
    (total, company) =>
      total +
      company.documents.reduce(
        (companyTotal, document) => companyTotal + document.linkedBoards,
        0,
      ),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-950">Documentos</h1>

          <p className="mt-1 text-sm text-slate-500">
            Gestiona múltiples documentos por empresa y vincúlalos a los
            registros de tableros eléctricos.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087fb3]">
          <Plus size={18} />
          Nuevo documento
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
              <FileText size={24} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Documentos</p>
              <h2 className="text-2xl font-black text-slate-950">
                {totalDocuments}
              </h2>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#8ccf2f]/15 text-[#3aaa35]">
              <Building2 size={24} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Empresas</p>
              <h2 className="text-2xl font-black text-slate-950">
                {companiesWithDocuments.length}
              </h2>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <UploadCloud size={24} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Vinculados a tableros</p>
              <h2 className="text-2xl font-black text-slate-950">
                {totalLinkedBoards}
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar documento..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#0797d5]"
            />
          </div>

          <select
            value={selectedCompany}
            onChange={(event) => setSelectedCompany(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0797d5] lg:max-w-xs"
          >
            <option value="">Todas las empresas</option>

            {companiesWithDocuments.map((company) => (
              <option key={company.publicCode} value={company.publicCode}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-5 p-5">
          {filteredCompanies.map((company) => (
            <section
              key={company.publicCode}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white"
            >
              <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
                    <Building2 size={22} />
                  </div>

                  <div>
                    <h2 className="font-black text-slate-950">
                      {company.name}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Código: {company.publicCode}
                    </p>
                  </div>
                </div>

                <span className="w-fit rounded-full bg-[#8ccf2f]/15 px-3 py-1 text-xs font-bold text-[#3aaa35]">
                  {company.documents.length} documentos
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-bold">Documento</th>
                      <th className="px-5 py-4 font-bold">Tipo</th>
                      <th className="px-5 py-4 font-bold">Tamaño</th>
                      <th className="px-5 py-4 font-bold">Fecha</th>
                      <th className="px-5 py-4 font-bold">Tableros</th>
                      <th className="px-5 py-4 text-right font-bold">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {company.documents.map((document) => (
                      <tr
                        key={document.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
                              <FileText size={22} />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-950">
                                {document.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                ID: {document.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                            {document.type}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {document.size}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {document.uploadedAt}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-[#8ccf2f]/15 px-3 py-1 text-xs font-bold text-[#3aaa35]">
                            {document.linkedBoards} vinculados
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button className="flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">
                              <Eye size={18} />
                            </button>

                            <button className="flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">
                              <Download size={18} />
                            </button>

                            <button className="flex size-10 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50">
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
          ))}

          {filteredCompanies.length === 0 && (
            <div className="px-5 py-14 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                <FileText size={30} />
              </div>

              <h3 className="mt-4 font-bold text-slate-950">
                No se encontraron documentos
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Intenta cambiar los filtros o carga un nuevo documento.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentDashboardPage;