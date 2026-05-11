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
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Gestionar administradores
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Lista de administradores de empresas registrados en Voltguard.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard/admins/create")}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087fb3]"
        >
          <Plus size={18} />
          Nuevo administrador
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total admins</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-950">
                {totalAdmins}
              </h3>
            </div>

            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
              <ShieldCheck size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Activos</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-950">
                {activeAdmins}
              </h3>
            </div>

            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#8ccf2f]/15 text-[#3aaa35]">
              <UserCheck size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Inactivos</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-950">
                {inactiveAdmins}
              </h3>
            </div>

            <div className="flex size-12 items-center justify-center rounded-2xl bg-red-100 text-red-700">
              <UserX size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Con empresa</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-950">
                {adminsWithCompany}
              </h3>
            </div>

            <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Building2 size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:max-w-md">
            <Search size={18} className="text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, email o empresa..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none"
          >
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Administrador</th>
                <th className="px-5 py-4 font-semibold">Email</th>
                <th className="px-5 py-4 font-semibold">Empresa</th>
                <th className="px-5 py-4 font-semibold">Estado</th>
                <th className="px-5 py-4 text-right font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] text-sm font-bold text-white">
                        {user.firstname?.charAt(0)}
                        {user.lastname?.charAt(0)}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-950">
                          {user.firstname} {user.lastname}
                        </p>

                        <p className="text-xs text-slate-500">
                          ID: {user._id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {user.email || "Sin email"}
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      <Building2 size={14} />
                      {getCompanyName(user)}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.isActive
                          ? "bg-[#8ccf2f]/15 text-[#3aaa35]"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/dashboard/admins/${user._id}`)}
                        className="flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-[#0797d5]/10 hover:text-[#0797d5]"
                        title="Ver administrador"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/dashboard/admins/${user._id}/edit`)
                        }
                        className="flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-[#8ccf2f]/15 hover:text-[#3aaa35]"
                        title="Editar administrador"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteModal(true);
                        }}
                        className="flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-100 hover:text-red-700"
                        title="Eliminar administrador"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-slate-500"
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