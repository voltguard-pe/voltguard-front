import { Copy, ExternalLink, Printer, QrCode, X } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "react-toastify";

type QRModalProps = {
  isOpen: boolean;
  qrUrl: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
};

const QRModal = ({
  isOpen,
  qrUrl,
  title,
  subtitle = "Plataforma Voltguard",
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
                <h2 className="text-lg font-bold">QR del Tablero</h2>
                <p className="text-sm text-white/90 truncate max-w-[240px]">{title}</p>
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
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div id="qr-print-area" className="relative mx-auto max-w-[220px]">
              <QRCode
                value={qrUrl}
                size={220}
                level="H"
                className="h-auto w-full"
              />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white p-1.5 rounded-xl shadow-md border border-slate-100 size-12 flex items-center justify-center">
                  <img
                    src="/voltguard.png"
                    alt="Voltguard Logo"
                    className="object-contain size-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="mt-5 text-center text-sm text-slate-500">
            Escanea este código para acceder directamente a la información de este tablero.
          </p>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              URL pública del tablero
            </p>
            <p className="break-all text-sm font-medium text-slate-700">
              {qrUrl}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
            >
              <Copy size={18} />
              Copiar URL
            </button>

            <button
              type="button"
              onClick={() => {
                const qrElement = document.getElementById("qr-print-area");
                if (!qrElement) return;

                const iframe = document.createElement("iframe");
                iframe.style.position = "absolute";
                iframe.style.width = "0";
                iframe.style.height = "0";
                iframe.style.border = "none";
                document.body.appendChild(iframe);

                const iframeDoc = iframe.contentWindow?.document;
                if (!iframeDoc) return;

                iframeDoc.open();
                iframeDoc.write(`
                  <html>
                    <head>
                      <title>Imprimir QR - ${title}</title>
                      <script src="https://cdn.tailwindcss.com"></script>
                      <style>
                        body { padding: 20px; display: flex; justify-content: start; height: 100vh; background: white; }
                        @page { size: auto; margin: 0mm; }
                      </style>
                    </head>
                    <body>
                      <div style="text-align: center; font-family: sans-serif;">
                        <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 5px; color: #0f172a;">${title}</h2>
                        <p style="font-size: 13px; color: #64748b; margin-bottom: 20px;">${subtitle}</p>
                        <div style="display: inline-block; position: relative;">
                          ${qrElement.innerHTML}
                        </div>
                      </div>
                      <script>
                        window.onload = () => {
                          setTimeout(() => {
                            window.print();
                            window.frameElement.remove();
                          }, 300);
                        };
                      </script>
                    </body>
                  </html>
                `);
                iframeDoc.close();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 cursor-pointer"
            >
              <Printer size={18} />
              Imprimir QR
            </button>

            <a
              href={qrUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0797d5] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#087fb3] cursor-pointer"
            >
              <ExternalLink size={18} />
              Abrir
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRModal;