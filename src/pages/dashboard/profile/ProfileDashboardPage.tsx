import {
  Calendar,
  Edit,
  Lock,
  Mail,
  Shield,
  User2,
  Zap,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../shared/hooks/useAuth";
import { formatDate } from "../../../shared/utils/formatDate";
import { getInitials } from "../../../shared/utils/initialsName";

const getRoleLabel = (role?: string) => {
  if (role === "SUPERADMIN") return "Super Administrador";
  if (role === "ADMIN") return "Administrador";
  return "Usuario";
};

const ProfileDashboardPage = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  if (!auth) return null;

  const roleLabel = getRoleLabel(auth.role);

  const stats = [
    {
      label: "Rol",
      value: roleLabel,
      icon: Shield,
    },
    {
      label: "Estado",
      value: "Activo",
      icon: Zap,
    },
    {
      label: "Miembro desde",
      value: auth.createdAt ? formatDate(auth.createdAt) : "Sin fecha",
      icon: Calendar,
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Mi perfil</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gestiona tu información personal y accesos de Voltguard.
        </p>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] p-6 text-white">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
              <div className="flex size-28 items-center justify-center rounded-3xl bg-white/20 text-4xl font-black text-white shadow-lg backdrop-blur">
                {getInitials(auth.firstname, auth.lastname)}
              </div>

              <div>
                <h2 className="text-2xl font-black">
                  {auth.firstname} {auth.lastname}
                </h2>

                <p className="mt-1 text-sm text-white/90">{auth.email}</p>

                <span className="mt-3 inline-flex rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold">
                  {roleLabel}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/dashboard/profile/edit")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
            >
              <Edit size={18} />
              Editar perfil
            </button>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex size-11 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
                  <Icon size={22} />
                </div>

                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {stat.label}
                </p>

                <p className="mt-1 break-words text-sm font-bold text-slate-950">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
              <User2 size={24} />
            </div>

            <div>
              <h3 className="font-bold text-slate-950">
                Información personal
              </h3>
              <p className="text-sm text-slate-500">
                Datos principales de tu cuenta.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Nombre
              </p>
              <p className="mt-1 font-semibold text-slate-950">
                {auth.firstname}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Apellido
              </p>
              <p className="mt-1 font-semibold text-slate-950">
                {auth.lastname}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Mail size={17} />
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Correo electrónico
                </p>
              </div>
              <p className="mt-1 break-words font-semibold text-slate-950">
                {auth.email}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Shield size={17} />
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Rol
                </p>
              </div>
              <p className="mt-1 font-semibold text-slate-950">{roleLabel}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar size={17} />
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Miembro desde
                </p>
              </div>
              <p className="mt-1 font-semibold text-slate-950">
                {auth.createdAt
                  ? formatDate(auth.createdAt)
                  : "Fecha desconocida"}
              </p>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-bold text-slate-950">Acciones</h3>
            <p className="mt-1 text-sm text-slate-500">
              Administra tu perfil y seguridad.
            </p>

            <div className="mt-5 space-y-3">
              <button
                onClick={() => navigate("/dashboard/profile/edit")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087fb3]"
              >
                <Edit size={18} />
                Editar perfil
              </button>

              <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                <Lock size={18} />
                Cambiar contraseña
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#8ccf2f]/15 text-[#3aaa35]">
                <Shield size={22} />
              </div>

              <div>
                <h3 className="font-bold text-slate-950">Cuenta segura</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Mantén tus datos actualizados para mejorar la seguridad y
                  trazabilidad dentro de Voltguard.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
};

export default ProfileDashboardPage;