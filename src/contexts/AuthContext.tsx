import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { logout, getProfile } from "../services/auth.service";
import type { UserProps } from "../shared/types/UserProps";

interface AuthContextType {
  auth: UserProps | null;
  setAuth: (auth: UserProps | null) => void;
  loading: boolean;
  isLoggingOut: boolean;
  handleLogout: () => Promise<void>;
  handleLoginSuccess: (user: UserProps) => void; // Nueva función para unificar estados
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const authentication = async () => {

      const token = localStorage.getItem("token");

      // Si no existe token guardado, cancela la consulta inicial
      if (!token) {
        setAuth(null);
        setLoading(false);
        return;
      }


      try {
        const user = await getProfile();
        setAuth(user);
      } catch {
        // Si el token expiró o es inválido, remuévelo
        localStorage.removeItem("token");
        setAuth(null);
      } finally {
        setLoading(false);
      }
    };

    authentication();
  }, []);

  // Función crítica para evitar que ProtectedRoute se confunda al iniciar sesión
  const handleLoginSuccess = (user: UserProps) => {
    setAuth(user);
    setLoading(false); // Asegura que las rutas protegidas no vean un estado de carga falso
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    } finally {
      navigate("/", {
        replace: true,
      });

      setAuth(null);
      setIsLoggingOut(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ auth, setAuth, loading, isLoggingOut, handleLogout, handleLoginSuccess }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };