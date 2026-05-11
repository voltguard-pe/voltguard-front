const FooterComponent = () => {
  return (
    <footer className="h-12 bg-white border-t border-gray-200 flex items-center justify-center text-sm text-gray-500">
      © {new Date().getFullYear()} Voltguard. Todos los derechos reservados.
    </footer>
  );
};

export default FooterComponent;
