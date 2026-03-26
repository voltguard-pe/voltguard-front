import { Mail } from "lucide-react";
import { useState } from "react";
import { NavLink } from 'react-router-dom';
import Input from "../../shared/components/Input";
import { forgotPassword } from "../../services/auth.service";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const startCooldown = (seconds: number) => {
    setCooldown(seconds); // 30 segundos

    const interval = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    if (!email || loading) return;

    try {
      setLoading(true);
      const response = await forgotPassword(email);

      setSubmitted(true);
      startCooldown(response.cooldownSeconds);

    } catch (error: any) {
      // 🔥 Aquí manejamos el 429 del backend
      if (error.response?.status === 429) {
        const seconds = error.response.data.retryAfterSeconds;

        setSubmitted(true);
        startCooldown(seconds); // ya pone status en cooldown
      }
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="w-lg flex flex-col gap-y-3 shadow-lg backdrop-blur-xs bg-white/80 p-6 rounded-xl">
      <h1 className="text-2xl text-center font-bold">
        ¿Olvidaste tu contraseña?
      </h1>
      <p className="text-sm text-center text-gray-500 mb-4">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      {submitted ? (
        <div className="text-center space-y-4">
          <div className="font-medium text-center">
            {cooldown > 0 ? (
              <p className="text-green-600">
                Hemos enviado las instrucciones a <span className="font-bold">{email}</span> para cambiar tu contraseña
              </p>
            ) : (
              <p className="text-green-600">
                Ya puedes volver a reenviar el correo.
              </p>
            )}
          </div>

          <button
            onClick={() => handleSubmit()}
            disabled={loading || cooldown > 0}
            className="text-indigo-600 hover:underline disabled:text-gray-400"
          >
            {cooldown > 0
              ? `Reenviar en ${cooldown}s`
              : loading
                ? "Enviando..."
                : "Reenviar correo"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Correo Electrónico"
            type="email"
            name="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            icon={Mail}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>
      )}

      <p className="text-sm text-gray-500 mt-6 text-center">
        ¿Recordaste tu contraseña?{" "}
        <NavLink to={'/auth'} className="text-indigo-600 hover:underline">
          Inicia sesión
        </NavLink>
      </p>
    </div>
  );
};

export default ForgotPasswordPage;
