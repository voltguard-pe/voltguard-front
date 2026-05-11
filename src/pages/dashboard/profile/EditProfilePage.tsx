import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Mail,
  Save,
  Shield,
  User,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Input from "../../../shared/components/Input";

import { updateUser } from "../../../services/users.service";

import { useAuth } from "../../../shared/hooks/useAuth";
import type { UpdateUserDTO } from "../../../shared/types/UserProps";
import { getInitials } from "../../../shared/utils/initialsName";

const getRoleLabel = (role?: string) => {
  if (role === "SUPERADMIN") return "Super Administrador";
  if (role === "ADMIN") return "Administrador";
  return "Usuario";
};

const EditProfilePage = () => {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<UpdateUserDTO>({
    firstname: "",
    lastname: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;

    setFormData({
      firstname: auth.firstname,
      lastname: auth.lastname,
    });
  }, [auth]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!auth) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const updatedUser = await updateUser(auth._id, formData);

      setAuth(updatedUser);
      navigate("/dashboard/profile");
    } catch (error) {
      console.error(error);
      setErrorMessage("Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  if (!auth) return null;

  const roleLabel = getRoleLabel(auth.role);

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <ArrowLeft size={18} />
        Volver
      </button>

      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
          <User size={24} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Editar perfil
          </h1>

          <p className="text-sm text-slate-500">
            Actualiza tu información personal dentro de Voltguard.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] p-6 text-white">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex size-24 items-center justify-center rounded-3xl bg-white/20 text-3xl font-black text-white shadow-lg backdrop-blur">
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
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">
            <Input
              label="Nombre"
              name="firstname"
              value={formData.firstname ?? ""}
              onChange={handleChange}
              placeholder="Tu nombre"
              icon={User}
              required
            />

            <Input
              label="Apellido"
              name="lastname"
              value={formData.lastname ?? ""}
              onChange={handleChange}
              placeholder="Tu apellido"
              icon={User}
              required
            />

            <div className="md:col-span-2">
              <Input
                label="Correo electrónico"
                value={auth.email}
                onChange={() => {}}
                icon={Mail}
                disabled
              />

              <p className="mt-2 text-xs text-slate-500">
                El correo electrónico no puede ser modificado.
              </p>
            </div>

            <div className="md:col-span-2">
              <Input
                label="Rol"
                value={roleLabel}
                onChange={() => {}}
                icon={Shield}
                disabled
              />
            </div>
          </div>
        </section>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            <AlertCircle size={18} />
            {errorMessage}
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087fb3] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}

              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </section>
      </form>
    </section>
  );
};

export default EditProfilePage;