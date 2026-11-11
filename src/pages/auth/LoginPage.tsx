import { AlertCircle, KeyRound, Loader2, Mail } from "lucide-react";
import { useState, useMemo } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";

import { login, type LoginData } from "../../services/auth.service";
import Input from "../../shared/components/Input";
import { useAuth } from "../../shared/hooks/useAuth";

const LoginPage = () => {
  const { handleLoginSuccess } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Decodificamos de forma segura la URL completa del código QR si viene como parámetro
  const redirectParam = searchParams.get("redirect");

  const redirect = useMemo(() => {
    if (!redirectParam) return "/dashboard";
    try {
      const decoded = decodeURIComponent(redirectParam);
      return decoded.startsWith("/") ? decoded : "/dashboard";
    } catch (error) {
      console.error("Error decodificando parámetro de redirección", error);
      return "/dashboard";
    }
  }, [redirectParam]);

  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      const response = await login(formData);
      const user = response.data.user;

      handleLoginSuccess(user);

      // 1. Determinar hacia dónde navegar de forma segura
      let targetUrl = "/dashboard";

      if (redirect && redirect.startsWith("/dashboard/boards/")) {
        // Extraemos el companyId de la URL: /dashboard/boards/:companyId/:boardId
        const segments = redirect.split("/").filter(Boolean);
        const urlCompanyId = segments[2]; // segments = ["dashboard", "boards", ":companyId", ":boardId"]

        // Obtén el companyId del usuario actual (adapta según el nombre de la propiedad en tu backend)
        const userCompanyId = user.companyId || user.company?._id || user.company?.id;

        // Solo redirigir si la empresa coincide con la del usuario logueado
        if (urlCompanyId && userCompanyId && urlCompanyId === userCompanyId) {
          targetUrl = redirect;
        } else {
          targetUrl = "/dashboard";
        }
      } else if (redirect && redirect !== "/dashboard") {
        targetUrl = redirect;
      }

      // 2. Navegar a la ruta limpia o autorizada
      setTimeout(() => {
        navigate(targetUrl, { replace: true });
      }, 60);

    } catch (error: any) {
      console.error(error);
      setErrorMessage(
        error.response?.data?.message || "Credenciales incorrectas o error al iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto flex size-16 items-center justify-center">
          <img
            src="/voltguard.png"
            alt="Voltguard"
            className="size-20 object-contain"
          />
        </div>

        <h1 className="mt-5 text-3xl font-black text-slate-950">
          Iniciar sesión
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Ingresa tus credenciales para acceder a VoltGuard.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
          placeholder="Tu contraseña"
          icon={KeyRound}
          required
        />

        <div className="text-right">
          <NavLink
            to="/auth/forgot-password"
            className="text-sm font-semibold text-[#0797d5] transition hover:text-[#087fb3] hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </NavLink>
        </div>

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
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-500">
        ¿No tienes una cuenta?{" "}
        <NavLink
          to="/auth/register"
          className="font-semibold text-[#0797d5] transition hover:text-[#087fb3] hover:underline"
        >
          Regístrate aquí
        </NavLink>
      </div>
    </div>
  );
};

export default LoginPage;