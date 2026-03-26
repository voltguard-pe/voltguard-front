import { Trash2 } from "lucide-react";

const DeleteFileModal = ({ onClose, onConfirm }: any) => {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-sm w-full max-w-md p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-red-100 text-red-600">
                        <Trash2 size={24} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">
                        Eliminar archivo
                    </h2>
                </div>

                <p className="text-sm text-gray-600 mb-6">
                    ¿Estás seguro de que deseas eliminar este archivo?
                    Esta acción no se puede deshacer.
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-100"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteFileModal;
