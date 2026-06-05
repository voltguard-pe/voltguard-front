import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Mueve el scroll al tope de la ventana de forma inmediata al cambiar de ruta
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}