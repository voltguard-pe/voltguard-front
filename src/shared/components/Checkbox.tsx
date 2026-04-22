type CheckboxFieldProps = {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  error?: string;
  required?: boolean;
};

const Checkbox = ({
  label,
  checked,
  onChange,
  error,
  required = false,
}: CheckboxFieldProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-2 text-sm text-gray-600 font-medium">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className={`h-4 w-4 ${
            error ? "accent-red-500" : "accent-indigo-600"
          }`}
        />
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
};

export default Checkbox;