import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  Send,
} from "lucide-react";

import { useState } from "react";
import { NavLink } from "react-router-dom";

import { forgotPassword } from "../../services/auth.service";
import Input from "../../shared/components/Input";

type ForgotPasswordErrorResponse = {
  retryAfterSeconds?: number;
  message?: string;
};

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const startCooldown = (seconds: number) => {
    setCooldown(seconds);

    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!email || loading) return;

    try {
      setLoading(true);

      const response = await forgotPassword(email);

      setSubmitted(true);
      startCooldown(response.cooldownSeconds);
    } catch (error: unknown) {
      if (axios.isAxiosError<ForgotPasswordErrorResponse>(error)) {
        if (error.response?.status === 429) {
          const seconds = error.response.data?.retryAfterSeconds ?? 30;

          setSubmitted(true);
          startCooldown(seconds);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        {/* <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-[#0797d5]/10 text-[#0797d5]">
          <Mail size={30} />
        </div> */}

        <div className="mx-auto flex size-16 items-center justify-center">
          <img
            src="/voltguard.png"
            alt="Voltguard"
            className="size-20 object-contain"
          />
        </div>

        <h1 className="mt-5 text-3xl font-black text-slate-950">
          ¿Olvidaste tu contraseña?
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Ingresa tu correo electrónico y te enviaremos instrucciones para
          restablecer tu contraseña.
        </p>
      </div>

      {submitted ? (
        <div className="space-y-5 text-center">
          <div className="rounded-3xl border border-[#8ccf2f]/30 bg-[#8ccf2f]/10 p-6">
            <CheckCircle2 className="mx-auto text-[#3aaa35]" size={36} />

            <p className="mt-4 text-sm font-semibold text-slate-700">
              Hemos enviado las instrucciones a:
            </p>

            <p className="mt-1 break-words font-bold text-slate-950">
              {email}
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={loading || cooldown > 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#087fb3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}

            {cooldown > 0
              ? `Reenviar en ${cooldown}s`
              : loading
                ? "Enviando..."
                : "Reenviar correo"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Correo electrónico"
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="correo@empresa.com"
            icon={Mail}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#087fb3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}

            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>
      )}

      <div className="mt-6 text-center">
        <NavLink
          to="/auth"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0797d5] transition hover:text-[#087fb3] hover:underline"
        >
          <ArrowLeft size={16} />
          Volver al inicio de sesión
        </NavLink>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;