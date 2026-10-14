import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Receipt,
  UploadCloud,
  FileCheck2,
  // Calendar,
  // Zap,
  // Building
} from "lucide-react";

// ── DATOS HARDCODEADOS DE PRUEBA ──
// Apunta a public/pdfs/recibo-luz.pdf (en Vite/CRA la carpeta public se sirve desde la raíz '/')
const HARDCODED_BILL = {
  title: "Recibo de Suministro Eléctrico - Noviembre 2025",
  fileName: "recibo-luz-marzo-2026.pdf",
  pdfUrl: "/pdfs/recibo_de_luz_bbva_agencia_aviacion.pdf", // Cambia 'recibo-luz.pdf' por el nombre real de tu archivo en public/pdfs/
  period: "2026-03",
  distributor: "Luz del Sur S.A.A.",
  supplyNumber: "2849102",
  amountDue: "S/ 3,428.50",
  dueDate: "24/03/2026",
  consumptionKwh: "4,820 kWh",
};

const BillingDashboardPage = () => {
  const { publicCode } = useParams<{ publicCode: string }>();
  const navigate = useNavigate();

  // Estado para alternar entre ver el visor o ver la pantalla de subir
  const [showViewer, setShowViewer] = useState<boolean>(true);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = HARDCODED_BILL.pdfUrl;
    link.download = HARDCODED_BILL.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-slate-100">
      {/* ── BARRA SUPERIOR (HEADER) ── */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="flex size-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors"
            title="Volver"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500 shrink-0">
            <Receipt size={18} />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-slate-900">
              {showViewer ? HARDCODED_BILL.title : "Cargar Recibo de Luz"}
            </h1>
            <p className="text-[10px] text-slate-400">
              {publicCode ? `Código Empresa: ${publicCode}` : "Suministro Principal MT/BT"}
            </p>
          </div>
        </div>

        {/* Botones de acción superior */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Botón switch para probar ambos estados de la pantalla */}
          <button
            type="button"
            onClick={() => setShowViewer((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            {showViewer ? "Simular Vista Cargar" : "Ver Recibo PDF"}
          </button>

          {showViewer && (
            <>
              <a
                href={HARDCODED_BILL.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <ExternalLink size={13} />
                <span className="hidden sm:inline">Pestaña externa</span>
              </a>

              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-xl bg-[#0797d5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#087fb3] transition-colors cursor-pointer"
                title="Descargar PDF"
              >
                <Download size={13} />
                <span>Descargar</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── BARRA RESUMEN DE DATOS DEL RECIBO (METADATOS) ── */}
      {/* {showViewer && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-slate-200 bg-white px-5 py-2 text-xs">
          <div className="flex items-center gap-2">
            <Building size={14} className="text-slate-400 shrink-0" />
            <div>
              <span className="block text-[10px] text-slate-400 font-medium">Distribuidora</span>
              <span className="font-bold text-slate-700">{HARDCODED_BILL.distributor}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Zap size={14} className="text-[#0797d5] shrink-0" />
            <div>
              <span className="block text-[10px] text-slate-400 font-medium">Consumo Activo</span>
              <span className="font-bold text-slate-700">{HARDCODED_BILL.consumptionKwh}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-amber-500 shrink-0" />
            <div>
              <span className="block text-[10px] text-slate-400 font-medium">Vencimiento</span>
              <span className="font-bold text-slate-700">{HARDCODED_BILL.dueDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Receipt size={14} className="text-emerald-500 shrink-0" />
            <div>
              <span className="block text-[10px] text-slate-400 font-medium">Importe Total</span>
              <span className="font-bold text-emerald-600">{HARDCODED_BILL.amountDue}</span>
            </div>
          </div>
        </div>
      )} */}

      {/* ── CONTENIDO PRINCIPAL: VISOR O DROPZONE ── */}
      <div className="flex-1 p-2 sm:p-4 overflow-hidden">
        {showViewer ? (
          /* Visor PDF Iframe */
          <div className="h-full w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <iframe
              src={`${HARDCODED_BILL.pdfUrl}#toolbar=1&navpanes=0`}
              title={HARDCODED_BILL.title}
              className="h-full w-full border-none"
            />
          </div>
        ) : (
          /* Dropzone / Pantalla de Subida */
          <div className="flex h-full w-full items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="text-center mb-6">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 mb-3">
                  <Receipt size={24} />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Subir Recibo de Suministro
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Sube el archivo PDF del mes correspondiente para auditoría energética
                </p>
              </div>

              <div
                onClick={() => setShowViewer(true)}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-8 text-center cursor-pointer hover:border-[#0797d5] hover:bg-[#0797d5]/5 transition-all"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 mb-3">
                  <UploadCloud size={20} />
                </div>
                <p className="text-xs font-bold text-slate-700">
                  Arrastra o selecciona el PDF
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  (Haz clic aquí para cargar el recibo de prueba)
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600">
                <FileCheck2 size={14} className="text-emerald-500 shrink-0" />
                <span>Archivo preparado: <strong className="font-semibold text-slate-700">recibo-luz.pdf</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingDashboardPage;