import { useRef, useState } from "react";

interface DragAndDropProps {
  label?: string;
  multiple?: boolean;
  accept?: string;
  onFilesChange: (files: File[]) => void;
}

const DragAndDrop = ({
  label = "Arrastra imágenes o haz clic",
  multiple = false,
  accept = "image/*",
  onFilesChange,
}: DragAndDropProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const filesArray = Array.from(fileList);
    onFilesChange(filesArray);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`
        flex flex-col items-center justify-center
        border-2 border-dashed rounded-lg p-6
        cursor-pointer transition
        select-none text-center
        ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}
      `}
    >
      <p className="text-sm text-gray-600">{label}</p>

      <p className="text-xs text-gray-400 mt-1">
        PNG, JPG (puedes subir varias)
      </p>

      <input
        ref={inputRef}
        type="file"
        hidden
        multiple={multiple}
        accept={accept}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
};

export default DragAndDrop;