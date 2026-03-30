import { Trash2 } from "lucide-react";

const DeleteCompanyModal = ({ onClose, onConfirm }: any) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <Trash2 size={24} />
          </div>
          <h2 className="font-semibold">Eliminar empresa</h2>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          ¿Seguro que deseas eliminar esta empresa?
        </p>

        <div className="flex justify-end gap-3">
          <button onClick={onClose}>Cancelar</button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCompanyModal;