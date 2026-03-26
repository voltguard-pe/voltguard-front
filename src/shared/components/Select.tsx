import { ChevronDown } from "lucide-react";

type SelectProps = {
  label: string;
  name?: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
};

const Select = ({
  label,
  name,
  value,
  options,
  onChange,
  className,
}: SelectProps) => {
  return (
    <div className={`flex flex-col gap-y-2 ${className}`}>
      <label
        htmlFor={label}
        className="text-sm text-gray-600 font-medium"
      >
        {label}
      </label>

      <div className="relative">
        <select
          id={label}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full appearance-none text-sm text-gray-600 border border-indigo-500 rounded-lg py-2 px-3 pr-10 outline-none focus:ring-4 focus:ring-indigo-200 transition-all bg-white"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Icon */}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </span>
      </div>
    </div>
  );
};

export default Select;
