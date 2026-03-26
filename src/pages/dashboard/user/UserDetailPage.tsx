import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById } from "../../../services/users.service";
import type { UserProps } from "../../../shared/types/UserProps";

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    getUserById(Number(id)).then((data) => {
      setUser(data ?? null);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando usuario...</p>;
  }

  if (!user) {
    return <p className="text-sm text-red-500">Usuario no encontrado</p>;
  }

  return (
    <section className="max-w-4xl flex flex-col gap-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Detalle del usuario
        </h1>
        <p className="text-sm text-gray-500">
          Información del usuario #{user.id}
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Info label="Nombre" value={user.firstname} />
          <Info label="Email" value={user.email} />
          <Info label="Rol" value={user.role} />
          <Info label="Estado" value={user.status} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/dashboard/users/${user.id}/edit`)}
          className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white"
        >
          Editar
        </button>
        <button
          onClick={() => navigate("/dashboard/users")}
          className="px-4 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-100"
        >
          Volver
        </button>
      </div>
    </section>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium text-gray-800">{value}</p>
  </div>
);

export default UserDetailPage;
