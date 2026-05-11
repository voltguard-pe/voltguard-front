import { Link, Outlet } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Zap } from "lucide-react";

const shapes = [
  { size: 260, top: "8%", left: "6%", color: "bg-[#0797d5]/10" },
  { size: 180, top: "70%", left: "12%", color: "bg-[#8ccf2f]/15" },
  { size: 320, top: "18%", right: "6%", color: "bg-[#0797d5]/10" },
  { size: 200, bottom: "8%", right: "18%", color: "bg-[#8ccf2f]/15" },
];

const AuthLayout = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          initial={{ y: 0 }}
          animate={{ y: [0, -24, 0] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.6,
          }}
          className={`absolute z-0 rounded-full blur-3xl ${shape.color}`}
          style={{
            width: shape.size,
            height: shape.size,
            ...shape,
          }}
        />
      ))}

      <div className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl lg:grid-cols-[1fr_480px]">
        <aside className="hidden bg-gradient-to-br from-[#0797d5] to-[#8ccf2f] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
            >
              <ArrowLeft size={18} />
              Regresar
            </Link>

            <h1 className="mt-8 text-4xl font-black">
              Bienvenido a Voltguard
            </h1>

            <p className="mt-4 max-w-md text-sm leading-7 text-white/90">
              Gestiona empresas, tableros eléctricos, usuarios, documentos y
              reportes técnicos desde una plataforma moderna y segura.
            </p>
          </div>

          <div className="rounded-3xl bg-white/20 p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/20">
                <Zap size={24} />
              </div>

              <div>
                <p className="font-bold">Gestión eléctrica segura</p>
                <p className="text-sm text-white/80">
                  Plataforma centralizada para tableros.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex min-h-[620px] items-center justify-center p-6 sm:p-10">
          <Outlet />
        </main>
      </div>
    </section>
  );
};

export default AuthLayout;