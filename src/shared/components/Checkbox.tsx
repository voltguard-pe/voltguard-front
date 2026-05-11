import { Check } from "lucide-react";

type CheckboxFieldProps = {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
};

const Checkbox = ({
  label,
  checked,
  onChange,
  error,
  required = false,
  disabled = false,
}: CheckboxFieldProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className={`flex items-center gap-3 text-sm font-medium ${
          disabled
            ? "cursor-not-allowed text-slate-400"
            : "cursor-pointer text-slate-700"
        }`}
      >
        <span className="relative flex size-5 items-center justify-center">
          <input
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
            className="peer sr-only"
          />

          <span
            className={`flex size-5 items-center justify-center rounded-lg border transition ${
              error
                ? "border-red-500"
                : checked
                ? "border-[#0797d5] bg-[#0797d5]"
                : "border-slate-300 bg-white peer-hover:border-[#0797d5]"
            }`}
          >
            {checked && <Check size={14} className="text-white" />}
          </span>
        </span>

        <span>
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      </label>

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default Checkbox;