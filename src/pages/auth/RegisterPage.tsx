import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
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

interface ExtendedRegisterData extends RegisterData {
  captchaToken?: string;
}

const RegisterPage = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [formData, setFormData] = useState<RegisterData>({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    company: "",
    ruc: "",
    cargo: "",
    phone: "",
    referralSource: "",
    companyPublicCode: "",
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

  // Validaciones locales para avanzar de paso
  const handleNextStep = () => {
    setErrorMessage(null);

    if (step === 1) {
      if (!formData.firstname || !formData.lastname || !formData.cargo || !formData.phone) {
        setErrorMessage("Por favor, completa todos los campos de tus datos personales.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.company || !formData.ruc || !formData.referralSource) {
        setErrorMessage("Por favor, completa los datos de la empresa y cómo nos conociste.");
        return;
      }
      if (formData.ruc.length < 11) {
        setErrorMessage("El RUC debe tener 11 dígitos.");
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    if (step > 1) setStep((prev) => (prev - 1) as 1 | 2 | 3);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!formData.email || !formData.password) {
      setErrorMessage("Ingresa tu correo y contraseña.");
      return;
    }

    if (!executeRecaptcha) {
      setErrorMessage(
        "El servicio de verificación de seguridad no está listo. Intenta de nuevo."
      );
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

      const submitData: ExtendedRegisterData = {
        ...formData,
        companyPublicCode: formData.companyPublicCode?.trim() || undefined,
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
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <CheckCircle2 size={40} className="animate-bounce" />
        </div>

        <h1 className="mt-5 text-2xl font-black text-slate-950">
          ¡Registro casi completo!
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          Hemos enviado un enlace de activación a{" "}
          <span className="font-semibold text-slate-800">{formData.email}</span>.
          Por favor, revisa tu bandeja de entrada para activar tu cuenta VoltGuard.
        </p>

        <div className="mt-3 bg-amber-50 rounded-xl p-2 text-xs font-medium text-amber-600">
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

  return (
    <div className="w-full max-w-lg">
      <div className="mb-6 text-center">
        <div className="mx-auto flex size-14 items-center justify-center">
          <img
            src="/voltguard.png"
            alt="Voltguard"
            className="size-16 object-contain"
          />
        </div>

        <h1 className="mt-2 text-2xl font-black text-slate-950">
          Crear cuenta
        </h1>

        {/* STEPPER INDICATOR */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {[
            { num: 1, label: "Personal" },
            { num: 2, label: "Empresa" },
            { num: 3, label: "Acceso" },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-all ${step === s.num
                    ? "bg-[#0797d5] text-white shadow-md shadow-[#0797d5]/30"
                    : step > s.num
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              <span
                className={`text-xs font-semibold ${step === s.num ? "text-slate-900" : "text-slate-400"
                  }`}
              >
                {s.label}
              </span>
              {idx < 2 && <div className="h-0.5 w-6 bg-slate-200" />}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* PASO 1: DATOS PERSONALES */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-2 gap-3">
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

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Cargo"
                type="text"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                placeholder="Ej: Jefe de Planta"
                icon={Briefcase}
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
          </div>
        )}

        {/* PASO 2: DATOS DE LA EMPRESA */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Empresa"
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Mi Empresa S.A.C."
                icon={Building2}
                required
              />
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
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                ¿Cómo llegó a Voltguard? <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Compass size={18} />
                </div>
                <select
                  name="referralSource"
                  value={formData.referralSource}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 transition focus:border-[#0797d5] focus:outline-none focus:ring-2 focus:ring-[#0797d5]/20"
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

            <Input
              label="Código Público de Empresa (Opcional)"
              type="text"
              name="companyPublicCode"
              value={formData.companyPublicCode || ""}
              onChange={handleChange}
              placeholder="EJ: VOLT-LURIN-2026"
              icon={Building2}
            />
          </div>
        )}

        {/* PASO 3: CREDENCIALES DE ACCESO */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
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

            <div className="flex items-center gap-2 rounded-2xl bg-blue-50/70 p-3 text-xs font-semibold text-[#0797d5]">
              <ShieldCheck size={18} className="shrink-0" />
              Protegido por verificación de seguridad invisible Google reCAPTCHA.
            </div>
          </div>
        )}

        {/* MENSAJE DE ERROR */}
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700">
            <AlertCircle size={16} />
            {errorMessage}
          </div>
        )}

        {/* BOTONES DE NAVEGACIÓN ENTRE PASOS */}
        <div className="flex items-center gap-3 pt-2">
          {step > 1 && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-100 cursor-pointer"
            >
              <ArrowLeft size={16} />
              Atrás
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#087fb3] cursor-pointer"
            >
              Siguiente
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#087fb3] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Creando cuenta..." : "Completar Registro"}
            </button>
          )}
        </div>
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