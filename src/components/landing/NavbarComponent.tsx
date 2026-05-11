import {
    ArrowRight,
    ChevronDown,
    LayoutDashboard,
    LogOut,
    User2
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../shared/hooks/useAuth";

const NavbarComponent = () => {
    const navigate = useNavigate();

    const { auth, handleLogout } = useAuth();

    const [isMenuOpen, setIsMenuOpen] =
        useState(false);

    const dropdownRef =
        useRef<HTMLDivElement>(null);

    const isAuthenticated = Boolean(
        auth?._id || auth?.email
    );

    const firstname =
        auth?.firstname || "Usuario";

    const lastname =
        auth?.lastname || "";

    const role = auth?.role || "Usuario";

    const initials = `${firstname.charAt(
        0
    )}${lastname.charAt(
        0
    )}`.toUpperCase();

    useEffect(() => {
        const handleClickOutside = (
            event: MouseEvent
        ) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(
                    event.target as Node
                )
            ) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    return (
        <>
            {/* OVERLAY */}
            {/* {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]" />
      )} */}

            <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    {/* LOGO */}
                    <Link
                        to={"/"}
                        onClick={() => navigate("/")}
                        className="flex items-center gap-3"
                    >
                        <img
                            src="/voltguard.png"
                            alt="Voltguard"
                            className="size-11 object-contain"
                        />

                        <div className="text-left">
                            <h1 className="text-lg font-bold text-slate-950">
                                Voltguard
                            </h1>

                            <p className="text-xs text-slate-500">
                                Gestión eléctrica
                            </p>
                        </div>
                    </Link>

                    {/* RIGHT */}
                    {!isAuthenticated ? (
                        <button
                            onClick={() =>
                                navigate("/auth")
                            }
                            className="inline-flex items-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#087fb3]"
                        >
                            Ingresar
                            <ArrowRight size={18} />
                        </button>
                    ) : (
                        <div
                            className="relative z-50"
                            ref={dropdownRef}
                        >
                            {/* TRIGGER */}
                            <button
                                onClick={() =>
                                    setIsMenuOpen(
                                        (prev) => !prev
                                    )
                                }
                                className={`
                  flex items-center gap-3 rounded-2xl border bg-white px-3 py-2 shadow-sm transition-all

                  ${isMenuOpen
                                        ? "border-[#0797d5]/30 ring-4 ring-[#0797d5]/10"
                                        : "border-slate-200 hover:bg-slate-50"
                                    }
                `}
                            >
                                {/* AVATAR */}
                                <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] text-sm font-bold text-white shadow-sm">
                                    {initials}
                                </div>

                                {/* USER */}
                                <div className="hidden text-left sm:block">
                                    <p className="text-sm font-semibold text-slate-950">
                                        {firstname} {lastname}
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        {role}
                                    </p>
                                </div>

                                {/* CHEVRON */}
                                <ChevronDown
                                    size={18}
                                    className={`text-slate-400 transition-transform ${isMenuOpen
                                            ? "rotate-180"
                                            : ""
                                        }`}
                                />
                            </button>

                            {/* DROPDOWN */}
                            <div
                                className={`
                  absolute right-0 top-[calc(100%+12px)] w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all duration-200

                  ${isMenuOpen
                                        ? "translate-y-0 opacity-100"
                                        : "pointer-events-none -translate-y-2 opacity-0"
                                    }
                `}
                            >
                                {/* HEADER */}
                                <div className="border-b border-slate-100 bg-slate-50 p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] text-lg font-bold text-white shadow">
                                            {initials}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate font-bold text-slate-950">
                                                {firstname} {lastname}
                                            </p>

                                            <p className="truncate text-sm text-slate-500">
                                                {auth?.email}
                                            </p>

                                            <div className="mt-2 inline-flex rounded-full bg-[#8ccf2f]/15 px-2.5 py-1 text-xs font-semibold text-[#3aaa35]">
                                                {role}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* MENU */}
                                <div className="p-2">
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);

                                            navigate(
                                                "/dashboard"
                                            );
                                        }}
                                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                                    >
                                        <LayoutDashboard
                                            size={18}
                                        />

                                        Dashboard
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);

                                            navigate(
                                                "/dashboard/profile"
                                            );
                                        }}
                                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                                    >
                                        <User2 size={18} />

                                        Mi perfil
                                    </button>

                                    {/* <button
                    onClick={() => {
                      setIsMenuOpen(false);

                      navigate(
                        "/dashboard/settings"
                      );
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    <Settings
                      size={18}
                    />

                    Configuración
                  </button> */}

                                    <div className="my-2 border-t border-slate-100" />

                                    <button
                                        onClick={
                                            handleLogout
                                        }
                                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                    >
                                        <LogOut size={18} />

                                        Cerrar sesión
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>
        </>
    );
};

export default NavbarComponent;