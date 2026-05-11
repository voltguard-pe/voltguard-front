import { ArrowLeft, Home, ShieldAlert } from "lucide-react";
import { NavLink } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      <div className="absolute left-[8%] top-[10%] size-72 rounded-full bg-[#0797d5]/10 blur-3xl" />
      <div className="absolute bottom-[8%] right-[10%] size-80 rounded-full bg-[#8ccf2f]/15 blur-3xl" />
      <div className="absolute right-[18%] top-[18%] size-40 rounded-full bg-[#0797d5]/10 blur-3xl" />

      <div className="relative z-10 flex w-full max-w-2xl items-center justify-center">
        <main className="flex min-h-[620px] w-full items-center justify-center p-6 sm:p-10">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto flex size-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-[#0797d5] to-[#8ccf2f] text-white shadow-xl">
              <ShieldAlert size={44} />
            </div>

            <h1 className="mt-8 bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] bg-clip-text text-8xl font-black text-transparent sm:text-9xl">
              404
            </h1>

            <h2 className="mt-4 text-3xl font-black text-slate-950">
              Página no encontrada
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              Lo sentimos, la página que buscas no existe o ya no está
              disponible.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <NavLink
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02]"
              >
                <Home size={19} />
                Volver al inicio
              </NavLink>

              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <ArrowLeft size={19} />
                Regresar
              </button>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};

export default NotFoundPage;