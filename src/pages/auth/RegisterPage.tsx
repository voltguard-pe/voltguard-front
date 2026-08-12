import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Compass,
  FileText,
  KeyRound,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { NavLink } from "react-router-dom";

import { registerUser, type RegisterData } from "../../services/auth.service";
import Input from "../../shared/components/Input";

// Interface para el estado local del formulario
interface RegisterFormState extends RegisterData {
  confirmPassword: string;
}

// Interface extendida para incluir captchaToken al enviar a la API
interface ExtendedRegisterData extends RegisterData {
  captchaToken: string;
}

const RegisterPage = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [formData, setFormData] = useState<RegisterFormState>({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    company: "",
    ruc: "",
    referralSource: "",
    cargo: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    // Validaciones locales
    if (
      !formData.firstname ||
      !formData.lastname ||
      !formData.email ||
      !formData.phone ||
      !formData.company ||
      !formData.ruc ||
      !formData.referralSource ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setErrorMessage("Por favor, completa todos los campos requeridos.");
      return;
    }

    if (formData.ruc.length < 11) {
      setErrorMessage("El RUC debe tener 11 dígitos.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    if (!executeRecaptcha) {
      setErrorMessage("El servicio de seguridad no está listo. Intenta de nuevo.");
      return;
    }

    setLoading(true);

    try {
      const captchaToken = await executeRecaptcha("register");

      if (!captchaToken) {
        setErrorMessage("No se pudo obtener la verificación de seguridad.");
        setLoading(false);
        return;
      }

      // Remover confirmPassword antes de construir el objeto de envío
      const { confirmPassword, ...registerPayload } = formData;

      const submitData: ExtendedRegisterData = {
        ...registerPayload,
        captchaToken,
      };

      await registerUser(submitData);
      setIsRegistered(true);
    } catch (error: any) {
      setErrorMessage(
        error.message || "Ocurrió un error inesperado al registrar el usuario."
      );
    } finally {
      setLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="w-full max-w-md text-center animate-in fade-in duration-300">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <CheckCircle2 size={36} className="animate-bounce" />
        </div>

        <h1 className="mt-4 text-xl font-black text-slate-950">
          ¡Registro casi completo!
        </h1>

        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          Hemos enviado un enlace de activación a{" "}
          <span className="font-semibold text-slate-800">{formData.email}</span>.
          Por favor, revisa tu bandeja de entrada.
        </p>

        <div className="mt-3 bg-amber-50 rounded-xl p-2.5 text-[11px] font-medium text-amber-600">
          ⚠️ Nota: Si no encuentras el correo, revisa tu carpeta de Spam.
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <NavLink
            to="/auth"
            className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
          >
            Volver al Inicio de Sesión
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md py-2 my-auto">
      {/* HEADER COMPACTO */}
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-black text-slate-950">
          Crear cuenta
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Ingresa tus datos para registrar tu empresa
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        
        {/* NOMBRES Y APELLIDOS */}
        <div className="grid grid-cols-2 gap-2.5">
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

        {/* CORREO Y TELÉFONO */}
        <div className="grid grid-cols-2 gap-2.5">
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
            label="Teléfono / Celular"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="987654321"
            icon={Phone}
            required
          />
        </div>

        {/* RUC Y RAZÓN SOCIAL */}
        <div className="grid grid-cols-2 gap-2.5">
          <Input
            label="RUC"
            type="text"
            name="ruc"
            value={formData.ruc}
            onChange={handleChange}
            placeholder="20123456789"
            icon={FileText}
            maxLength={11}
            required
          />
          <Input
            label="Razón Social"
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Mi Empresa S.A.C."
            icon={Building2}
            required
          />
        </div>

        {/* CÓMO LLEGÓ A VOLTGUARD */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-slate-700">
            ¿Cómo llegó a Voltguard? <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Compass size={16} />
            </div>
            <select
              name="referralSource"
              value={formData.referralSource}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 transition focus:border-[#0797d5] focus:outline-none focus:ring-2 focus:ring-[#0797d5]/20"
            >
              <option value="" disabled>
                Seleccione una opción
              </option>
              <option value="google">Búsqueda en Google</option>
              <option value="social">
                Redes Sociales (LinkedIn, Facebook, etc.)
              </option>
              <option value="recommendation">
                Recomendación de un colega / empresa
              </option>
              <option value="event">Evento / Feria de seguridad</option>
              <option value="other">Otro medio</option>
            </select>
          </div>
        </div>

        {/* CONTRASEÑAS */}
        <div className="grid grid-cols-2 gap-2.5">
          <Input
            label="Contraseña"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Mín. 6 caract."
            icon={KeyRound}
            required
          />
          <Input
            label="Confirmar contraseña"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Repite la contraseña"
            icon={KeyRound}
            required
          />
        </div>

        {/* RECAPTCHA BADGE */}
        <div className="flex items-center gap-2 rounded-lg bg-blue-50/70 px-2.5 py-1.5 text-[10px] font-semibold text-[#0797d5]">
          <ShieldCheck size={14} className="shrink-0" />
          Protegido por verificación Google reCAPTCHA.
        </div>

        {/* MENSAJE DE ERROR */}
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
            <AlertCircle size={15} className="shrink-0" />
            {errorMessage}
          </div>
        )}

        {/* BOTÓN REGISTRAR */}
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0797d5] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#087fb3] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer shadow-md shadow-[#0797d5]/20 mt-1"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Creando cuenta..." : "Completar Registro"}
        </button>
      </form>

      {/* FOOTER NAVEGACIÓN */}
      <div className="mt-3 text-center text-xs text-slate-500">
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