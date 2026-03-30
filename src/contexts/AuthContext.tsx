import { createContext, useEffect, useState } from "react";
import { logout, getProfile } from "../services/auth.service";
import type { UserProps } from "../shared/types/UserProps";

interface AuthContextType {
  auth: UserProps | null;
  setAuth: (auth: UserProps | null) => void;
  loading: boolean;
  handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuthState] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Setter global que también guarda en localStorage
  const setAuth = (user: UserProps | null) => {
    setAuthState(user);

    if (user) {
      localStorage.setItem("auth", JSON.stringify(user));
    } else {
      localStorage.removeItem("auth");
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 🔥 1. Revisar localStorage primero
        const storedAuth = localStorage.getItem("auth");

        if (storedAuth) {
          const parsedUser = JSON.parse(storedAuth);
          setAuthState(parsedUser);
          console.log("Usuario desde localStorage", parsedUser);
          return;
        }

        // 🔥 2. Si no hay localStorage, intentar backend
        if (import.meta.env.VITE_DEMO_MODE === "true") {
          // En demo no llamamos backend
          setAuthState(null);
          return;
        }

        const user = await getProfile();
        console.log("Usuario desde backend", user);

        setAuth(user);
      } catch (error) {
        console.log("No autenticado");
        setAuth(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleLogout = async () => {
    try {
      if (import.meta.env.VITE_DEMO_MODE !== "true") {
        await logout();
      }
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    } finally {
      setAuth(null); // 🔥 limpia estado + localStorage
    }
  };

  return (
    <AuthContext.Provider
      value={{ auth, setAuth, loading, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };