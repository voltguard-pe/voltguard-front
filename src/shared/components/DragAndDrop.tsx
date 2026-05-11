import { FileImage, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";

interface DragAndDropProps {
  label?: string;
  helperText?: string;
  multiple?: boolean;
  accept?: string;
  onFilesChange: (files: File[]) => void;
  error?: string;
  disabled?: boolean;
}

const DragAndDrop = ({
  label = "Arrastra archivos o haz click para seleccionar",
  helperText = "Formatos permitidos: PNG, JPG, JPEG",
  multiple = false,
  accept = "image/*",
  onFilesChange,
  error,
  disabled = false,
}: DragAndDropProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || disabled) return;

    const filesArray = Array.from(fileList);

    setFiles(filesArray);
    onFilesChange(filesArray);
  };

  const handleRemove = (event: React.MouseEvent, fileName: string) => {
    event.stopPropagation();

    const nextFiles = files.filter((file) => file.name !== fileName);

    setFiles(nextFiles);
    onFilesChange(nextFiles);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    handleFiles(event.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();

          if (!disabled) {
            setIsDragging(true);
          }
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer select-none flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
            : error
            ? "border-red-400 bg-red-50"
            : isDragging
            ? "border-[#0797d5] bg-[#0797d5]/5"
            : files.length > 0
            ? "border-[#8ccf2f] bg-[#8ccf2f]/10"
            : "border-slate-200 bg-slate-50 hover:border-[#0797d5] hover:bg-[#0797d5]/5"
        }`}
      >
        <div
          className={`flex size-16 items-center justify-center rounded-3xl ${
            files.length > 0
              ? "bg-[#8ccf2f]/15 text-[#3aaa35]"
              : "bg-[#0797d5]/10 text-[#0797d5]"
          }`}
        >
          {files.length > 0 ? <FileImage size={30} /> : <UploadCloud size={30} />}
        </div>

        <p className="mt-4 text-sm font-semibold text-slate-700">{label}</p>

        <p className="mt-1 text-xs text-slate-500">{helperText}</p>

        <input
          ref={inputRef}
          type="file"
          hidden
          multiple={multiple}
          accept={accept}
          disabled={disabled}
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-700">
                  {file.name}
                </p>

                <p className="text-xs text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <button
                type="button"
                onClick={(event) => handleRemove(event, file.name)}
                className="flex size-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-100 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default DragAndDrop;