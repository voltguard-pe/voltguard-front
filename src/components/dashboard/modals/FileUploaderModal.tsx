import { useEffect, useState } from 'react'
import { uploadFile } from '../../../services/board.service'
import { X } from 'lucide-react'
import { PdfIcon } from '../../../shared/icons/Icons'

interface BoardFileUploaderModalProps {
  userId: number
  isOpen: boolean
  onClose: () => void
  onUploadSuccess?: () => void
}

const FileUploaderModal = ({
  userId,
  isOpen,
  onClose,
  onUploadSuccess
}: BoardFileUploaderModalProps) => {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setFiles([])
      setIsDragging(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const addFiles = (newFiles: File[]) => {
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name + f.size));

      const filtered = newFiles.filter(f => {
        const key = f.name + f.size;
        if (existing.has(key)) return false;
        existing.add(key);
        return true;
      });

      return [...prev, ...filtered];
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files)
      .filter(f => f.type === "application/pdf");

    addFiles(droppedFiles);
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const selectedFiles = Array.from(e.target.files).filter((f) =>
      f.type === "application/pdf"
    );

    addFiles(selectedFiles);

    e.target.value = "";
  }

  const handleUpload = async () => {
    if (!files.length) return
    try {
      setError(null);
      setLoading(true)
      for (const file of files) {
        await uploadFile(file, userId)
      }
      setFiles([])
      onUploadSuccess?.()
      onClose()

      // TODO: Aqui va el catch para mostrar el mensaje de error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-lg p-6 space-y-4">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Subir archivos</h2>
          <button type='button' className='cursor-pointer' onClick={onClose}>
            <X />
          </button>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-100 p-2 rounded">
            {error}
          </div>
        )}

        {/* DROP ZONE */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput')?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        >
          <p className="text-gray-600">
            Arrastra archivos o <span className="text-blue-600 font-semibold">haz clic</span>
          </p>

          <input
            id="fileInput"
            type="file"
            accept="application/pdf"
            multiple
            hidden
            onChange={handleFileChange}
          />
        </div>

        {/* FILE LIST */}
        {files.length > 0 && (
          <div className="max-h-48 overflow-auto space-y-2">
            {files.map((file, i) => (
              <div key={i} className="flex justify-between items-center text-sm border border-gray-300 rounded-lg p-4">
                <div className='flex items-center gap-x-2'>
                  <PdfIcon className="text-red-400" />
                  <span className="truncate">{file.name}</span>
                </div>
                <button
                  type='button'
                  className="text-red-500 cursor-pointer"
                  onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ACTIONS */}
        <button
          type='button'
          onClick={handleUpload}
          disabled={!files.length || loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50 not-disabled:cursor-pointer"
        >
          {loading ? 'Subiendo...' : `Subir ${files.length} archivo(s)`}
        </button>
      </div>
    </div>
  )
}

export default FileUploaderModal
