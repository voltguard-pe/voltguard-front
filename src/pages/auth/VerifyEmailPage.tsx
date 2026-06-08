import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { NavLink, useParams } from "react-router-dom";

import { verifyEmailToken } from "../../services/auth.service";

const VerifyEmailPage = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  
  // Candado para evitar el doble disparo de React StrictMode en desarrollo
  const verificationStarted = useRef(false);

  useEffect(() => {
    // Si ya se inició la verificación una vez, cancelamos ejecuciones secundarias
    if (verificationStarted.current) return;
    
    const handleVerification = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Falta el token de validación.");
        return;
      }

      // Activamos el candado inmediatamente antes de disparar axios
      verificationStarted.current = true;

      try {
        const response = await verifyEmailToken(token);
        setStatus("success");
        setMessage(response.message || "¡Tu cuenta ha sido verificada exitosamente!");
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "El enlace no es válido o ya caducó.");
      }
    };

    handleVerification();
  }, [token]);

  return (
    <div className="w-full max-w-md text-center p-4">
      {status === "loading" && (
        <div className="space-y-4">
          <Loader2 size={40} className="mx-auto animate-spin text-[#0797d5]" />
          <h2 className="text-xl font-bold text-slate-800">Verificando tu cuenta</h2>
          <p className="text-sm text-slate-500">Por favor, espera un momento mientras validamos tus datos...</p>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-5">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-950">¡Cuenta Verificada!</h2>
          <p className="text-sm text-slate-500">{message}</p>
          <div className="pt-4">
            <NavLink
              to="/auth"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#087fb3]"
            >
              Iniciar Sesión Ahora
            </NavLink>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-5">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-950">Error de Verificación</h2>
          <p className="text-sm text-red-600 font-medium bg-red-50 rounded-2xl p-3 border border-red-100">
            {message}
          </p>
          <p className="text-xs text-slate-400">
            El enlace expira después de 1 hora o solo puede ser utilizado una única vez.
          </p>
          <div className="pt-4">
            <NavLink
              to="/auth/register"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-900"
            >
              Volver a Intentar Registro
            </NavLink>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyEmailPage;