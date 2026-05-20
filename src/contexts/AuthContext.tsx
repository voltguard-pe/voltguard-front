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
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const authentication = async () => {
      try {
        const user = await getProfile();
        setAuth(user);
      } catch {
        setAuth(null);
      } finally {
        setLoading(false);
      }
    };

    authentication();
  }, []);

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
      value={{ auth, setAuth, loading, isLoggingOut, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };