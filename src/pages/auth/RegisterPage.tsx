import { AlertCircle, Building2, CheckCircle2, KeyRound, Loader2, Mail, User } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

import { registerUser, type RegisterData } from "../../services/auth.service";
import Input from "../../shared/components/Input";

const RegisterPage = () => {
  const [formData, setFormData] = useState<RegisterData>({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    companyPublicCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      // Limpiar código de compañía si se envía vacío
      const submitData = {
        ...formData,
        companyPublicCode: formData.companyPublicCode?.trim() || undefined,
      };

      await registerUser(submitData);
      setIsRegistered(true);
    } catch (error: any) {
      setErrorMessage(error.message || "Ocurrió un error inesperado al registrar el usuario.");
    } finally {
      setLoading(false);
    }
  };

  // VISTA POST-REGISTRO: Pantalla de aviso de verificación de correo
  if (isRegistered) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <CheckCircle2 size={40} className="animate-bounce" />
        </div>

        <h1 className="mt-5 text-2xl font-black text-slate-950">
          ¡Registro casi completo!
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          Hemos enviado un enlace de activación a <span className="font-semibold text-slate-800">{formData.email}</span>. 
          Por favor, revisa tu bandeja de entrada y sigue las instrucciones para activar tu cuenta VoltGuard.
        </p>

        <div className="mt-3 text-xs text-amber-600 bg-amber-50 rounded-xl p-2 font-medium">
          ⚠️ Nota: Si no encuentras el correo, revisa tu carpeta de Spam.
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6">
          <NavLink
            to="/auth"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
          >
            Volver al Inicio de Sesión
          </NavLink>
        </div>
      </div>
    );
  }

  // VISTA PRINCIPAL: Formulario de Registro
  return (
    <div className="w-full max-w-md">
      <div className="mb-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center">
          <img
            src="/voltguard.png"
            alt="Voltguard"
            className="size-20 object-contain"
          />
        </div>

        <h1 className="mt-4 text-3xl font-black text-slate-950">
          Crear cuenta
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Regístrate para gestionar tus tableros eléctricos de manera segura.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre"
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            placeholder="Juan"
            icon={User}
            required
          />
          <Input
            label="Apellido"
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            placeholder="Pérez"
            icon={User}
            required
          />
        </div>

        <Input
          label="Correo electrónico"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="correo@empresa.com"
          icon={Mail}
          required
        />

        <Input
          label="Contraseña"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Mínimo 6 caracteres"
          icon={KeyRound}
          required
        />

        <Input
          label="Código Público de Empresa (Opcional)"
          type="text"
          name="companyPublicCode"
          value={formData.companyPublicCode || ""}
          onChange={handleChange}
          placeholder="EJ: VOLT-LURIN-2026"
          icon={Building2}
        />

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            <AlertCircle size={18} />
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#087fb3] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? "Creando cuenta..." : "Registrarme"}
        </button>
      </form>

      <div className="mt-5 text-center text-sm text-slate-500">
        ¿Ya tienes una cuenta?{" "}
        <NavLink
          to="/auth"
          className="font-semibold text-[#0797d5] transition hover:text-[#087fb3] hover:underline"
        >
          Inicia sesión
        </NavLink>
      </div>
    </div>
  );
};

export default RegisterPage;