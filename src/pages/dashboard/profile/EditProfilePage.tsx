import { useEffect, useState } from "react";
import { User, Mail, Shield, Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../shared/hooks/useAuth";
import type { UpdateUserDTO } from "../../../shared/types/UserProps";
import { updateUser } from "../../../services/users.service";

const EditProfilePage = () => {
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<UpdateUserDTO>({
        firstname: "",
        lastname: "",
    });

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // 🔥 Cargar datos cuando auth esté disponible
    useEffect(() => {
        if (auth) {
            setFormData({
                firstname: auth.firstname,
                lastname: auth.lastname,
            });
        }
    }, [auth]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth) return;

        setLoading(true);
        setErrorMessage(null);

        try {
            const updatedUser = await updateUser(auth._id, formData);

            setAuth(updatedUser); // 🔥 Actualizamos el contexto global
            navigate("/dashboard/profile");
        } catch (error) {
            setErrorMessage("Error al actualizar el perfil" + error);
        } finally {
            setLoading(false);
        }
    };

    if (!auth) return null;

    return (
        <section className="flex flex-col gap-y-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                    <ArrowLeft size={20} />
                </button>

                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Editar perfil
                    </h1>
                    <p className="text-sm text-gray-500">
                        Actualiza tu información personal
                    </p>
                </div>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-6"
            >
                {/* Nombre */}
                <div>
                    <label className="text-sm text-gray-600 mb-1 block">
                        Nombre
                    </label>
                    <div className="flex items-center gap-2 border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
                        <User size={18} className="text-gray-400" />
                        <input
                            type="text"
                            name="firstname"
                            value={formData.firstname}
                            onChange={handleChange}
                            className="w-full outline-none text-sm"
                            placeholder="Tu nombre"
                            required
                        />
                    </div>
                </div>

                {/* Apellido */}
                <div>
                    <label className="text-sm text-gray-600 mb-1 block">
                        Apellido
                    </label>
                    <div className="flex items-center gap-2 border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
                        <User size={18} className="text-gray-400" />
                        <input
                            type="text"
                            name="lastname"
                            value={formData.lastname}
                            onChange={handleChange}
                            className="w-full outline-none text-sm"
                            placeholder="Tu apellido"
                            required
                        />
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label className="text-sm text-gray-600 mb-1 block">
                        Email
                    </label>
                    <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
                        <Mail size={18} className="text-gray-400" />
                        <input
                            type="email"
                            value={auth.email}
                            disabled
                            className="w-full outline-none text-sm bg-gray-50 cursor-not-allowed"
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        El email no puede ser modificado.
                    </p>
                </div>

                {/* Rol */}
                <div>
                    <label className="text-sm text-gray-600 mb-1 block">
                        Rol
                    </label>
                    <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
                        <Shield size={18} className="text-gray-400" />
                        <input
                            type="text"
                            value={
                                auth.role === "ADMIN" ? "Administrador" : "Usuario"
                            }
                            disabled
                            className="w-full outline-none text-sm bg-gray-50 cursor-not-allowed"
                        />
                    </div>
                </div>

                {errorMessage && (
                    <p className="text-red-500 text-sm">
                        {errorMessage}
                    </p>
                )}

                {/* Botón guardar */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                    >
                        <Save size={16} />
                        {loading ? "Guardando..." : "Guardar cambios"}
                    </button>
                </div>
            </form>
        </section>
    );
};

export default EditProfilePage;
