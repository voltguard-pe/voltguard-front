import { Download, X } from "lucide-react";
import QRCode from "react-qr-code";

interface Props {
  boardName: string;
  qrUrl: string;
  onClose: () => void;
}

const QrModal = ({ boardName, qrUrl, onClose }: Props) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative">

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
            Escanea este código para ver los tableros
          </p>

          {/* ✅ QR REAL */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <QRCode value={qrUrl} size={200} />
          </div>

          {/* acciones */}
          <div className="flex gap-3 mt-2 w-full">

            <button
              onClick={onClose}
              className="w-full border px-4 py-2 rounded-lg text-sm hover:bg-gray-100"
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