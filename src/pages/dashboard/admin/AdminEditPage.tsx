import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserById, updateUser } from "../../../services/users.service";
import type { UpdateUserDTO, UserProps } from "../../../shared/types/UserProps";
import UserForm from "./AdminForm";

type AdminFormData = {
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
};

const AdminEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!id) return;
        const data = await getUserById(id);
        setUser(data);
      } catch (error) {
        console.error("Error cargando usuario", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleUpdate = async (data: AdminFormData) => {
    if (!user) return;

    const payload: Partial<UpdateUserDTO> = {
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
    };

    await updateUser(String(user._id), payload);
    navigate(`/dashboard/users/${String(user._id)}`);
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando usuario...</p>;
  }

  if (!user) {
    return <p className="text-sm text-red-500">Usuario no encontrado</p>;
  }

  return (
    <section className="max-w-4xl flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Editar usuario
        </h1>
        <p className="text-sm text-gray-500">
          Modificando usuario #{String(user._id)}
        </p>
      </div>

      <UserForm
        key={String(user._id)}
        user={user}
        onSubmit={handleUpdate}
        onCancel={() => navigate(-1)}
      />
    </section>
  );
};

export default AdminEditPage;