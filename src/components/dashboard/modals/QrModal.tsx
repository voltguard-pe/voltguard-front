import { Download, X } from "lucide-react";

interface Props {
  boardName: string;
  qrUrl: string;
  onClose: () => void;
}

const QrModal = ({ boardName, qrUrl, onClose }: Props) => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `${boardName}-qr.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl shadow-lg w-[400px] p-6 relative">

        {/* cerrar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center gap-4">

          <h2 className="text-lg font-semibold text-gray-800">
            Código QR
          </h2>

          <p className="text-sm text-gray-500 text-center">
            Escanea este código para ver la ficha técnica del tablero
          </p>

          {/* QR */}

          <div className="bg-gray-100 p-4 rounded-lg">
            <img
              src={qrUrl}
              alt="QR Code"
              className="w-52 h-52 object-contain"
            />
          </div>

          {/* acciones */}

          <div className="flex gap-3 mt-2">

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
            >
              <Download size={16} />
              Descargar
            </button>

            <button
              onClick={onClose}
              className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-100"
            >
              Cerrar
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default QrModal;