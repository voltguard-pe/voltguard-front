import { KeyRound } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import Input from "../../shared/components/Input";
import { resetPassword } from "../../services/auth.service";

type ChangePasswordProps = {
    newPassword: string,
    confirmPassword: string
}

const ChangePasswordPage = () => {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [formData, setFormData] = useState<ChangePasswordProps>({
        newPassword: "",
        confirmPassword: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!token) {
            setError("Token inválido");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await resetPassword(token, formData.newPassword);

            navigate("/auth"); // redirigir al login

        } catch (err) {
            setError("El enlace es inválido o expiró");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col w-lg gap-y-4">
            <section className=" flex flex-col gap-y-3 shadow-lg backdrop-blur-xs bg-white/80 p-6 rounded-xl">
                {/* Header */}
                <h1 className="text-2xl text-center font-bold">
                    Cambiar contraseña
                </h1>
                <p className="text-sm text-center text-gray-500 mb-4">
                    Actualiza tu contraseña para mantener tu cuenta segura
                </p>

                {error && (
                    <div className="text-sm text-red-600 text-center">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* New password */}
                    <Input
                        label="Nueva Contraseña"
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Nueva contraseña"
                        icon={KeyRound}
                    />

                    {/* Confirm password */}
                    <Input
                        label="Confirmar Contraseña"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirmar contraseña"
                        icon={KeyRound}
                    />

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <NavLink
                            to={'/'}
                            className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                            Cancelar
                        </NavLink>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                            {loading ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </div>
                </form>
            </section>

            {/* Info */}
            <div className="text-sm text-gray-500 p-3 bg-yellow-100 rounded-lg">
                🔒 Por seguridad, tu contraseña debe tener al menos 8 caracteres,
                una letra mayúscula y un número.
            </div>
        </div>
    );
};

export default ChangePasswordPage;
