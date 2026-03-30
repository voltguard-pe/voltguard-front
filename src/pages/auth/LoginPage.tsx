import { KeyRound, Mail } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { login } from "../../services/auth.service";
import { getProfile } from "../../services/auth.service";
import Input from "../../shared/components/Input";
import { useAuth } from "../../shared/hooks/useAuth";
import { type LoginData } from "../../services/auth.service"

const LoginPage = () => {
    const { setAuth } = useAuth();
    const navigate = useNavigate()

    const [formData, setFormData] = useState<LoginData>({
        email: "",
        password: ""
    });

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrorMessage(null);
        setLoading(true);

        try {
            await login(formData)

            const user = await getProfile()

            console.log("Usuario logueado", user)

            setAuth(user)
            navigate("/dashboard")
        } catch (error) {
            setErrorMessage('Error al iniciar sesión' + error)
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-lg flex flex-col gap-y-3 shadow-lg backdrop-blur-xs bg-white/80 p-6 rounded-xl">
            <h1 className="text-2xl text-center font-bold">
                Iniciar Sesión
            </h1>
            <h2 className="text-sm text-center text-gray-500 mb-4">
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
                    className="text-end text-sm text-gray-500 hover:text-indigo-500 hover:underline my-4"
                >
                    ¿Olvidaste tu contraseña?
                </NavLink>
                {errorMessage && (
                    <p className="text-red-500 text-sm text-center">
                        {errorMessage}
                    </p>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-500 rounded-lg shadow-lg p-2 text-white font-medium cursor-pointer"
                >
                    {loading ? "Ingresando..." : "Ingresar"}
                </button>
            </form>
        </div>
    );
}

export default LoginPage;