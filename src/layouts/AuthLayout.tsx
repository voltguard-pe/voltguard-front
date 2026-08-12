import { Link, Outlet } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Zap, ShieldCheck } from "lucide-react";

const AuthLayout = () => {
  return (
    <section className="relative flex h-screen w-screen overflow-hidden bg-white">
      
      {/* Contenedor principal a pantalla completa con grilla 60% - 40% */}
      <div className="relative z-10 grid h-full w-full lg:grid-cols-[60%_40%]">
        
        {/* LADO IZQUIERDO (60%): IMAGEN DE FONDO FULL-BLEED */}
        <aside className="relative hidden overflow-hidden p-8 lg:flex lg:flex-col lg:justify-between h-full">
          {/* Imagen de fondo adaptada al 60% de la pantalla */}
          <img
            src="/hero-technician4.webp" 
            alt="VoltGuard Inspección Eléctrica"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          {/* Overlay de marca con gradiente oscuro para contraste */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-[#0797d5]/40 backdrop-blur-[2px]" />

          {/* Contenido superior */}
          <div className="relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/25 hover:shadow-lg"
            >
              <ArrowLeft size={18} />
              Regresar a la web
            </Link>

            <div className="mt-12 max-w-lg">
              <h1 className="mt-4 text-4xl xl:text-5xl font-black leading-tight text-white tracking-tight">
                Bienvenido a <span className="text-[#0797d5]">Volt</span><span className="text-[#8ccf2f]">Guard</span>
              </h1>

              <p className="mt-3 text-base leading-relaxed text-slate-200">
                Gestiona empresas, tableros eléctricos, diagramas CAD, certificados CIP y reportes técnicos desde un solo lugar.
              </p>
            </div>
          </div>
        </aside>

        {/* LADO DERECHO (40%): ÁREA DEL FORMULARIO */}
        <main className="flex h-full w-full flex-col justify-center overflow-y-auto p-6 sm:p-12 lg:p-16 bg-white">
          <div className="w-full max-w-md mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </section>
  );
};

export default AuthLayout;