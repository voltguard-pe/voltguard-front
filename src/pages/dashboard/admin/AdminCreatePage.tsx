import { useNavigate } from "react-router-dom";
import { createUser } from "../../../services/users.service";
import type { CreateUserDTO } from "../../../shared/types/UserProps";
import AdminForm from "./AdminForm";

type AdminFormData = {
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
};

const AdminCreatePage = () => {
  const navigate = useNavigate();

  const companyPublicCode = "AQUI_EL_PUBLIC_CODE";

  const handleCreate = async (data: AdminFormData) => {
    const payload: CreateUserDTO = {
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      password: data.password ?? "",
      companyPublicCode,
    };

    await createUser(payload);
    navigate("/dashboard/users");
  };

  return (
    <section className="max-w-4xl flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Crear nuevo usuario
        </h1>
        <p className="text-sm text-gray-500">
          Completa la información para registrar un nuevo usuario
        </p>
      </div>

      <AdminForm
        key="new"
        onSubmit={handleCreate}
        onCancel={() => navigate(-1)}
      />
    </section>
  );
};

export default AdminCreatePage;