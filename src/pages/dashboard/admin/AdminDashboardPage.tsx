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
      
      {/* ── ENCABEZADO Y TÍTULO PRINCIPAL ── */}
      <div 
        style={{ animation: "fadeUp 0.4s ease both" }}
        className="flex flex-col justify-between gap-4 md:flex-row md:items-center"
      >
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">
            Gestionar usuarios
          </h1>

          <p className="mt-0.5 text-sm text-slate-500">
            Lista de todos los usuarios registrados en Voltguard.
          </p>
        </div>

        {/* <button className="rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087fb3]">
          Crear usuario
        </button> */}
      </div>

      {/* ── TARJETAS MÉTRICAS (CASCADA FLUDA) ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Total usuarios", value: totalUsers, icon: Users, bg: "bg-[#8ccf2f]/15 text-[#3aaa35]", delay: "40ms" },
          { title: "Administradores", value: totalAdmins, icon: UserRoundCog, bg: "bg-[#0797d5]/10 text-[#0797d5]", delay: "80ms" },
          { title: "Superadmin", value: totalSuperAdmins, icon: ShieldUser, bg: "bg-purple-50 text-purple-700", delay: "120ms" },
          { title: "Usuarios activos", value: activeUsers, icon: User2, bg: "bg-emerald-50 text-emerald-700", delay: "160ms" }
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

      {/* ── BARRA DE BÚSQUEDA Y FILTRO DE ROL ── */}
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
              placeholder="Buscar por nombre o email..."
              className="w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 outline-none transition-all hover:border-slate-300 cursor-pointer"
          >
            <option value="ALL">Todos los roles</option>
            <option value="SUPERADMIN">Superadmin</option>
            <option value="ADMIN">Administrador</option>
            <option value="USER">Usuario</option>
          </select>
        </div>
      </div>

      {/* ── CONTENEDOR PRINCIPAL / TABLA ── */}
      <div 
        style={{ animation: "fadeUp 0.5s ease 240ms both" }}
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm border-collapse">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Rol</th>
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
                    animationDelay: `${index * 30}ms` // Renderizado secuencial ultra veloz
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
                    {user.email}
                  </td>

                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[11px] font-bold ${
                        user.role === "SUPERADMIN"
                          ? "bg-purple-50 text-purple-700"
                          : user.role === "ADMIN"
                          ? "bg-[#0797d5]/10 text-[#0797d5]"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {user.role === "SUPERADMIN" ? (
                        <ShieldUser size={13} />
                      ) : user.role === "ADMIN" ? (
                        <UserRoundCog size={13} />
                      ) : (
                        <User2 size={13} />
                      )}

                      {user.role === "SUPERADMIN"
                        ? "Superadmin"
                        : user.role === "ADMIN"
                        ? "Administrador"
                        : "Usuario"}
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
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/dashboard/users/${user._id}`)
                        }
                        className="flex size-9 items-center justify-center rounded-xl text-slate-400 transition-colors duration-200 hover:bg-[#0797d5]/10 hover:text-[#0797d5] cursor-pointer"
                        title="Ver usuario"
                      >
                        <Eye size={16} />
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