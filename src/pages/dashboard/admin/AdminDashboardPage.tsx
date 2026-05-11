import {
  Eye,
  Search,
  ShieldUser,
  User2,
  UserRoundCog,
  Users,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DeleteUserModal from "../../../components/dashboard/modals/DeleteUserModal";
import { deleteUser, getAllUsers } from "../../../services/users.service";
import type { UserProps } from "../../../shared/types/UserProps";

const AdminDashboardPage = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);

  const [users, setUsers] = useState<UserProps[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsers(response);
      } catch (error) {
        console.error("Error al obtener todos los usuarios", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();

      const matchesSearch =
        fullName.includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "ALL" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalUsers = users.length;
  const totalAdmins = users.filter((user) => user.role === "ADMIN").length;
  const totalSuperAdmins = users.filter(
    (user) => user.role === "SUPERADMIN"
  ).length;
  const activeUsers = users.filter((user) => user.isActive).length;

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
        <div className="h-96 animate-pulse rounded-3xl bg-slate-200" />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Gestionar usuarios
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Lista de todos los usuarios registrados en Voltguard.
          </p>
        </div>

        {/* <button className="rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087fb3]">
          Crear usuario
        </button> */}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total usuarios</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-950">
                {totalUsers}
              </h3>
            </div>

            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#8ccf2f]/15 text-[#3aaa35]">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Administradores</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-950">
                {totalAdmins}
              </h3>
            </div>

            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
              <UserRoundCog size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Superadmin</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-950">
                {totalSuperAdmins}
              </h3>
            </div>

            <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
              <ShieldUser size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Usuarios activos</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-950">
                {activeUsers}
              </h3>
            </div>

            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <User2 size={24} />
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
              placeholder="Buscar por nombre o email..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none"
          >
            <option value="ALL">Todos los roles</option>
            <option value="SUPERADMIN">Superadmin</option>
            <option value="ADMIN">Administrador</option>
            <option value="USER">Usuario</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Usuario</th>
                <th className="px-5 py-4 font-semibold">Email</th>
                <th className="px-5 py-4 font-semibold">Rol</th>
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
                    {user.email}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                        user.role === "SUPERADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : user.role === "ADMIN"
                          ? "bg-[#0797d5]/10 text-[#0797d5]"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {user.role === "SUPERADMIN" ? (
                        <ShieldUser size={15} />
                      ) : user.role === "ADMIN" ? (
                        <UserRoundCog size={15} />
                      ) : (
                        <User2 size={15} />
                      )}

                      {user.role === "SUPERADMIN"
                        ? "Superadmin"
                        : user.role === "ADMIN"
                        ? "Administrador"
                        : "Usuario"}
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
                    <div className="flex justify-end">
                      <button
                        onClick={() =>
                          navigate(`/dashboard/users/${user._id}`)
                        }
                        className="flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-[#0797d5]/10 hover:text-[#0797d5]"
                        title="Ver usuario"
                      >
                        <Eye size={18} />
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
                    No se encontraron usuarios.
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

export default AdminDashboardPage;