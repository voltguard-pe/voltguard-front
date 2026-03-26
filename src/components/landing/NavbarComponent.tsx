import { NavLink } from "react-router-dom";
import { getInitials } from "../../shared/utils/initialsName";
import { useAuth } from "../../shared/hooks/useAuth";

const NavbarComponent = () => {
    const { auth } = useAuth();

    // if (!auth) return null; // ⛔ evita renders raros

    const fullName = `${auth?.firstname} ${auth?.lastname}`;
    return (
        <header className="w-full bg-white/80 backdrop-blur border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <NavLink
                    to="/"
                    className="text-xl font-bold text-blue-600"
                >
                    PanelQR
                </NavLink>

                <nav className="flex items-center gap-4">
                    {/* <NavLink
                        to="/"
                        className="text-sm text-slate-600 hover:text-indigo-500"
                    >
                        Tableros
                    </NavLink> */}

                    {auth?.id ? (
                        <NavLink
                            to="/dashboard/profile"
                            className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-blue-600 bg-blue-100 hover:bg-blue-200 transition"
                        >
                            <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-semibold">
                                {getInitials(auth.firstname, auth.lastname)}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium">
                                    {fullName}
                                </span>
                                <span className="text-xs">
                                    {auth.role === "ADMIN" ? "Administrador" : "Usuario"}
                                </span>
                            </div>
                        </NavLink>
                    ) : (
                        <NavLink
                            to="/auth"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                        >
                            Iniciar sesión
                        </NavLink>
                    )}

                </nav>
            </div>
        </header>
    )
}

export default NavbarComponent;