import {
  User,
  Mail,
  Shield,
  Calendar,
  Edit,
  Lock,
} from "lucide-react";
import { useAuth } from "../../../shared/hooks/useAuth";
import { formatDate } from "../../../shared/utils/formatDate";
import { useNavigate } from "react-router-dom";
import { getInitials } from "../../../shared/utils/initialsName";

const stats = [
  { label: "Proyectos", value: "12" },
  { label: "Reportes", value: "32" },
  { label: "Actividad", value: "98%" },
];

const ProfileDashboardPage = () => {
  const { auth } = useAuth();
  const navigate = useNavigate()

  if (!auth) return null; // ⛔ evita renders raros

  return (
    <section className="flex flex-col gap-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mi perfil</h1>
        <p className="text-sm text-gray-500">
          Gestiona tu información personal
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row gap-6">
        {/* Avatar */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <div className="w-28 h-28 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-4xl font-semibold">
            {getInitials(auth.firstname, auth.lastname)}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-800 text-center md:text-start">
            {auth.firstname} {auth.lastname}
          </h2>
          <p className="text-sm text-gray-500 text-center md:text-start">{auth.role === "SUPERADMIN" ? "Super Administrador" : auth.role === "ADMIN" ? "Administrador" : " Usuario"}</p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 text-center"
              >
                <p className="text-lg font-semibold text-gray-800">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details + Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Información personal
          </h3>

          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3 text-gray-600">
              <Mail size={18} />
              {auth.email}
            </li>
            <li className="flex items-center gap-3 text-gray-600">
              <Shield size={18} />
              Rol: {auth.role === "SUPERADMIN" ? "Super Administrador" : auth.role === "ADMIN" ? "Administrador" : " Usuario"}
            </li>
            <li className="flex items-center gap-3 text-gray-600">
              <Calendar size={18} />
              {/* Miembro desde: Enero 2023 */}
              {/* Miembro desde: {auth?.createdAt} */}
              Miembro desde: {auth.createdAt ? formatDate(auth.createdAt) : "Fecha desconocida"}
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Acciones
          </h3>

          <div className="flex flex-col gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 cursor-pointer"
              onClick={() => navigate("/dashboard/profile/edit")}
            >
              <Edit size={16} />
              Editar perfil
            </button>

            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 cursor-pointer">
              <Lock size={16} />
              Cambiar contraseña
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileDashboardPage;
