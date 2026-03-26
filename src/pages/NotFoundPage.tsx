import { NavLink } from "react-router-dom";

const NotFoundPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
            <h1 className="text-9xl font-extrabold text-gray-300">404</h1>
            <h2 className="text-3xl font-semibold mt-4 text-gray-700">
                Página no encontrada
            </h2>
            <p className="mt-2 text-gray-500">
                Lo sentimos, la página que buscas no existe.
            </p>
            <NavLink
                to="/"
                className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
                Volver al inicio
            </NavLink>
        </div>
    );
}

export default NotFoundPage;