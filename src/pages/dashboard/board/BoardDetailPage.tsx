import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileDown,
  FileImage,
  ImageIcon,
  Info,
  MapPin,
  X,
  Zap
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getBoardByCode } from "../../../services/board.service";
import type { BoardResponseDTO } from "../../../shared/types/BoardProps";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { generateNfpaPDF } from "../../../shared/utils/generateNfpaPDF";

const groundingData = [
  { date: "Ene", ohms: 4.2 },
  { date: "Feb", ohms: 4.5 },
  { date: "Mar", ohms: 5.1 },
  { date: "Abr", ohms: 4.8 },
  { date: "May", ohms: 6.3 },
];

const loadChartData = [
  { fase: "R", carga: 32 },
  { fase: "S", carga: 34 },
  { fase: "T", carga: 34 },
];

const value = (data: unknown) =>
  data === null || data === undefined || data === "" ? "-" : String(data);

const bool = (data?: boolean) => (data ? "Sí" : "No");

const formatMeasurementWithUnit = (
  data: number | null | undefined,
  unit = "MΩ"
) => {
  if (data === null || data === undefined) return "-";
  return `${data} ${unit}`;
};

const BoardDetailPage = () => {
  const navigate = useNavigate();
  const { publicCode, code } = useParams();

  const [board, setBoard] = useState<BoardResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const data = await getBoardByCode(publicCode!, code!);
        setBoard(data);
      } catch {
        setError("Error cargando tablero");
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [code, publicCode]);

  // ── 📄 NUEVO: FILTRADO DE DOCUMENTOS EN TIEMPO REAL ──
  const certificadosMantenimiento = board?.assignedDocuments?.filter(
    (doc) => doc.type === "MANTENIMIENTO"
  ) || [];

  const certificadosOperatividad = board?.assignedDocuments?.filter(
    (doc) => doc.type === "OPERATIVIDAD"
  ) || [];

  const openPdfInNewTab = async (url: string, title: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      // Forzamos el tipo de contenido explícitamente a PDF
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(pdfBlob);

      // Abrimos en una pestaña nueva con el visor nativo del navegador
      const newTab = window.open(blobUrl, "_blank");

      // Opcional: Cambiar el título de la pestaña para que no salga "blob:..."
      if (newTab) {
        newTab.document.title = title;
      }
    } catch (error) {
      console.error("Error al abrir el PDF:", error);
      // Fallback: si falla el fetch, lo abre a la antigua
      window.open(url, "_blank");
    }
  };

  const renderField = (label: string, data: unknown, index: number) => (
    <div
      style={{ animation: "fadeUp 0.4s ease both", animationDelay: `${index * 30}ms` }}
      className="rounded-2xl bg-slate-50 p-4 transition-all hover:bg-slate-100/80"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-slate-800">
        {value(data)}
      </p>
    </div>
  );

  const renderImageSection = (
    title: string,
    description: string,
    images: string[] = []
  ) => (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-300">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-[#8ccf2f]/12 text-[#3aaa35]">
          <ImageIcon size={22} />
        </div>
        <div>
          <h2 className="font-bold text-slate-950 text-base tracking-tight">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <FileImage size={32} className="text-slate-300" />
          <p className="mt-2 text-xs font-bold text-slate-500">
            Sin imágenes registradas
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((img, index) => (
            <button
              key={`${img}-${index}`}
              type="button"
              onClick={() => setSelectedImage(img)}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-left cursor-pointer transition-all hover:border-slate-300 hover:shadow-sm"
            >
              <div className="overflow-hidden h-44 w-full">
                <img
                  src={img}
                  alt={`${title} ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-bold text-slate-600">
                  Imagen {index + 1}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );

  // ── 📄 MODIFICADO: RENDERIZAR LISTA DINÁMICA DE CERTIFICADOS ──
  const renderPdfSection = (
    title: string,
    description: string,
    documentsList: any[]
  ) => (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-300">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
          <FileImage size={22} />
        </div>
        <div>
          <h2 className="font-bold text-slate-950 text-base tracking-tight">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>

      {documentsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <FileImage size={32} className="text-slate-300" />
          <p className="mt-2 text-xs font-bold text-slate-500">
            Sin documentos registrados
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {documentsList.map((doc) => (
            <button
              key={doc._id}
              onClick={() => openPdfInNewTab(doc.cloudinaryUrl, doc.title)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0797d5] px-5 py-3 text-xs font-bold text-white transition-all duration-300 hover:bg-[#087fb3] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0797d5]/20 cursor-pointer"
            >
              <FileImage size={15} />
              {doc.title}
            </button>
          ))}
        </div>
      )}
    </section>
  );

  // const renderNfpaSection = () => {
  //   if (!board?.nfpa) {
  //     return (
  //       <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-8 text-center text-xs font-semibold text-slate-400">
  //         Este tablero no cuenta con parámetros de seguridad NFPA 70E registrados.
  //       </div>
  //     );
  //   }

  //   const { nfpa } = board;

  //   return (
  //     <>
  //       {/* Botón añadido para exportar el registro actual */}
  //       <button
  //         type="button"
  //         onClick={() => generateNfpaPDF(board)}
  //         className="relative z-10 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-black text-slate-900 border border-white shadow-md transition-all duration-200 hover:bg-amber-400 hover:border-amber-400 hover:text-slate-950 active:scale-95 cursor-pointer"
  //       >
  //         <FileDown size={15} />
  //         Exportar Etiqueta
  //       </button>

  //       <section className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-sm transition-all duration-300 hover:border-red-300">
  //         <div className="bg-red-600 px-6 py-4 flex justify-center text-white relative overflow-hidden">
  //           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
  //           <div className="flex items-center gap-4 relative z-10">
  //             <img
  //               src="/warningIcon.png"
  //               alt="Voltguard"
  //               className="size-15 object-contain"
  //             />
  //             <p className="text-4xl font-black tracking-wide">PELIGRO</p>
  //           </div>
  //         </div>

  //         <div className="p-6">
  //           <div className="mb-5 border-b pb-4 text-center">
  //             <h2 className="text-lg font-black uppercase text-slate-900 tracking-tight">
  //               Riesgo de arco eléctrico y electrocución presente
  //             </h2>
  //             <p className="mt-0.5 text-xs font-medium text-slate-500">
  //               Se requiere EPP de acuerdo a categoría
  //             </p>
  //           </div>

  //           <div className="grid gap-6 lg:grid-cols-2">
  //             <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/30">
  //               <h3 className="mb-4 text-sm font-black uppercase text-slate-800 tracking-wider">
  //                 Riesgo de arco eléctrico
  //               </h3>
  //               <div className="space-y-3 text-xs font-semibold text-slate-600">
  //                 <div className="flex justify-between border-b border-slate-100 pb-1.5">
  //                   <span>Distancia de arco</span>
  //                   <strong className="text-slate-900">{nfpa.distanciaArco}</strong>
  //                 </div>
  //                 <div className="flex justify-between border-b border-slate-100 pb-1.5">
  //                   <span>Energía incidente</span>
  //                   <strong className="text-slate-900">{nfpa.energiaIncidente}</strong>
  //                 </div>
  //                 <div className="flex justify-between border-b border-slate-100 pb-1.5">
  //                   <span>Distancia de trabajo</span>
  //                   <strong className="text-slate-900">{nfpa.distanciaTrabajo}</strong>
  //                 </div>
  //                 <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
  //                   <span className="font-bold text-red-900">Categoría de riesgo</span>
  //                   <span className="text-3xl font-black text-red-600">{nfpa.categoriaRiesgo}</span>
  //                 </div>
  //               </div>
  //             </div>

  //             <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/30">
  //               <h3 className="mb-4 text-sm font-black uppercase text-slate-800 tracking-wider">
  //                 Riesgo de electrocución
  //               </h3>
  //               <div className="space-y-3 text-xs font-semibold text-slate-600">
  //                 <div className="flex justify-between border-b border-slate-100 pb-1.5">
  //                   <span>Tensión</span>
  //                   <strong className="text-slate-900">{board.tensionNominal || 380} VCA</strong>
  //                 </div>
  //                 <div className="flex justify-between border-b border-slate-100 pb-1.5">
  //                   <span>Límite de aproximación</span>
  //                   <strong className="text-slate-900">{nfpa.limiteAproximacion}</strong>
  //                 </div>
  //                 <div className="flex justify-between border-b border-slate-100 pb-1.5">
  //                   <span>Distancia restringida</span>
  //                   <strong className="text-slate-900">{nfpa.distanciaRestringida}</strong>
  //                 </div>
  //                 <div className="rounded-xl bg-amber-50/70 border border-amber-200/60 p-3">
  //                   <p className="font-black uppercase text-amber-800 text-[10px] tracking-wider">Guantes</p>
  //                   <p className="mt-0.5 text-xs font-medium text-slate-700">
  //                     {nfpa.guantesClase}
  //                   </p>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>

  //           <div className="mt-5 rounded-2xl border border-slate-200 p-5 bg-slate-50/20">
  //             <h3 className="mb-3 text-sm font-black uppercase text-slate-800 tracking-wider">
  //               EPP requerido
  //             </h3>
  //             <ul className="space-y-2 text-xs font-medium text-slate-600">
  //               {nfpa.eppRequerido && nfpa.eppRequerido.map((item, index) => (
  //                 <li key={index} className="flex gap-2 items-start">
  //                   <span className="text-red-500 font-bold">•</span>
  //                   <span>{item}</span>
  //                 </li>
  //               ))}
  //             </ul>
  //           </div>

  //           <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between font-medium">
  //             <p><strong>Tablero:</strong> {board?.name}</p>
  //             <p><strong>Voltguard | Norma NFPA 70E - 2024</strong></p>
  //             <p>
  //               <strong>Fecha de cálculo:</strong>{" "}
  //               {board.createdAt ? new Date(board.createdAt).toLocaleDateString('es-ES') : "01/01/2026"}
  //             </p>
  //           </div>
  //         </div>
  //       </section>
  //     </>
  //   );
  // };


const renderNfpaSection = () => {
    if (!board?.nfpa) {
      return (
        <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-8 text-center text-xs font-semibold text-slate-400">
          Este tablero no cuenta con parámetros de seguridad NFPA 70E registrados.
        </div>
      );
    }

    const { nfpa } = board;

    return (
      <>
        {/* Botón para exportar el registro actual */}
        <button
          type="button"
          onClick={() => generateNfpaPDF(board)}
          className="relative z-10 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-black text-slate-900 border border-white shadow-md transition-all duration-200 hover:bg-amber-400 hover:border-amber-400 hover:text-slate-950 active:scale-95 cursor-pointer"
        >
          <FileDown size={15} />
          Exportar Etiqueta
        </button>

        <section className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-sm transition-all duration-300 hover:border-red-300">
          <div className="bg-red-600 px-6 py-4 flex justify-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
            <div className="flex items-center gap-4 relative z-10">
              <img
                src="/warningIcon.png"
                alt="Voltguard"
                className="size-15 object-contain"
              />
              <p className="text-4xl font-black tracking-wide">PELIGRO</p>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-5 border-b pb-4 text-center">
              <h2 className="text-lg font-black uppercase text-slate-900 tracking-tight">
                Riesgo de arco eléctrico y electrocución presente
              </h2>
              
              {/* NUEVA UBICACIÓN DE LA NORMA: En la cabecera técnica */}
              <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
                <p className="text-slate-500">Se requiere EPP de acuerdo a categoría</p>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700 font-bold border border-slate-200/60">
                  Norma NFPA 70E - 2024
                </span>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/30">
                <h3 className="mb-4 text-sm font-black uppercase text-slate-800 tracking-wider">
                  Riesgo de arco eléctrico
                </h3>
                <div className="space-y-3 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Distancia de arco</span>
                    <strong className="text-slate-900">{nfpa.distanciaArco}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Energía incidente</span>
                    <strong className="text-slate-900">{nfpa.energiaIncidente}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Distancia de trabajo</span>
                    <strong className="text-slate-900">{nfpa.distanciaTrabajo}</strong>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
                    <span className="font-bold text-red-900">Categoría de riesgo</span>
                    <span className="text-3xl font-black text-red-600">{nfpa.categoriaRiesgo}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50/30">
                <h3 className="mb-4 text-sm font-black uppercase text-slate-800 tracking-wider">
                  Riesgo de electrocución
                </h3>
                <div className="space-y-3 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Tensión</span>
                    <strong className="text-slate-900">{board.tensionNominal || 380} VCA</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Límite de aproximación</span>
                    <strong className="text-slate-900">{nfpa.limiteAproximacion}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span>Distancia restringida</span>
                    <strong className="text-slate-900">{nfpa.distanciaRestringida}</strong>
                  </div>
                  <div className="rounded-xl bg-amber-50/70 border border-amber-200/60 p-3">
                    <p className="font-black uppercase text-amber-800 text-[10px] tracking-wider">Guantes</p>
                    <p className="mt-0.5 text-xs font-medium text-slate-700">
                      {nfpa.guantesClase}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 p-5 bg-slate-50/20">
              <h3 className="mb-3 text-sm font-black uppercase text-slate-800 tracking-wider">
                EPP requerido
              </h3>
              <ul className="space-y-2 text-xs font-medium text-slate-600">
                {nfpa.eppRequerido && nfpa.eppRequerido.map((item, index) => (
                  <li key={index} className="flex gap-2 items-start">
                    <span className="text-red-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── NUEVA DISTRIBUCIÓN REORGANIZADA DEL PIE DE PÁGINA (3 COLUMNAS) ── */}
            <div className="mt-5 border-t border-slate-100 pt-4 grid gap-4 grid-cols-1 sm:grid-cols-3 items-center text-xs text-slate-400 font-medium">
              
              {/* COLUMNA IZQUIERDA: Nombre del Tablero */}
              <div className="text-left">
                <p className="text-slate-700 font-bold">
                  Tablero: <span className="font-semibold text-slate-500">{board?.name}</span>
                </p>
              </div>

              {/* COLUMNA CENTRAL: Bloque "Creado por: Voltguard" */}
              <div className="flex items-center justify-start sm:justify-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400">Creado por:</span>
                <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200/60 px-2.5 py-1 shadow-sm">
                  <img 
                    src="/voltguard.png" 
                    alt="Voltguard Logo" 
                    className="size-4.5 object-contain"
                  />
                  <span className="font-black text-slate-800 tracking-tight text-[12px]">
                    Voltguard
                  </span>
                </div>
              </div>

              {/* COLUMNA DERECHA: Fecha de cálculo */}
              <div className="text-start sm:text-right">
                <p className="font-semibold text-slate-500">
                  Fecha de cálculo:{" "}
                  <span className="font-normal text-slate-400">
                    {board.createdAt ? new Date(board.createdAt).toLocaleDateString('es-ES') : "01/01/2026"}
                  </span>
                </p>
              </div>

            </div>
          </div>
        </section>
      </>
    );
  };
  

  const renderInsulationMeasurements = () => {
    const records = board?.insulationMeasurements ?? [];
    const record = records.length > 0 ? records[records.length - 1] : null;
    const row = record?.rows?.[0];

    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-slate-300">
        <div className="mb-4">
          <h2 className="font-bold text-slate-950 text-base">Mediciones de aislamiento</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Medición fase-tierra expresada en MΩ
          </p>
        </div>

        {!row ? (
          <p className="text-sm text-slate-400 font-medium">
            Sin mediciones de aislamiento registradas
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 md:hidden">
              <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs font-medium text-slate-600">
                <p className="border-b border-slate-200/60 pb-1.5">
                  <strong className="text-slate-800">Descripción:</strong> {value(row.description || "Barras generales")}
                </p>
                <p className="border-b border-slate-200/60 pb-1.5 flex justify-between">
                  <span>Fase 1 - Tierra:</span>
                  <strong className="text-slate-900">{formatMeasurementWithUnit(row.measurement_l1_g, row.unit || record.unit || "MΩ")}</strong>
                </p>
                <p className="border-b border-slate-200/60 pb-1.5 flex justify-between">
                  <span>Fase 2 - Tierra:</span>
                  <strong className="text-slate-900">{formatMeasurementWithUnit(row.measurement_l2_g, row.unit || record.unit || "MΩ")}</strong>
                </p>
                <p className="flex justify-between">
                  <span>Fase 3 - Tierra:</span>
                  <strong className="text-slate-900">{formatMeasurementWithUnit(row.measurement_l3_g, row.unit || record.unit || "MΩ")}</strong>
                </p>
              </div>
            </div>

            <div className="hidden overflow-x-auto md:block rounded-2xl border border-slate-100">
              <table className="w-full min-w-[720px] text-xs text-left border-collapse">
                <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-4 w-2/5">Descripción</th>
                    <th className="p-4 text-center">Fase 1 - Tierra</th>
                    <th className="p-4 text-center">Fase 2 - Tierra</th>
                    <th className="p-4 text-center">Fase 3 - Tierra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 text-slate-900 font-bold">{value(row.description || "Barras generales")}</td>
                    <td className="p-4 text-center text-slate-900">{formatMeasurementWithUnit(row.measurement_l1_g, row.unit || record.unit || "MΩ")}</td>
                    <td className="p-4 text-center text-slate-900">{formatMeasurementWithUnit(row.measurement_l2_g, row.unit || record.unit || "MΩ")}</td>
                    <td className="p-4 text-center text-slate-900">{formatMeasurementWithUnit(row.measurement_l3_g, row.unit || record.unit || "MΩ")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderGroundingSection = () => (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-300">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-[#8ccf2f]/12 text-[#3aaa35]">
          <Zap size={22} />
        </div>
        <div>
          <h2 className="font-bold text-slate-950 text-base">Puesta a Tierra</h2>
          <p className="text-xs text-slate-500 mt-0.5">Sistema de trazabilidad y mediciones PAT</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: "Sistema", val: "PAT Principal", cls: "text-slate-900" },
          { label: "Última medición", val: "6.3 Ω", cls: "text-slate-900" },
          { label: "Estado", val: "ÓPTIMO", cls: "text-green-600 font-black" },
          { label: "Última inspección", val: "01/05/2025", cls: "text-slate-900" }
        ].map((pat, i) => (
          <div key={i} className="rounded-2xl bg-slate-50/70 p-4 border border-transparent hover:border-slate-200/60 transition-colors">
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{pat.label}</p>
            <p className={`mt-1.5 text-sm font-bold ${pat.cls}`}>{pat.val}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-4">
          <h3 className="font-bold text-sm text-slate-900">Gráfica de trazabilidad</h3>
          <p className="text-xs text-slate-400 mt-0.5">Evolución histórica de resistencia de puesta a tierra</p>
        </div>

        <div className="h-[280px] w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={groundingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="ohms"
                stroke="#0797d5"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-3">
          <h3 className="font-bold text-sm text-slate-900">Historial de mediciones</h3>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full min-w-[700px] text-xs text-left border-collapse">
            <thead className="bg-slate-50 font-bold text-slate-500 uppercase border-b border-slate-100 tracking-wider">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Resistencia</th>
                <th className="p-3">Técnico</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Observación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {[
                { d: "01/01/2025", o: "4.2 Ω", t: "Juan Pérez", s: "OK", sCls: "text-green-600", obs: "Valores normales" },
                { d: "01/03/2025", o: "5.1 Ω", t: "Carlos Ruiz", s: "OK", sCls: "text-green-600", obs: "Sin observaciones" },
                { d: "01/05/2025", o: "6.3 Ω", t: "Miguel Torres", s: "OK", sCls: "text-green-600", obs: "Tendencia estable" }
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-3 text-slate-900 font-bold">{row.d}</td>
                  <td className="p-3">{row.o}</td>
                  <td className="p-3">{row.t}</td>
                  <td className={`p-3 font-black ${row.sCls}`}>{row.s}</td>
                  <td className="p-3 text-slate-500 font-medium">{row.obs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Certificado de puesta a tierra</h3>
            <p className="text-xs text-slate-400 mt-0.5">Documento técnico de validación PAT</p>
          </div>
          <a
            href="/pdfs/certificado-pat.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0797d5] px-4 py-2.5 text-xs font-bold text-white transition hover:opacity-90 cursor-pointer"
          >
            <FileImage size={15} />
            Ver certificado PDF
          </a>
        </div>
      </div>
    </section>
  );

  const renderLoadPanelSection = () => (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-300">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-[#0797d5]/12 text-[#0797d5]">
          <Zap size={22} />
        </div>
        <div>
          <h2 className="font-bold text-slate-950 text-base">Cuadro de Carga</h2>
          <p className="text-xs text-slate-500 mt-0.5">Distribución y análisis de circuitos eléctricos</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { l: "Circuitos", v: "18", c: "text-slate-900 font-black text-2xl" },
          { l: "Carga instalada", v: "12.5 kW", c: "text-slate-900 font-black text-2xl" },
          { l: "Corriente total", v: "58 A", c: "text-slate-900 font-black text-2xl" },
          { l: "Balance", v: "ÓPTIMO", c: "text-green-600 font-black text-base mt-1" }
        ].map((box, i) => (
          <div key={i} className="rounded-2xl bg-slate-50/70 p-4 border border-transparent hover:border-slate-200/60 transition-colors">
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{box.l}</p>
            <p className={`mt-1 tracking-tight ${box.c}`}>{box.v}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-4">
          <h3 className="font-bold text-sm text-slate-900">Balance de fases</h3>
          <p className="text-xs text-slate-400 mt-0.5">Distribución porcentual de carga eléctrica</p>
        </div>

        <div className="h-[280px] rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={loadChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="fase" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Bar
                dataKey="carga"
                fill="#0797d5"
                radius={[6, 6, 0, 0]}
                isAnimationActive={true}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-3">
          <h3 className="font-bold text-sm text-slate-900">Circuitos del tablero</h3>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full min-w-[1000px] text-xs text-left border-collapse">
            <thead className="bg-slate-50 font-bold text-slate-500 uppercase border-b border-slate-100 tracking-wider">
              <tr>
                <th className="p-3">Circuito</th>
                <th className="p-3">Descripción</th>
                <th className="p-3">Interruptor</th>
                <th className="p-3">Fase</th>
                <th className="p-3">Tensión</th>
                <th className="p-3">Potencia</th>
                <th className="p-3">Corriente</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {[
                { c: "C1", d: "Iluminación oficinas", i: "20A", f: "R", v: "220V", p: "1.2 kW", a: "5.2 A", e: "OPERATIVO" },
                { c: "C2", d: "Tomacorrientes", i: "30A", f: "S", v: "220V", p: "2.5 kW", a: "11.4 A", e: "OPERATIVO" },
                { c: "C3", d: "Aire acondicionado", i: "40A", f: "T", v: "380V", p: "3.8 kW", a: "15.2 A", e: "OPERATIVO" }
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-3 text-slate-900 font-bold">{row.c}</td>
                  <td className="p-3 text-slate-900 font-medium">{row.d}</td>
                  <td className="p-3">{row.i}</td>
                  <td className="p-3 font-bold text-[#0797d5]">{row.f}</td>
                  <td className="p-3">{row.v}</td>
                  <td className="p-3">{row.p}</td>
                  <td className="p-3">{row.a}</td>
                  <td className="p-3 text-green-600 font-black">{row.e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="h-28 animate-pulse rounded-3xl bg-slate-200" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-3xl bg-slate-200" />
          <div className="h-72 animate-pulse rounded-3xl bg-slate-200" />
        </div>
        <div className="h-96 animate-pulse rounded-3xl bg-slate-200" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 font-bold text-sm">
          {error}
        </div>
      </section>
    );
  }

  if (!board) {
    return (
      <section className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-400 font-semibold text-sm">
          No encontrado
        </div>
      </section>
    );
  }

  const companyName =
    typeof board.company === "object" ? board.company.name : "Sin empresa";

  return (
    <>
      <section className="mx-auto max-w-7xl space-y-6 opacity-0" style={{ animation: "fadeUp 0.5s ease forwards" }}>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        {/* ── SECCIÓN IDENTIFICACIÓN GENERAL ── */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#0797d5] to-[#8ccf2f] p-6 text-white relative">
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center relative z-10">
              <div>
                <div className="mb-2.5 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                  <Zap size={12} />
                  Tablero eléctrico
                </div>
                <h1 className="text-2xl font-black md:text-3xl tracking-tight">{board.name}</h1>
                <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-white/95">
                  <Building2 size={15} />
                  {companyName}
                </p>
              </div>

              <div className="rounded-2xl bg-white/15 px-5 py-3.5 backdrop-blur border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Código</p>
                <p className="mt-0.5 text-xl font-black tracking-tight">{value(board.boardCode)}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 grid-cols-2 lg:grid-cols-4">
            {[
              { l: "Ubicación", v: board.location, icon: MapPin, textCls: "text-slate-800", iconCls: "text-[#0797d5]" },
              { l: "Tipo", v: board.type, icon: Info, textCls: "text-slate-800", iconCls: "text-[#0797d5]" },
              { l: "Sistema", v: board.sistema, icon: Zap, textCls: "text-slate-800", iconCls: "text-[#0797d5]" },
              { l: "Estado", v: board.estadoGeneral, icon: CheckCircle2, textCls: "text-slate-800", iconCls: "text-[#3aaa35]" }
            ].map((item, i) => {
              const CardIcon = item.icon;
              return (
                <div key={i} className="rounded-2xl bg-slate-50/70 p-4 border border-transparent hover:border-slate-200/50 transition-colors">
                  <CardIcon className={item.iconCls} size={20} />
                  <p className="mt-2.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider">{item.l}</p>
                  <p className={`mt-0.5 text-xs sm:text-sm font-bold truncate ${item.textCls}`}>{value(item.v)}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Renderizado de bloques modulares */}
        {renderNfpaSection()}
        {renderGroundingSection()}
        {renderLoadPanelSection()}

        {/* ── ESPECIFICACIONES TÉCNICAS (CASCADA COMPACTA) ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-950 text-base">Información general</h2>
            <div className="space-y-2">
              {renderField("Código real del tablero", board.boardCode, 1)}
              {renderField("Nombre", board.name, 2)}
              {renderField("Tipo", board.type, 3)}
              {renderField("Sistema", board.sistema, 4)}
              {renderField("Estado general", board.estadoGeneral, 5)}
              {renderField("Ubicación", board.location, 6)}
              {renderField("Descripción", board.description, 7)}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-950 text-base">Información eléctrica</h2>
            <div className="space-y-2">
              {renderField("Tensión nominal", board.tensionNominal ? `${board.tensionNominal} V` : "-", 1)}
              {renderField("Número de fases", board.numeroFases, 2)}
              <div
                style={{ animation: "fadeUp 0.4s ease both", animationDelay: "90ms" }}
                className="rounded-2xl bg-slate-50 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Incluye neutro</p>
                <p className="mt-1 break-words text-sm font-bold text-slate-800">{bool(board.incluyeNeutro)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── LEYENDA TÉCNICA ── */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-bold text-slate-950 text-base">Leyenda</h2>

          {!board.circuits?.length ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-xs font-bold text-slate-400 uppercase">
              Sin circuitos registrados
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {board.circuits.map((c, i) => (
                  <div key={i} className="space-y-1.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-xs font-medium text-slate-600">
                    <p><strong className="text-slate-800">Circuito:</strong> {value(c.circuito)}</p>
                    <p><strong className="text-slate-800">Descripción:</strong> {value(c.descripcion)}</p>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block rounded-2xl border border-slate-100">
                <table className="w-full min-w-[720px] text-xs text-left border-collapse">
                  <thead className="bg-slate-50 font-bold text-slate-500 uppercase border-b border-slate-100 tracking-wider">
                    <tr>
                      <th className="p-3 w-1/4">Circuito</th>
                      <th className="p-3">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {board.circuits.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="p-3 text-slate-900 font-bold">{value(c.circuito)}</td>
                        <td className="p-3 font-medium">{value(c.descripcion)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Secciones de imágenes fijas */}
        {renderInsulationMeasurements()}
        {renderImageSection("Imágenes del tablero", "Fotografías generales del tablero eléctrico", board.images?.tablero)}
        {renderImageSection("Diagrama unifilar", "Imágenes del diagrama unifilar registrado", board.images?.unifilar)}
        {renderImageSection("Termografía", "Imágenes termográficas asociadas al tablero", board.images?.termografia)}

        {/* ── 📄 CONECTADO: SECCIONES DE CERTIFICADOS ASIGNADOS REALES DE CLOUDINARY ── */}
        {renderPdfSection(
          "Certificados de mantenimiento",
          "Documentos PDF asignados de mantenimiento técnico",
          certificadosMantenimiento
        )}

        {renderPdfSection(
          "Certificados de operatividad",
          "Documentos PDF asignados del nivel de operatividad estructural",
          certificadosOperatividad
        )}

      </section>

      {/* Visor de imágenes modal integrado */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 transition-all duration-300 animate-fade-in">
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute right-5 top-5 flex size-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow shadow-black/20 hover:bg-slate-50 cursor-pointer transition-colors z-50"
          >
            <X size={20} />
          </button>

          <TransformWrapper>
            <TransformComponent>
              <img
                src={selectedImage}
                alt="Vista ampliada"
                className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain shadow-2xl transition-all relative z-40"
                onClick={(event) => event.stopPropagation()}
              />
            </TransformComponent>
          </TransformWrapper>
        </div>
      )}
    </>
  );
};

export default BoardDetailPage;