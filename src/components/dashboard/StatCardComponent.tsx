import type { LucideIcon } from "lucide-react";

type Props = {
    title: string;
    value: string | number;
    icon: LucideIcon;
    helper?: string;
};

const StatCardComponent = ({
    title,
    value,
    icon: Icon,
    helper,
}: Props) => {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">{title}</p>

                    <h3 className="mt-2 text-3xl font-bold text-slate-950">
                        {value}
                    </h3>
                </div>

                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#8ccf2f]/15 text-[#3aaa35]">
                    <Icon size={24} />
                </div>
            </div>

            {helper && (
                <p className="mt-4 text-sm text-slate-500">
                    {helper}
                </p>
            )}
        </div>
    );
}

export default StatCardComponent