import { createContext, useEffect, useState } from "react";
import { logout } from "../services/auth.service";
import { getMe } from "../services/users.service";
import type { UserProps } from "../shared/types/UserProps";

interface AuthContextType {
  auth: UserProps | null;
  setAuth: (auth: UserProps | null) => void
  loading: boolean;
  handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authentication = async () => {
      try {
        const user = await getMe()
        setAuth(user)
      } catch {
        setAuth(null)
      } finally {
        setLoading(false)
      }
    }

    authentication()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    } finally {
      setAuth(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{ auth, setAuth, loading, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };

