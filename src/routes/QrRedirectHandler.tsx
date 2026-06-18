import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
// Importamos tu nuevo servicio de board.service.ts
import { getBoardRouteInfoOnlyWithCode } from "../services/board.service"; 

const QrRedirectHandler = () => {
  const { boardCode } = useParams<{ boardCode: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleRedirect = async () => {
      if (!boardCode) {
        setError("Código de tablero no proporcionado.");
        setLoading(false);
        return;
      }

      try {
        // 1. Consultamos al backend qué empresa/sede es dueña de este boardCode
        const data = await getBoardRouteInfoOnlyWithCode(boardCode);
        
        // 2. Redireccionamos a la ruta interna real del Dashboard
        // Nota: Si el backend devuelve data.companyPublicCode, te sirve para el flujo actual.
        // Si en el futuro devuelve 'campusId', solo modificas esta línea para añadirlo a la URL.
        navigate(`/dashboard/boards/${data.companyPublicCode}/${boardCode}`, { replace: true });

      } catch (err) {
        console.error("Error al redireccionar el QR:", err);
        setError("El tablero no existe o no cuentas con los permisos para visualizarlo.");
      } finally {
        setLoading(false);
      }
    };

    handleRedirect();
  }, [boardCode, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-center">
        <div className="flex size-12 animate-spin items-center justify-center rounded-xl bg-[#0797d5] text-white">
          <Zap size={24} />
        </div>
        <p className="text-sm font-medium text-slate-500">Identificando tablero y accesos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-3xl border border-red-200 max-w-md mx-auto mt-20 shadow-sm">
        <p className="text-sm font-bold text-red-700">{error}</p>
      </div>
    );
  }

  return null;
};

export default QrRedirectHandler;