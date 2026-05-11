import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  Save,
} from "lucide-react";

import { useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";

import { resetPassword } from "../../services/auth.service";
import Input from "../../shared/components/Input";

type ChangePasswordProps = {
  newPassword: string;
  confirmPassword: string;
};

const ChangePasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [formData, setFormData] = useState<ChangePasswordProps>({
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError("Token inválido o expirado.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await resetPassword(token, formData.newPassword);

      navigate("/auth");
    } catch (err) {
      console.error(err);
      setError("Error al cambiar la contraseña. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-5">
      <div className="text-center">
        {/* <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-[#0797d5]/10 text-[#0797d5]">
          <KeyRound size={30} />
        </div> */}

        <div className="mx-auto flex size-16 items-center justify-center">
          <img
            src="/voltguard.png"
            alt="Voltguard"
            className="size-20 object-contain"
          />
        </div>

        <h1 className="mt-5 text-3xl font-black text-slate-950">
          Cambiar contraseña
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Actualiza tu contraseña para mantener tu cuenta segura.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Nueva contraseña"
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          placeholder="Nueva contraseña"
          icon={KeyRound}
          required
        />

        <Input
          label="Confirmar contraseña"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirmar contraseña"
          icon={KeyRound}
          required
        />

        <div className="rounded-3xl border border-[#8ccf2f]/30 bg-[#8ccf2f]/10 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="mt-0.5 text-[#3aaa35]" />

            <p className="text-sm leading-6 text-slate-600">
              Por seguridad, tu contraseña debe tener al menos 8 caracteres,
              una letra mayúscula y un número.
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <NavLink
            to="/auth"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
            Cancelar
          </NavLink>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#087fb3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}

            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordPage;