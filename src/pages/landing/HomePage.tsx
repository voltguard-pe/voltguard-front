import {
    ArrowRight,
    Building2,
    CheckCircle2,
    FileText,
    ShieldCheck,
    Zap
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const ImgHome = "../../../src/assets/images/switchboard-check-electrician-with-tablet-technology-action.jpg"

const features = [
    {
        title: "Gestión de empresas",
        description: "Administra empresas y separa sus tableros eléctricos.",
        icon: Building2,
    },
    {
        title: "Control de tableros",
        description: "Centraliza información técnica, diagramas y estado operativo.",
        icon: Zap,
    },
    {
        title: "Documentación técnica",
        description: "Sube certificados, termografías y diagramas unifilares.",
        icon: FileText,
    },
    {
        title: "Usuarios y permisos",
        description: "Gestiona administradores, superadmins y accesos seguros.",
        icon: ShieldCheck,
    },
];

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-slate-50">
            <section className="relative overflow-hidden">
                <div className="absolute left-0 top-0 h-[400px] w-[400px] rounded-full bg-[#0797d5]/10 blur-3xl" />
                <div className="absolute right-0 top-20 h-[350px] w-[350px] rounded-full bg-[#8ccf2f]/10 blur-3xl" />

                <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
                    <div>
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                            <Zap size={16} className="text-[#8ccf2f]" />
                            Plataforma inteligente de gestión eléctrica
                        </div>

                        <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                            Gestiona tableros eléctricos con{" "}
                            <span className="bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] bg-clip-text text-transparent">
                                Voltguard
                            </span>
                        </h1>

                        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                            Centraliza empresas, tableros, diagramas, usuarios, documentos y
                            reportes técnicos en una sola plataforma moderna y profesional.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <button
                                onClick={() => navigate("/login")}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#087fb3]"
                            >
                                Ingresar al sistema
                                <ArrowRight size={18} />
                            </button>

                            <button
                                onClick={() =>
                                    document
                                        .getElementById("features")
                                        ?.scrollIntoView({ behavior: "smooth" })
                                }
                                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                            >
                                Ver funcionalidades
                            </button>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl">
                        <div className="rounded-[1.5rem] bg-slate-50">
                            <img
                                src={ImgHome}
                                alt="imagen"
                                className="object-cover w-full h-full rounded-[1.5rem]"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section
                id="features"
                className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
            >
                <div className="mb-14 text-center">
                    <p className="text-sm font-bold uppercase tracking-widest text-[#0797d5]">
                        Funcionalidades
                    </p>

                    <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
                        Todo lo que necesitas para la gestión eléctrica
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-slate-600">
                        Diseñado para empresas que necesitan control técnico,
                        documentación y trazabilidad.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {features.map((feature) => {
                        const Icon = feature.icon;

                        return (
                            <div
                                key={feature.title}
                                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
                                    <Icon size={28} />
                                </div>

                                <h3 className="mt-5 text-lg font-bold text-slate-950">
                                    {feature.title}
                                </h3>

                                <p className="mt-3 text-sm leading-7 text-slate-600">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="px-4 pb-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] p-10 shadow-xl">
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white">
                                <CheckCircle2 size={16} />
                                Plataforma operativa
                            </div>

                            <h2 className="max-w-2xl text-3xl font-black text-white sm:text-4xl">
                                Lleva el control total de tus tableros eléctricos
                            </h2>

                            <p className="mt-4 max-w-2xl text-white/90">
                                Gestiona empresas, usuarios, documentos y tableros desde una
                                sola plataforma moderna y centralizada.
                            </p>
                        </div>

                        <button
                            onClick={() => navigate("/login")}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                        >
                            Comenzar ahora
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;