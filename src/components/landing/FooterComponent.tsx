const FooterComponent = () => {
  return (
    <footer className="border-t border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-500 sm:px-6 md:flex-row lg:px-8">
        <p>
          © {new Date().getFullYear()} Voltguard · Todos los derechos
          reservados.
        </p>

        <div className="flex items-center gap-2">
          <img
            src="/voltguard.png"
            alt="Voltguard"
            className="size-7 object-contain"
          />

          <span className="font-semibold text-slate-700">Voltguard</span>
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;