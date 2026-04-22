import { Eye, EyeClosed, type LucideIcon } from "lucide-react";
import { useState } from "react";

type InputProps = {
  label: string;
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

  // 🔥 NUEVO
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
  error,
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "password" && e.target.value === "") {
      setShowPassword(false);
    }
    onChange(e);
  };

  const inputId = name || label;

  return (
    <div className={`flex flex-col gap-y-1 ${className ?? ""}`}>
      
      {/* LABEL */}
      <label
        htmlFor={inputId}
        className="text-sm text-gray-600 font-medium"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* INPUT WRAPPER */}
      <div className="relative">

        {/* ICON */}
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
        )}

        {/* INPUT */}
        <input
          id={inputId}
          type={
            type === "password"
              ? showPassword
                ? "text"
                : "password"
              : type
          }
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full text-sm rounded-lg py-2 px-3 outline-none transition-all
            ${Icon ? "pl-10" : "px-3"}
            
            ${
              error
                ? "border border-red-500 focus:ring-4 focus:ring-red-200 focus:border-red-500"
                : "border border-gray-300 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500"
            }

            ${
              disabled
                ? "bg-gray-100 cursor-not-allowed"
                : ""
            }
          `}
        />

        {/* PASSWORD TOGGLE */}
        {type === "password" && value !== "" && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPassword ? (
              <Eye className="w-4 h-4 text-gray-400" />
            ) : (
              <EyeClosed className="w-4 h-4 text-gray-400" />
            )}
          </button>
        )}
      </div>

      {/* 🔥 ERROR MESSAGE */}
      {error && (
        <span
          id={`${inputId}-error`}
          className="text-xs text-red-500"
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;