import { Download, X } from "lucide-react";
import QRCode from "react-qr-code";

type PublicQrModalProps = {
  isOpen: boolean;
  title: string;
  qrValue: string;
  onClose: () => void;
};

const QRModal = ({
  isOpen,
  title,
  qrValue,
  onClose,
}: PublicQrModalProps) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    const svg = document.getElementById("public-qr-code");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();

    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx?.drawImage(img, 0, 0);

      URL.revokeObjectURL(url);

      const pngFile = canvas.toDataURL("image/png");

      // 🔥 limpiar nombre de empresa
      const cleanTitle = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/gi, "") // elimina caracteres raros
        .replace(/\s+/g, "-"); // espacios → guiones

      const link = document.createElement("a");
      link.download = `${cleanTitle}-qr.png`;
      link.href = pngFile;
      link.click();
    };

    img.src = url;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Código QR</h2>
            <p className="mt-1 text-sm text-slate-500">{title}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <QRCode
              id="public-qr-code"
              value={qrValue}
              size={220}
              bgColor="#FFFFFF"
              fgColor="#0f172a"
            />
          </div>

          <p className="break-all text-center text-sm text-slate-500">
            {qrValue}
          </p>

          <div className="flex w-full gap-3">
            <button
              type="button"
              onClick={handleDownload}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              <Download size={16} />
              Descargar QR
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRModal;