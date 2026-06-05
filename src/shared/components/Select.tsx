import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

type SelectProps = {
  label: string;
  name?: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void; // Cambiado para pasar directo el valor limpio
  className?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
};

const Select = ({
  label,
  value,
  options,
  onChange,
  className,
  required = false,
  error,
  disabled = false,
  placeholder = "Seleccionar",
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Encontrar la opción seleccionada actualmente para mostrar su etiqueta
  const selectedOption = options.find((opt) => opt.value === value);

  // Cerrar el menú si el usuario hace clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`flex flex-col gap-1.5 w-full relative ${className ?? ""}`}>
      {/* Label */}
      <label className="text-xs sm:text-sm font-bold text-slate-700 tracking-wide select-none">
        {label} {required && <span className="text-red-500 font-black ml-0.5">*</span>}
      </label>

      {/* Botón Disparador del Select */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className={`w-full flex items-center justify-between text-left rounded-2xl border bg-white px-4 py-3.5 pr-12 text-sm font-medium tracking-tight outline-none transition-all duration-200
            ${disabled ? "cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200" : "cursor-pointer text-slate-950"}
            ${!selectedOption && !disabled ? "text-slate-400" : ""}
            ${
              error
                ? "border-red-400 focus:border-red-500 ring-4 ring-red-100"
                : isOpen
                ? "border-[#0797d5] ring-4 ring-[#0797d5]/15"
                : "border-slate-200 hover:border-slate-300"
            }`}
        >
          <span className="truncate text-gray-400">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          
          <ChevronDown
            size={16}
            strokeWidth={2.5}
            className={`text-slate-400 shrink-0 transition-transform duration-250 absolute right-4 top-1/2 -translate-y-1/2
              ${isOpen ? "rotate-180 text-[#0797d5]" : ""} ${disabled ? "text-slate-300" : ""}`}
          />
        </button>

        {/* Menú Desplegable Personalizado */}
        {isOpen && !disabled && (
          <div 
            className="absolute z-50 left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-200/80 animate-fade-up animate-duration-150"
            style={{ animationDuration: '150ms' }}
          >
            {/* Opción por defecto / Limpiar si no es requerido */}
            {!required && (
              <button
                type="button"
                onClick={() => handleSelect("")}
                className={`w-full text-left px-3.5 py-2.5 text-sm rounded-xl transition-colors cursor-pointer
                  ${!value ? "bg-slate-50 text-[#0797d5] font-bold" : "text-slate-400 hover:bg-slate-50"}`}
              >
                {placeholder}
              </button>
            )}

            {/* Opciones mapeadas */}
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between text-left px-3.5 py-2.5 text-sm rounded-xl transition-colors cursor-pointer font-medium
                    ${
                      isSelected
                        ? "bg-[#0797d5]/8 text-[#0797d5] font-bold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check size={14} strokeWidth={3} className="text-[#0797d5] shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <span className="text-xs text-red-500 font-bold flex items-center gap-1 mt-0.5">
          <span className="size-1 rounded-full bg-red-500 inline-block" />
          {error}
        </span>
      )}
    </div>
  );
};

export default Select;