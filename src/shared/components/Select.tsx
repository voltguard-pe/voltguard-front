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
  disabled?: boolean;
  placeholder?: string;
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
  disabled = false,
  placeholder = "Seleccionar",
}: SelectProps) => {
  const inputId = name || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label htmlFor={inputId} className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <select
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full appearance-none rounded-2xl border bg-white px-4 py-3 pr-12 text-sm text-slate-700 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100"
              : "border-slate-200 focus:border-[#0797d5] focus:ring-4 focus:ring-[#0797d5]/10"
          }`}
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>

      {error && (
        <span id={`${inputId}-error`} className="text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
};

export default Select;