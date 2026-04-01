import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../../../services/users.service";
import Input from "../../../shared/components/Input";
import Select from "../../../shared/components/Select";
import UserForm from "./AdminForm";
import AdminForm from "./AdminForm";

const AdminCreatePage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Usuario",
    status: "Activo",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name as string]: e.target.value,
    });
  };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     await createUser(form);
//     navigate("/dashboard/users");
//   };

  const handleCreate = async (data: any) => {
    await createUser(data);
    navigate("/dashboard/users");
  };

  return (
    <section className="max-w-4xl flex flex-col gap-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Crear nuevo usuario
        </h1>
        <p className="text-sm text-gray-500">
          Completa la información para registrar un nuevo usuario
        </p>
      </div>

      {/* Form */}
      <AdminForm
        initialValues={{
          name: "",
          email: "",
          password: "",
          role: "Usuario",
          status: "Activo",
        }}
        showPassword
        submitLabel="Crear usuario"
        onSubmit={handleCreate}
      />
    </section>
  );
};

export default AdminCreatePage;
