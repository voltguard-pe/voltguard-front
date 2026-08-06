import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { useState } from "react";

type InputProps = {
  label?: string;
  name?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  icon?: LucideIcon;
  required?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
  error?: string;
};

const Input = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  className,
  icon: Icon,
  required = false,
  disabled = false,
  min,
  max,
  step,
  maxLength,
  error,
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputId = name || label?.toLowerCase().replace(/\s+/g, "-");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "password" && event.target.value === "") {
      setShowPassword(false);
    }

    onChange(event);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label htmlFor={inputId} className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        )}

        <input
          id={inputId}
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full rounded-2xl border bg-white py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
            Icon ? "pl-12" : "pl-4"
          } ${type === "password" ? "pr-12" : "pr-4"} ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100"
              : "border-slate-200 focus:border-[#0797d5] focus:ring-4 focus:ring-[#0797d5]/10"
          }`}
        />

        {type === "password" && value !== "" && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <span id={`${inputId}-error`} className="text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;