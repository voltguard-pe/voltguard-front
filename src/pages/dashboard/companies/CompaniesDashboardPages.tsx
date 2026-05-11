import {
  Building2,
  Eye,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
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
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Gestionar empresas
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Administra las empresas registradas en Voltguard.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard/companies/create")}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087fb3]"
        >
          <Plus size={18} />
          Nueva empresa
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total empresas
              </p>

              <h3 className="mt-2 text-3xl font-bold text-slate-950">
                {companies.length}
              </h3>
            </div>

            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
              <Building2 size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Empresas con RUC
              </p>

              <h3 className="mt-2 text-3xl font-bold text-slate-950">
                {companies.filter((company) => company.ruc).length}
              </h3>
            </div>

            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#8ccf2f]/15 text-[#3aaa35]">
              <FileText size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Resultados visibles
              </p>

              <h3 className="mt-2 text-3xl font-bold text-slate-950">
                {filteredCompanies.length}
              </h3>
            </div>

            <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Search size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:max-w-md">
          <Search size={18} className="text-slate-400" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, RUC o código..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">
                  Empresa
                </th>

                <th className="px-5 py-4 font-semibold">
                  RUC
                </th>

                <th className="px-5 py-4 text-right font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredCompanies.map((company) => (
                <tr
                  key={company.publicCode}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] text-sm font-bold text-white">
                        {company.name?.charAt(0)}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-950">
                          {company.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          Empresa registrada
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {company.ruc || "Sin RUC"}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          navigate(
                            `/dashboard/companies/${company.publicCode}`
                          )
                        }
                        className="flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-[#0797d5]/10 hover:text-[#0797d5]"
                        title="Ver empresa"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() =>
                          navigate(
                            `/dashboard/companies/${company.publicCode}/edit`
                          )
                        }
                        className="flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-[#8ccf2f]/15 hover:text-[#3aaa35]"
                        title="Editar empresa"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedCompany(company);
                          setShowDeleteModal(true);
                        }}
                        className="flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-100 hover:text-red-700"
                        title="Eliminar empresa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCompanies.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-12 text-center text-slate-500"
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