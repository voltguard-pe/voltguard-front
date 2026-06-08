import {
  Building2,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DeleteUserModal from "../../../components/dashboard/modals/DeleteUserModal";

import {
  deleteCompany,
  getCompanies,
} from "../../../services/company.service";

import type { CompanyResponseDTO } from "../../../shared/types/CompanyProps";

const CompaniesDashboardPages = () => {
  const [companies, setCompanies] = useState<CompanyResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCompany, setSelectedCompany] =
    useState<CompanyResponseDTO | null>(null);

  const navigate = useNavigate();

  const fetchCompanies = async () => {
    try {
      const response = await getCompanies();
      setCompanies(response);
    } catch (error) {
      console.error("Error al obtener empresas", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const name = company.name?.toLowerCase() || "";
      const ruc = company.ruc?.toLowerCase() || "";
      const publicCode = company.publicCode?.toLowerCase() || "";

      const value = search.toLowerCase();

      return (
        name.includes(value) ||
        ruc.includes(value) ||
        publicCode.includes(value)
      );
    });
  }, [companies, search]);

  const handleDelete = async () => {
    if (!selectedCompany) return;

    setShowDeleteModal(false);

    try {
      await deleteCompany(selectedCompany.publicCode);

      setCompanies((prev) =>
        prev.filter(
          (company) =>
            company.publicCode !== selectedCompany.publicCode
        )
      );

      setSelectedCompany(null);
    } catch (error) {
      console.error("Error al eliminar empresa", error);
    }
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="h-24 animate-pulse rounded-3xl bg-slate-200" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="h-32 animate-pulse rounded-3xl bg-slate-200" />
          <div className="h-32 animate-pulse rounded-3xl bg-slate-200" />
          <div className="h-32 animate-pulse rounded-3xl bg-slate-200" />
        </div>

        <div className="h-96 animate-pulse rounded-3xl bg-slate-200" />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      
      {/* ── ENCABEZADO Y ACCIONES PRINCIPALES ── */}
      <div 
        style={{ animation: "fadeUp 0.4s ease both" }}
        className="flex flex-col justify-between gap-4 md:flex-row md:items-center"
      >
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Gestionar empresas
          </h1>

          <p className="mt-0.5 text-sm text-slate-500">
            Administra las empresas registradas en Voltguard.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard/companies/create")}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-2.5 text-xs font-bold text-white transition-all duration-300 hover:bg-[#087fb3] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0797d5]/20 cursor-pointer"
        >
          <Plus size={15} />
          Nueva empresa
        </button>
      </div>

      {/* ── MINI INDICADORES (CASCADA FLUDA) ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { title: "Total empresas", value: companies.length, icon: Building2, bg: "bg-[#0797d5]/10 text-[#0797d5]", delay: "40ms" },
          { title: "Empresas con RUC", value: companies.filter((c) => c.ruc).length, icon: FileText, bg: "bg-[#8ccf2f]/15 text-[#3aaa35]", delay: "80ms" },
          { title: "Resultados visibles", value: filteredCompanies.length, icon: Search, bg: "bg-slate-100 text-slate-700", delay: "120ms" }
        ].map((card, i) => {
          const CardIcon = card.icon;
          return (
            <div
              key={i}
              style={{ animation: "fadeUp 0.4s ease both", animationDelay: card.delay }}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {card.title}
                  </p>

                  <h3 className="mt-1.5 text-2xl font-black text-slate-950 tracking-tight">
                    {card.value}
                  </h3>
                </div>

                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${card.bg}`}>
                  <CardIcon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── BARRA DE BÚSQUEDA ── */}
      <div 
        style={{ animation: "fadeUp 0.4s ease 180ms both" }}
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 md:max-w-md">
          <Search size={18} className="text-slate-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, RUC o código..."
            className="w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* ── CONTENEDOR PRINCIPAL / TABLA ── */}
      <div 
        style={{ animation: "fadeUp 0.5s ease 220ms both" }}
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm border-collapse">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Empresa</th>
                <th className="px-6 py-4">RUC</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredCompanies.map((company, index) => (
                <tr
                  key={company.publicCode}
                  style={{
                    animation: "fadeUp 0.35s ease both",
                    animationDelay: `${index * 30}ms` // Renderizado secuencial ultra veloz
                  }}
                  className="transition-colors duration-150 hover:bg-slate-50/60"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0797d5] to-[#8ccf2f] text-sm font-black text-white shadow-sm">
                        {company.name?.charAt(0)}
                      </div>

                      <div>
                        <p className="font-bold text-slate-950">
                          {company.name}
                        </p>

                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Empresa registrada
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-3.5 text-slate-600 font-medium">
                    {company.ruc || "Sin RUC"}
                  </td>

                  <td className="px-6 py-3.5">
                    <div className="flex justify-end gap-1">
                      {/* <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/dashboard/companies/${company.publicCode}`
                          )
                        }
                        className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition-colors duration-200 hover:bg-[#0797d5]/10 hover:text-[#0797d5] cursor-pointer"
                        title="Ver empresa"
                      >
                        <Eye size={16} />
                      </button> */}

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/dashboard/companies/${company.publicCode}/edit`
                          )
                        }
                        className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition-colors duration-200 hover:bg-[#8ccf2f]/15 hover:text-[#3aaa35] cursor-pointer"
                        title="Editar empresa"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCompany(company);
                          setShowDeleteModal(true);
                        }}
                        className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                        title="Eliminar empresa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCompanies.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-16 text-center text-xs font-medium text-slate-500"
                  >
                    No se encontraron empresas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteUserModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />
      )}
    </section>
  );
};

export default CompaniesDashboardPages;