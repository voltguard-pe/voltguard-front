import { X } from "lucide-react";

interface FilePreviewModalProps {
  isOpen: boolean;
  file: {
    filename: string;
    url: string;
    mimeType?: string;
  } | null;
  onClose: () => void;
}

const FilePreviewModal = ({ isOpen, file, onClose }: FilePreviewModalProps) => {
  if (!isOpen || !file) return null;

  const isImage = file.url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isPdf = file.url.endsWith(".pdf");

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white w-full max-w-4xl h-[80vh] rounded-xl shadow-lg flex flex-col">

        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold truncate">{file.filename}</h2>
          <button className="cursor-pointer" onClick={onClose}>
            <X />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto p-4">
          {isImage && (
            <img
              src={file.url}
              alt={file.filename}
              className="mx-auto max-h-full"
            />
          )}

          {isPdf && (
            <iframe
              src={file.url}
              className="w-full h-full"
              title={file.filename}
            />
          )}

          {!isImage && !isPdf && (
            <div className="text-center text-gray-500">
              No se puede previsualizar este archivo.
              <a
                href={file.url}
                target="_blank"
                className="block text-blue-600 underline mt-2"
              >
                Abrir en otra pestaña
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
