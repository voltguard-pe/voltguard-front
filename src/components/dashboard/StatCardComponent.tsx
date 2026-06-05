import type { LucideIcon } from "lucide-react";

type Props = {
    title: string;
    value: string | number;
    icon: LucideIcon;
    helper?: string;
    delay?: string; // ← Agregamos delay opcional
};

const StatCardComponent = ({
    title,
    value,
    icon: Icon,
    helper,
    delay = "0ms",
}: Props) => {
    return (
        <div 
            style={{ 
                animation: "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both", 
                animationDelay: delay 
            }}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h3 className="mt-2 text-3xl font-black text-slate-950 tracking-tight">
                        {value}
                    </h3>
                </div>

                <div className="flex size-11 items-center justify-center rounded-2xl bg-[#8ccf2f]/12 text-[#3aaa35] transition-transform duration-300 hover:scale-105">
                    <Icon size={22} />
                </div>
            </div>

            {helper && (
                <p className="mt-4 text-xs font-medium text-slate-400">
                    {helper}
                </p>
            )}
        </div>
    );
}

export default StatCardComponent;