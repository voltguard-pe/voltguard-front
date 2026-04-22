import { ChevronDown } from "lucide-react";

type SelectProps = {
  label: string;
  name?: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  required?: boolean;
  error?: string;
};

const Select = ({
  label,
  name,
  value,
  options,
  onChange,
  className,
  required = false,
  error,
}: SelectProps) => {
  return (
    <div className={`flex flex-col gap-y-2 ${className ?? ""}`}>
      <label className="text-sm text-gray-600 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full appearance-none text-sm border rounded-lg py-2 px-3 pr-10 outline-none transition-all bg-white ${
            error
              ? "border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:ring-indigo-200 focus:border-indigo-500"
          }`}
        >
          <option value="">Seleccionar</option>

          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </span>
      </div>

      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
};

export default Select;