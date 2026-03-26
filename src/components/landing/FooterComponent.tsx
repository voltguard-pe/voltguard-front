const FooterComponent = () => {
    return (
        <footer className="bg-white/80 backdrop-blur border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-6 py-4 text-center text-sm text-slate-500">
                © {new Date().getFullYear()} PanelQR · Todos los derechos reservados.
            </div>
        </footer>
    )
}

export default FooterComponent