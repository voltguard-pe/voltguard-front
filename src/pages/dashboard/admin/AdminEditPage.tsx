import { useEffect, useState } from "react";
import Input from "../../../shared/components/Input";
import Select from "../../../shared/components/Select";
import { useNavigate, useParams } from "react-router-dom";
import type { User } from "../../../shared/mocks/users.mock";
import { getUserById, updateUser } from "../../../services/users.service";
import UserForm from "./AdminForm";

const AdminEditPage = () => {
    // const { id } = useParams();
    // const navigate = useNavigate();

    // const [user, setUser] = useState<User | null>(null);
    // const [form, setForm] = useState({
    //     name: "",
    //     email: "",
    //     role: "Usuario",
    //     status: "Activo",
    // });

    // useEffect(() => {
    //     if (!id) return;

    //     getUserById(Number(id)).then((data) => {
    //         if (!data) return;
    //         setUser(data);
    //         setForm({
    //             name: data.name,
    //             email: data.email,
    //             role: data.role,
    //             status: data.status,
    //         });
    //     });
    // }, [id]);

    // const handleChange = (
    //     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    // ) => {
    //     setForm({ ...form, [e.target.name]: e.target.value });
    // };

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     if (!user) return;

    //     await updateUser(user.id, form);
    //     navigate(`/dashboard/users/${user.id}`);
    // };

    // if (!user) {
    //     return <p className="text-sm text-gray-500">Cargando usuario...</p>;
    // }

      const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getUserById(Number(id)).then(setUser);
  }, [id]);

  if (!user) return null;

  const handleUpdate = async (data: any) => {
    await updateUser(user.id, data);
    navigate(`/dashboard/users/${user.id}`);
  };

    return (
        <section className="max-w-4xl flex flex-col gap-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Editar usuario
                </h1>
                <p className="text-sm text-gray-500">
                    Modificando usuario #{user.id}
                </p>
            </div>

            {/* Form */}
            <UserForm
        initialValues={{
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        }}
        submitLabel="Guardar cambios"
        onSubmit={handleUpdate}
      />
        </section>
    );
};

export default AdminEditPage;
