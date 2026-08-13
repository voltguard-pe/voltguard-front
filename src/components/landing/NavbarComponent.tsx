import {
    ArrowRight,
    LayoutDashboard,
    LogOut,
    User2
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
// 1. Reemplazamos Link por NavLink
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/hooks/useAuth";

const NavbarComponent = () => {
    const navigate = useNavigate();
    const { auth, handleLogout } = useAuth();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    const isAuthenticated = Boolean(auth?._id || auth?.email);
    const firstname = auth?.firstname || "Usuario";
    const lastname = auth?.lastname || "";
    const role = auth?.role || "Usuario";
    const initials = `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();

    /* ── Entrada inicial ──────────────────────────────────────────────── */
    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(t);
    }, []);

    /* ── Scroll ───────────────────────────────────────────────────────── */
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    /* ── Click outside ────────────────────────────────────────────────── */
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 2. Definimos una función estilizadora reutilizable para los enlaces activos
    // const navLinkStyles = ({ isActive }: { isActive: boolean }) => `
    //     px-4 py-1.5 rounded-full text-sm font-semibold relative group transition-all duration-200
    //     ${isActive
    //         ? "text-[#0797d5] bg-[#0797d5]/6"
    //         : "text-slate-600 hover:text-[#0797d5] hover:bg-[#0797d5]/6"
    //     }
    // `;

    return (
        <header
            style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(-12px)",
                transition: "opacity 0.5s ease, transform 0.5s ease, background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
            }}
            className={`
                fixed top-0 left-0 right-0 z-50
                ${isScrolled
                    ? "border-b border-slate-200 bg-white/90 backdrop-blur shadow-sm shadow-slate-200/60"
                    : "border-b border-transparent bg-transparent"
                }
            `}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

                {/* ── LOGO ──────────────────────────────────────────────── */}
                <Link
                    to="/"
                    className="group flex flex-1 items-center gap-3"
                    style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "translateX(0)" : "translateX(-16px)",
                        transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
                    }}
                >
                    <div className="relative">
                        <img
                            src="/voltguard.png"
                            alt="Voltguard"
                            className="size-11 object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="text-left">
                        <h1 className="text-xl font-bold text-slate-950 transition-colors duration-300 group-hover:text-[#0797d5]">
                            VoltGuard
                        </h1>
                    </div>
                </Link>

                {/* ── NAV LINKS ──────────────────────────────────────────── */}
                {/* <nav
                    className="hidden md:flex flex-2 items-center justify-center gap-1"
                    style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "translateY(0)" : "translateY(-8px)",
                        transition: "opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s",
                    }}
                >
                    <NavLink to="/" end className={navLinkStyles}>
                        {({ isActive }) => (
                            <>
                                Inicio
                                <span className={`absolute bottom-0.5 left-1/2 h-0.5 rounded-full bg-[#0797d5] transition-all duration-300 
                                    ${isActive ? "w-4/5 left-[10%]" : "w-0 group-hover:w-4/5 group-hover:left-[10%]"}`}
                                />
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/plans" className={navLinkStyles}>
                        {({ isActive }) => (
                            <>
                                Planes
                                <span className={`absolute bottom-0.5 left-1/2 h-0.5 rounded-full bg-[#0797d5] transition-all duration-300 
                                    ${isActive ? "w-4/5 left-[10%]" : "w-0 group-hover:w-4/5 group-hover:left-[10%]"}`}
                                />
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/success-stories" className={navLinkStyles}>
                        {({ isActive }) => (
                            <>
                                Casos de éxito
                                <span className={`absolute bottom-0.5 left-1/2 h-0.5 rounded-full bg-[#0797d5] transition-all duration-300 
                                    ${isActive ? "w-4/5 left-[10%]" : "w-0 group-hover:w-4/5 group-hover:left-[10%]"}`}
                                />
                            </>
                        )}
                    </NavLink>
                </nav> */}

                {/* ── RIGHT ─────────────────────────────────────────────── */}
                <div
                    className="flex flex-1 justify-end"
                    style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? "translateX(0)" : "translateX(16px)",
                        transition: "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s",
                    }}
                >
                    {!isAuthenticated ? (
                        <button
                            onClick={() => navigate("/auth")}
                            className="group relative inline-flex items-center gap-2 overflow-hidden
                                rounded-2xl bg-[#0797d5] px-5 py-2.5 text-sm font-semibold text-white
                                transition-all duration-300
                                hover:bg-[#087fb3] hover:-translate-y-0.5
                                hover:shadow-lg hover:shadow-[#0797d5]/30 cursor-pointer"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent
                                -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                            Ingresar
                            <ArrowRight
                                size={18}
                                className="transition-transform duration-200 group-hover:translate-x-0.5"
                            />
                        </button>
                    ) : (
                        <div className="relative z-50" ref={dropdownRef}>
                            {/* TRIGGER */}
                            <button
                                onClick={() => setIsMenuOpen((prev) => !prev)}
                                className={`
                                    flex items-center gap-3 rounded-2xl border bg-white px-3 py-2 shadow-sm
                                    transition-all duration-300 cursor-pointer
                                    ${isMenuOpen
                                        ? "border-[#0797d5]/30 ring-4 ring-[#0797d5]/10"
                                        : "border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md"
                                    }
                                `}
                            >
                                <div className="relative flex size-11 items-center justify-center rounded-2xl
                                    bg-gradient-to-br from-[#0797d5] to-[#8ccf2f]
                                    text-sm font-bold text-white shadow-sm overflow-hidden">
                                    {initials}
                                    {isMenuOpen && (
                                        <span className="absolute inset-0 rounded-2xl animate-ping
                                            bg-white/20 opacity-75" />
                                    )}
                                </div>
                            </button>

                            {/* DROPDOWN */}
                            <div
                                className={`
                                    absolute right-0 top-[calc(100%+12px)] w-72 overflow-hidden
                                    rounded-3xl border border-slate-200 bg-white shadow-2xl
                                    transition-all duration-250 origin-top-right
                                    ${isMenuOpen
                                        ? "opacity-100 translate-y-0 scale-100"
                                        : "pointer-events-none opacity-0 -translate-y-3 scale-95"
                                    }
                                `}
                            >
                                {/* HEADER */}
                                <div className="border-b border-slate-100 bg-slate-50 p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="flex size-14 items-center justify-center rounded-2xl
                                            bg-gradient-to-br from-[#0797d5] to-[#8ccf2f]
                                            text-lg font-bold text-white shadow">
                                            {initials}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate font-bold text-slate-950">
                                                {firstname} {lastname}
                                            </p>
                                            <div className="mt-2 inline-flex rounded-full bg-[#8ccf2f]/15
                                                px-2.5 py-1 text-xs font-semibold text-[#3aaa35]">
                                                {role}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* MENU ITEMS */}
                                <div className="p-2">
                                    {[
                                        {
                                            icon: LayoutDashboard,
                                            label: "Dashboard",
                                            path: "/dashboard",
                                            delay: "0ms",
                                        },
                                        {
                                            icon: User2,
                                            label: "Mi perfil",
                                            path: "/dashboard/profile",
                                            delay: "40ms",
                                        },
                                    ].map(({ icon: Icon, label, path, delay }) => (
                                        <button
                                            key={path}
                                            onClick={() => { setIsMenuOpen(false); navigate(path); }}
                                            style={{
                                                opacity: isMenuOpen ? 1 : 0,
                                                transform: isMenuOpen ? "translateX(0)" : "translateX(-8px)",
                                                transition: `opacity 0.25s ease ${delay}, transform 0.25s ease ${delay}`,
                                            }}
                                            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3
                                                text-sm font-medium text-slate-700
                                                hover:bg-slate-100 hover:text-slate-950
                                                hover:pl-5 transition-all duration-200 group cursor-pointer"
                                        >
                                            <Icon
                                                size={18}
                                                className="text-slate-400 group-hover:text-[#0797d5] transition-colors duration-200"
                                            />
                                            {label}
                                        </button>
                                    ))}

                                    <div className="my-2 border-t border-slate-100" />

                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            opacity: isMenuOpen ? 1 : 0,
                                            transform: isMenuOpen ? "translateX(0)" : "translateX(-8px)",
                                            transition: "opacity 0.25s ease 80ms, transform 0.25s ease 80ms",
                                        }}
                                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3
                                            text-sm font-medium text-red-500
                                            hover:bg-red-50 hover:text-red-600
                                            hover:pl-5 transition-all duration-200 group cursor-pointer"
                                    >
                                        <LogOut
                                            size={18}
                                            className="transition-transform duration-200 group-hover:translate-x-0.5"
                                        />
                                        Cerrar sesión
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default NavbarComponent;