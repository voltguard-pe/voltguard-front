import React from "react";
import QRCode from "react-qr-code";
import { AlertTriangle, FileDown, Hand, Shield } from "lucide-react";
import type { BoardResponseDTO } from "../../../shared/types/BoardProps";
import { generateNfpaPDF } from "../../../shared/utils/generateNfpaPDF";

interface Nfpa70eSectionProps {
    board: BoardResponseDTO;
    publicCode?: string;
}

export const Nfpa70eSection: React.FC<Nfpa70eSectionProps> = ({ board, publicCode }) => {
    if (!board?.nfpa) {
        return (
            <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-8 text-center text-xs font-semibold text-slate-400">
                Este tablero no cuenta con parámetros de seguridad NFPA 70E registrados.
            </div>
        );
    }

    const { nfpa } = board;
    const currentCompanyName =
        typeof board.company === "object" ? board.company?.name : "Sin empresa";

    const qrUrl = `${window.location.origin}/dashboard/boards/${publicCode}/${board.code}`;

    const parseValUnit = (strValue: string | number | null | undefined, defaultUnit = "") => {
        if (!strValue && strValue !== 0) return { val: "-", unit: defaultUnit };
        const str = String(strValue).trim();
        const match = str.match(/^([\d.,]+)\s*(.*)$/);
        if (match) {
            return { val: match[1], unit: match[2] || defaultUnit };
        }
        return { val: str, unit: defaultUnit };
    };

    return (
        <>
            <div className="mb-4 flex justify-end no-print">
                <button
                    type="button"
                    onClick={() => generateNfpaPDF(board, currentCompanyName)}
                    className="relative z-10 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-black text-slate-900 border border-slate-200 shadow-md transition-all duration-200 hover:bg-amber-400 hover:border-amber-400 hover:text-slate-950 active:scale-95 cursor-pointer"
                >
                    <FileDown size={15} /> Exportar Etiqueta
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl sm:rounded-[26px] bg-white shadow-2xl ring-1 ring-slate-300 font-sans">
                <header className="flex min-h-[100px] sm:min-h-[142px] items-center justify-center gap-3 sm:gap-6 bg-gradient-to-b from-[#D81332] to-[#A50E24] px-4 py-4">
                    <AlertTriangle className="h-12 w-12 sm:h-20 sm:w-20 md:h-[90px] md:w-[90px] text-white fill-white stroke-[#C8102E] stroke-[1.5] shrink-0" />
                    <h1 className="text-4xl sm:text-6xl md:text-[78px] font-black leading-none tracking-[0.08em] text-white">
                        PELIGRO
                    </h1>
                </header>

                <div className="bg-slate-900 px-4 sm:px-8 pb-5 pt-4 text-center">
                    <h2 className="text-lg sm:text-2xl md:text-[31px] font-extrabold leading-tight tracking-wide text-white">
                        RIESGO DE ARCO ELÉCTRICO Y CHOQUE ELÉCTRICO PRESENTE
                    </h2>
                    <p className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-[14px] font-medium text-slate-400">
                        <span>Se requiere EPP de acuerdo a categoría</span>
                        <span className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-[11px] sm:text-[12.5px] font-bold tracking-wide text-slate-100">
                            NORMA NFPA 70E · 2027
                        </span>
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 bg-slate-50 p-4 sm:p-[26px]">
                    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                        <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                            <span className="h-[19px] w-[6px] rounded-full bg-[#C8102E] shrink-0"></span>
                            <h3 className="text-sm sm:text-[15.5px] font-extrabold tracking-wide text-slate-900">
                                RIESGO DE ARCO ELÉCTRICO
                            </h3>
                        </div>

                        <div className="mt-3 flex flex-col sm:flex-row gap-4 sm:gap-5 items-center sm:items-stretch">
                            <div className="grid h-[110px] sm:h-[126px] w-full sm:w-[146px] shrink-0 place-content-center rounded-2xl bg-gradient-to-br from-[#E01234] to-[#9B0C22] text-center p-2">
                                <p className="text-[10px] sm:text-[10.5px] font-bold tracking-[0.12em] text-red-100">CATEGORÍA EPP</p>
                                <p className="-mt-1 text-6xl sm:text-[92px] font-black leading-[1.05] text-white">
                                    {nfpa.categoriaRiesgo ?? 1}
                                </p>
                                <span className="mx-auto -mt-1 sm:-mt-2 block h-[4px] w-[60px] sm:w-[78px] rounded-full bg-white/55"></span>
                            </div>

                            <div className="w-full flex-1 space-y-1">
                                <div className="flex items-baseline justify-between border-b border-slate-100 py-2">
                                    <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500">Energía incidente</span>
                                    <span className="flex items-baseline gap-1">
                                        <span className="text-xl sm:text-[26px] font-extrabold leading-none tracking-tight text-slate-900">
                                            {parseValUnit(nfpa.energiaIncidente, "cal/cm²").val}
                                        </span>
                                        <span className="text-xs sm:text-[13px] font-semibold text-slate-500">
                                            {parseValUnit(nfpa.energiaIncidente, "cal/cm²").unit}
                                        </span>
                                    </span>
                                </div>

                                <div className="flex items-baseline justify-between border-b border-slate-100 py-2">
                                    <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500">Distancia de arco</span>
                                    <span className="flex items-baseline gap-1">
                                        <span className="text-xl sm:text-[26px] font-extrabold leading-none tracking-tight text-slate-900">
                                            {parseValUnit(nfpa.distanciaArco, "m").val}
                                        </span>
                                        <span className="text-xs sm:text-[13px] font-semibold text-slate-500">
                                            {parseValUnit(nfpa.distanciaArco, "m").unit}
                                        </span>
                                    </span>
                                </div>

                                <div className="flex items-baseline justify-between py-2">
                                    <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500">Distancia de trabajo</span>
                                    <span className="flex items-baseline gap-1">
                                        <span className="text-xl sm:text-[26px] font-extrabold leading-none tracking-tight text-slate-900">
                                            {parseValUnit(nfpa.distanciaTrabajo, "cm (18 in)").val}
                                        </span>
                                        <span className="text-xs sm:text-[13px] font-semibold text-slate-500">
                                            {parseValUnit(nfpa.distanciaTrabajo, "cm (18 in)").unit}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                        <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                            <span className="h-[19px] w-[6px] rounded-full bg-sky-500 shrink-0"></span>
                            <h3 className="text-sm sm:text-[15.5px] font-extrabold tracking-wide text-slate-900">
                                RIESGO DE CHOQUE ELÉCTRICO
                            </h3>
                        </div>

                        <div className="mt-3 flex flex-col sm:flex-row gap-4 sm:gap-5 items-center sm:items-stretch">
                            <div className="grid h-[110px] sm:h-[126px] w-full sm:w-[146px] shrink-0 place-content-center rounded-2xl bg-gradient-to-br from-slate-800 to-[#0B1220] text-center p-2">
                                <p className="text-[10px] sm:text-[10.5px] font-bold tracking-[0.12em] text-slate-400">TENSIÓN NOMINAL</p>
                                <p className="text-4xl sm:text-[62px] font-black leading-tight tracking-tight text-white">
                                    {board.tensionNominal || 380}
                                </p>
                                <p className="-mt-1 text-[11px] sm:text-[12px] font-bold tracking-[0.14em] text-slate-400">VOLTIOS CA</p>
                            </div>

                            <div className="w-full flex-1 flex flex-col justify-between space-y-2 sm:space-y-0">
                                <div className="flex items-baseline justify-between border-b border-slate-100 py-1.5">
                                    <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500">Límite de aproximación</span>
                                    <span className="flex items-baseline gap-1">
                                        <span className="text-xl sm:text-[26px] font-extrabold leading-none tracking-tight text-slate-900">
                                            {parseValUnit(nfpa.limiteAproximacion, "m").val}
                                        </span>
                                        <span className="text-xs sm:text-[13px] font-semibold text-slate-500">
                                            {parseValUnit(nfpa.limiteAproximacion, "m").unit}
                                        </span>
                                    </span>
                                </div>

                                <div className="flex items-baseline justify-between border-b border-slate-100 py-1.5">
                                    <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500">Distancia restringida</span>
                                    <span className="flex items-baseline gap-1">
                                        <span className="text-xl sm:text-[26px] font-extrabold leading-none tracking-tight text-slate-900">
                                            {parseValUnit(nfpa.distanciaRestringida, "m").val}
                                        </span>
                                        <span className="text-xs sm:text-[13px] font-semibold text-slate-500">
                                            {parseValUnit(nfpa.distanciaRestringida, "m").unit}
                                        </span>
                                    </span>
                                </div>

                                <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#F0B429] bg-[#FEF6E0] px-3 py-2">
                                    <Hand className="h-5 w-5 shrink-0 text-[#7A4E0B]" />
                                    <div>
                                        <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.11em] text-[#7A4E0B]">GUANTES DIELÉCTRICOS</p>
                                        <p className="text-xs sm:text-[13px] font-semibold text-[#4A3007]">
                                            {nfpa.guantesClase || "No especificados"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                            <div className="flex items-center gap-2.5">
                                <span className="h-[19px] w-[6px] rounded-full bg-[#C8102E] shrink-0"></span>
                                <h3 className="text-sm sm:text-[15.5px] font-extrabold tracking-wide text-slate-900">EPP REQUERIDO</h3>
                            </div>
                            <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10.5px] sm:text-[11.5px] font-bold text-[#9B0C22]">
                                MÍNIMO {parseValUnit(nfpa.energiaIncidente, "cal/cm²").val !== "-" ? parseValUnit(nfpa.energiaIncidente, "cal/cm²").val + " cal/cm²" : "4 cal/cm²"}
                            </span>
                        </div>

                        <ul className="mt-3 space-y-2">
                            {Array.isArray(nfpa.eppRequerido) && nfpa.eppRequerido.length > 0 ? (
                                nfpa.eppRequerido.map((item: string, index: number) => (
                                    <li key={index} className="flex items-center gap-2.5">
                                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#FDECEF]">
                                            <Shield className="h-3.5 w-3.5 text-[#9B0C22]" />
                                        </span>
                                        <span className="text-xs sm:text-[13.5px] font-medium leading-tight text-slate-800">{item}</span>
                                    </li>
                                ))
                            ) : (
                                <li className="text-xs text-slate-400 font-medium">No hay EPP registrado</li>
                            )}
                        </ul>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm min-w-0">
                        <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                            <span className="h-[19px] w-[6px] rounded-full bg-sky-500 shrink-0"></span>
                            <h3 className="text-sm sm:text-[15.5px] font-extrabold tracking-wide text-slate-900">
                                ESCANEAR TABLERO
                            </h3>
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 min-w-0">
                            <div className="relative rounded-xl border border-slate-200 bg-white p-2 shrink-0">
                                <QRCode
                                    value={qrUrl}
                                    size={150}
                                    level="H"
                                    style={{ height: "150px", width: "150px" }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-white p-0.5 rounded-md shadow-md border border-slate-100 size-6 flex items-center justify-center">
                                        <img src="/voltguard.png" alt="Voltguard" className="object-contain size-full" />
                                    </div>
                                </div>
                            </div>

                            <div className="text-center sm:text-left min-w-0 w-full flex-1">
                                <p className="text-[10px] font-bold tracking-[0.12em] text-slate-500 uppercase">ACCESO RÁPIDO</p>
                                <p className="mt-1 text-xs sm:text-[13.5px] font-medium leading-snug text-slate-800">
                                    Datos técnicos, memoria de cálculo y curvas de protección del tablero.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                <footer className="flex flex-col md:flex-row min-h-[78px] items-center justify-between gap-4 border-t-[3px] border-[#C8102E] bg-[#0B1220] px-4 sm:px-[26px] py-4 text-center md:text-left">
                    <div>
                        <p className="text-[9.5px] sm:text-[10.5px] font-bold tracking-[0.16em] text-slate-400">TABLERO</p>
                        <p className="text-xl sm:text-[24px] font-black leading-tight text-white uppercase">
                            {board?.boardCode || board?.name || "PRUEBA"}
                        </p>
                    </div>

                    <div>
                        <p className="text-[9px] sm:text-[9.5px] font-bold tracking-[0.16em] text-slate-400">CREADO POR</p>
                        <div className="mt-0.5 flex items-center justify-center gap-2">
                            <div className="p-0.5 size-5 sm:size-6 flex items-center justify-center">
                                <img src="/voltguard.png" alt="Voltguard" className="object-contain size-full" />
                            </div>
                            <span className="text-lg sm:text-[22px] font-extrabold leading-none text-white">Voltguard</span>
                        </div>
                    </div>

                    <div className="md:text-right">
                        <p className="text-[9.5px] sm:text-[10.5px] font-bold tracking-[0.16em] text-slate-400">FECHA DE CÁLCULO</p>
                        <p className="text-xl sm:text-[24px] font-extrabold leading-tight text-white">
                            {board?.createdAt ? new Date(board.createdAt).toLocaleDateString("es-ES") : "21/6/2026"}
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
};