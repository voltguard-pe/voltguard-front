import { useCallback, useRef, useState } from "react";

interface DragAndDropProps {
  label?: string;
  multiple?: boolean;
  accept?: string;
  onFilesChange: (files: File[]) => void;
}

const DragAndDrop = ({
  label = "Arrastra archivos aquí o haz clic",
  multiple = false,
  accept,
  onFilesChange,
}: DragAndDropProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const filesArray = Array.from(fileList);
    setFiles(filesArray);
    onFilesChange(filesArray);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

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
        select-none
        ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}
      `}
    >
      <p className="text-sm text-gray-600 text-center">{label}</p>

      <input
        ref={inputRef}
        type="file"
        hidden
        multiple={multiple}
        accept={accept}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {files.length > 0 && (
        <ul className="mt-3 w-full text-sm text-gray-700 space-y-1">
          {files.map((file, index) => (
            <li key={index} className="truncate">
              📎 {file.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DragAndDrop;
