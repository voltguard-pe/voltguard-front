import { KeyRound, Mail } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { login, getProfile, type LoginData } from "../../services/auth.service";
import Input from "../../shared/components/Input";
import { useAuth } from "../../shared/hooks/useAuth";

const LoginPage = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      // MODO DEMO
      if (import.meta.env.VITE_DEMO_MODE) {
        const demoUsers = [
          {
            firstname: "Gustavo",
            lastname: "Torres",
            email: "superadmin@gmail.com",
            password: "superadmin",
            role: "SUPERADMIN" as const,
            isActive: true,
            company: "Recoleta",
          },
          {
            firstname: "Juan",
            lastname: "Mendez",
            email: "admin@gmail.com",
            password: "admin123",
            role: "ADMIN" as const,
            isActive: true,
            company: "Recoleta",
          },
        ];

        const matchedUser = demoUsers.find(
          (user) =>
            user.email === formData.email && user.password === formData.password
        );

        if (!matchedUser) {
          throw new Error("Credenciales demo incorrectas");
        }

        const authUser = {
          firstname: matchedUser.firstname,
          lastname: matchedUser.lastname,
          email: matchedUser.email,
          role: matchedUser.role,
          isActive: matchedUser.isActive,
          company: matchedUser.company,
        };

        setAuth(authUser);
        localStorage.setItem("auth", JSON.stringify(authUser));

        console.log("Usuario demo logueado", authUser);

        navigate("/dashboard");
        return;
      }

      await login(formData);

      const user = await getProfile();

      setAuth(user);
      localStorage.setItem("auth", JSON.stringify(user));

      console.log("Usuario logueado", user);

      navigate("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Error al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-lg flex flex-col gap-y-3 rounded-xl bg-white/80 p-6 shadow-lg backdrop-blur-xs">
      <h1 className="text-center text-2xl font-bold">Iniciar Sesión</h1>
      <h2 className="mb-4 text-center text-sm text-gray-500">
        Ingresa tus credenciales para acceder a tu dashboard personal
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-y-3">
        <Input
          label="Correo Electrónico"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Correo electrónico"
          icon={Mail}
        />

        <Input
          label="Contraseña"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Contraseña"
          icon={KeyRound}
        />

        <NavLink
          to={"/auth/forgot-password"}
          className="my-4 text-end text-sm text-gray-500 hover:text-indigo-500 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </NavLink>

        {errorMessage && (
          <p className="text-center text-sm text-red-500">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer rounded-lg bg-indigo-500 p-2 font-medium text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      {import.meta.env.VITE_DEMO_MODE && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          <p className="font-semibold">Usuarios demo:</p>
          <p>SUPERADMIN: superadmin@gmail.com / superadmin</p>
          <p>ADMIN: admin@gmail.com / admin123</p>
        </div>
      )}
    </div>
  );
};

export default LoginPage;