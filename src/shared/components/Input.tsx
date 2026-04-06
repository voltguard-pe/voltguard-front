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
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "password" && e.target.value === "") {
      setShowPassword(false);
    }

    onChange(e);
  };

  return (
    <div className={`flex flex-col gap-y-2 ${className ?? ""}`}>
      <label htmlFor={name || label} className="text-sm text-gray-600 font-medium">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
        )}

        <input
          id={name || label}
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
          className={`w-full text-sm text-gray-600 border border-gray-300 rounded-lg py-2 px-3 ${
            Icon ? "pl-10" : "px-3"
          } outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed`}
        />

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
    </div>
  );
};

export default Input;