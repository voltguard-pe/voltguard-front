import { Copy, ExternalLink, QrCode, X } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "react-toastify";

type QRModalProps = {
  isOpen: boolean;
  qrUrl: string;
  companyName?: string;
  onClose: () => void;
};

const QRModal = ({
  isOpen,
  qrUrl,
  companyName = "Empresa",
  onClose,
}: QRModalProps) => {
  if (!isOpen) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(qrUrl);
    toast.success("URL copiada correctamente");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/20">
                <QrCode size={26} />
              </div>

              <div>
                <h2 className="text-lg font-bold">QR de la empresa</h2>
                <p className="text-sm text-white/90">{companyName}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex size-10 items-center justify-center rounded-2xl bg-white/15 transition hover:bg-white/25"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <QRCode value={qrUrl} size={220} className="mx-auto h-auto w-full max-w-[220px]" />
            </div>
          </div>

          <p className="mt-5 text-center text-sm text-slate-500">
            Escanea este código para acceder a los tableros de la empresa.
          </p>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              URL pública
            </p>

            <p className="break-all text-sm font-medium text-slate-700">
              {qrUrl}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Copy size={18} />
              Copiar URL
            </button>

            <a
              href={qrUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#087fb3]"
            >
              <ExternalLink size={18} />
              Abrir enlace
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRModal;