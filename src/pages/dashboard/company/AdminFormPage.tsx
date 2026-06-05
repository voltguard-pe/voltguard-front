import {
  ArrowLeft,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
  User,
  UserPlus
} from "lucide-react";

import { useState } from "react";

import Input from "../../../shared/components/Input";
import Select from "../../../shared/components/Select";

type Company = {
  name: string;
  publicCode: string;
};

export type AdminFormData = {
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  companyPublicCode: string;
};

interface AdminFormProps {
  mode: "create" | "edit";

  companies: Company[];

  loading?: boolean;

  initialValues?: Partial<AdminFormData>;

  onSubmit: (
    data: AdminFormData
  ) => void | Promise<void>;

  onCancel?: () => void;
}

const AdminFormPage = ({
  mode,
  companies,
  loading = false,
  initialValues,
  onSubmit,
  onCancel,
}: AdminFormProps) => {
  const isEdit = mode === "edit";

  const [firstname, setFirstname] = useState(
    initialValues?.firstname ?? ""
  );
  const [lastname, setLastname] = useState(
    initialValues?.lastname ?? ""
  );
  const [email, setEmail] = useState(
    initialValues?.email ?? ""
  );
  const [password, setPassword] = useState("");
  const [companyPublicCode, setCompanyPublicCode] = useState(
    initialValues?.companyPublicCode ?? ""
  );

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    await onSubmit({
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      email: email.trim(),
      password: isEdit ? undefined : password,
      companyPublicCode,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white/20">
              {isEdit ? (
                <ShieldCheck size={24} />
              ) : (
                <UserPlus size={24} />
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold">
                {isEdit
                  ? "Editar administrador"
                  : "Crear administrador"}
              </h2>

              <p className="text-sm text-white/90">
                {isEdit
                  ? "Actualiza los datos del administrador."
                  : "Registra un nuevo administrador de empresa."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <Input
            label="Nombre"
            value={firstname}
            onChange={(e) =>
              setFirstname(e.target.value)
            }
            icon={User}
            required
          />

          <Input
            label="Apellido"
            value={lastname}
            onChange={(e) =>
              setLastname(e.target.value)
            }
            icon={User}
            required
          />

          <div className="md:col-span-2">
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              icon={Mail}
              required
            />
          </div>

          {!isEdit && (
            <div className="md:col-span-2">
              <Input
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
            </div>
          )}

          <div className="md:col-span-2">
            <Select
              label="Empresa"
              value={companyPublicCode}
              onChange={(value) =>
                setCompanyPublicCode(value)
              }
              required
              options={companies.map((company) => ({
                label: company.name,
                value: company.publicCode,
              }))}
            />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <ArrowLeft size={18} />
              Cancelar
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087fb3] disabled:opacity-60"
          >
            {loading ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Save size={18} />
            )}

            {loading
              ? isEdit
                ? "Actualizando..."
                : "Creando..."
              : isEdit
                ? "Actualizar administrador"
                : "Crear administrador"}
          </button>
        </div>
      </section>
    </form>
  );
};

export default AdminFormPage;