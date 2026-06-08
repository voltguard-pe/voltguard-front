import {
  Building2,
  Eye,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DeleteUserModal from "../../../components/dashboard/modals/DeleteUserModal";
import { deleteUser, getAdmins } from "../../../services/users.service";
import type { UserProps } from "../../../shared/types/UserProps";

const CompanyDashboardPage = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);

  const [users, setUsers] = useState<UserProps[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await getAdmins();
      setUsers(response);
    } catch (error) {
      console.error("Error al obtener administradores", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getCompanyName = (user: UserProps) => {
    if (!user.companyPublicCode) return "Sin empresa";

    return typeof user.companyPublicCode === "string"
      ? user.companyPublicCode
      : user.companyPublicCode.name;
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
      const companyName = getCompanyName(user).toLowerCase();

      const matchesSearch =
        fullName.includes(search.toLowerCase()) ||
        companyName.includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && user.isActive) ||
        (statusFilter === "INACTIVE" && !user.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

  const totalAdmins = users.length;
  const activeAdmins = users.filter((user) => user.isActive).length;
  const inactiveAdmins = users.filter((user) => !user.isActive).length;
  const adminsWithCompany = users.filter((user) => user.companyPublicCode).length;

  const handleDelete = async () => {
    if (!selectedUser) return;

    setShowDeleteModal(false);

    await deleteUser(selectedUser._id);

    setUsers((prev) =>
      prev.filter((user) => user._id !== selectedUser._id)
    );

    setSelectedUser(null);
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="h-24 animate-pulse rounded-3xl bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="h-32 animate-pulse rounded-3xl bg-slate-200" />
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
      
      {/* ── ENCABEZADO Y ACCIÓN PRINCIPAL ── */}
      <div 
        style={{ animation: "fadeUp 0.4s ease both" }}
        className="flex flex-col justify-between gap-4 md:flex-row md:items-center"
      >
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Gestionar administradores
          </h1>

          <p className="mt-0.5 text-sm text-slate-500">
            Lista de administradores de empresas registrados en Voltguard.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard/admins/create")}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-2.5 text-xs font-bold text-white transition-all duration-300 hover:bg-[#087fb3] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0797d5]/20 cursor-pointer"
        >
          <Plus size={15} />
          Nuevo administrador
        </button>
      </div>

      {/* ── TARJETAS MÉTRICAS EN CASCADA ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Total admins", value: totalAdmins, icon: ShieldCheck, bg: "bg-[#0797d5]/10 text-[#0797d5]", delay: "40ms" },
          { title: "Activos", value: activeAdmins, icon: UserCheck, bg: "bg-[#8ccf2f]/15 text-[#3aaa35]", delay: "80ms" },
          { title: "Inactivos", value: inactiveAdmins, icon: UserX, bg: "bg-red-50 text-red-600", delay: "120ms" },
          { title: "Con empresa", value: adminsWithCompany, icon: Building2, bg: "bg-slate-100 text-slate-700", delay: "160ms" }
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
                  <p className="text-xs font-medium text-slate-500">{card.title}</p>
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

      {/* ── FILTROS DE BÚSQUEDA Y ESTADO ── */}
      <div 
        style={{ animation: "fadeUp 0.4s ease 200ms both" }}
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 md:max-w-md">
            <Search size={18} className="text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, email o empresa..."
              className="w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 outline-none transition-all hover:border-slate-300 cursor-pointer"
          >
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
          </select>
        </div>
      </div>

      {/* ── TABLA PRINCIPAL CONTENEDORA ── */}
      <div 
        style={{ animation: "fadeUp 0.5s ease 240ms both" }}
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm border-collapse">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Administrador</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Empresa</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredUsers.map((user, index) => (
                <tr
                  key={user._id}
                  style={{
                    animation: "fadeUp 0.35s ease both",
                    animationDelay: `${index * 30}ms`
                  }}
                  className="transition-colors duration-150 hover:bg-slate-50/60"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0797d5] to-[#8ccf2f] text-xs font-black text-white shadow-sm uppercase">
                        {user.firstname?.charAt(0)}
                        {user.lastname?.charAt(0)}
                      </div>

                      <div>
                        <p className="font-bold text-slate-950">
                          {user.firstname} {user.lastname}
                        </p>

                        <p className="text-[11px] text-slate-400 mt-0.5">
                          ID: {user._id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-3.5 text-slate-600 font-medium">
                    {user.email || "Sin email"}
                  </td>

                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                      <Building2 size={12} className="text-slate-400" />
                      {getCompanyName(user)}
                    </span>
                  </td>

                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex rounded-xl px-2.5 py-1 text-[11px] font-bold ${
                        user.isActive
                          ? "bg-[#8ccf2f]/15 text-[#3aaa35]"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {user.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td className="px-6 py-3.5">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/dashboard/admins/${user._id}`)}
                        className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition-colors duration-200 hover:bg-[#0797d5]/10 hover:text-[#0797d5] cursor-pointer"
                        title="Ver administrador"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/dashboard/admins/${user._id}/edit`)
                        }
                        className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition-colors duration-200 hover:bg-[#8ccf2f]/15 hover:text-[#3aaa35] cursor-pointer"
                        title="Editar administrador"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteModal(true);
                        }}
                        className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                        title="Eliminar administrador"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-xs font-medium text-slate-500"
                  >
                    No se encontraron administradores.
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

export default CompanyDashboardPage;