import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface SpatReportData {
  certificateCode: string;
  revision: string;
  measurementDate: string;
  issueDate: string;
  validityDate: string;
  globalResult: string; // Ej: "CONFORME CON OBSERVACIONES · Alerta temprana emitida"

  // KPIs
  resistanceValue: number; // 2.98
  resistanceLimit: number; // 5.00
  leakageCurrent: number; // 1.40
  leakageLimit: number; // 5.00
  rodDiameter: number; // 14.60
  rodNominal: number; // 16.00
  healthIndex: number; // 68
  healthStatus: string; // "Observado" | "Conforme" | "Crítico"

  executiveSummary?: string;

  // Datos del cliente y sistema
  clientData: {
    businessName: string;
    ruc: string;
    facility: string;
    address: string;
    coordinates: string;
    spatId: string; // "P1 (placa de identificación instalada)"
    systemFunction: string;
    configuration: string;
    electrode: string;
    conductor: string;
    connectionType: string;
    registerBox: string;
    installationDate: string;
    totalSpats: string;
  };

  // Tendencia quinquenal (5 años)
  historicalYears?: string[]; // ["2022", "2023", "2024", "2025", "2026"]
  resistanceHistory?: number[]; // [2.12, 2.38, 2.58, 2.71, 2.98]
  leakageHistory?: number[]; // [0.80, 0.90, 1.10, 1.20, 1.40]
  rodHistory?: number[]; // [15.80, 15.60, 15.30, 15.00, 14.60]
  phHistory?: number[]; // [7.40, 7.10, 6.80, 6.50, 6.10]

  // Fotos comparativas
  photosBefore?: { label: string; url: string }[]; // 3 fotos
  photosAfter?: { label: string; url: string }[]; // 3 fotos

  diagnosisParagraphs?: string[];

  // Firmas
  signers?: {
    measurement: { name: string; role: string; date: string };
    review: { name: string; role: string; date: string };
    approval: { name: string; role: string; date: string };
  };
}

// Paleta de colores exacta de GESENER
const PRIMARY_BLUE: [number, number, number] = [11, 75, 140]; // Azul marino cabecera
const ACCENT_BLUE: [number, number, number] = [7, 151, 213];
const TEXT_DARK: [number, number, number] = [30, 41, 59];
const TEXT_MUTED: [number, number, number] = [100, 116, 139];
const BORDER_COLOR: [number, number, number] = [226, 232, 240];
const ROW_ALT: [number, number, number] = [248, 250, 252];
const COLOR_GREEN: [number, number, number] = [22, 163, 74];
const COLOR_AMBER: [number, number, number] = [217, 119, 6];
const COLOR_RED: [number, number, number] = [220, 38, 38];

export const generateSpatPDF = async (data: SpatReportData) => {
  const doc = new jsPDF({
    format: "a4",
    unit: "mm",
  });

  const pageWidth = 210;
//   const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;
//   const bottomLimit = 278;

  // Encabezado institucional de página
  const drawPageHeader = (showTitleBar = false) => {
    // Logo / Texto GESENER
    doc.setFillColor(11, 75, 140);
    doc.circle(marginX + 5, 12, 4.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("G", marginX + 3.5, 13.5);

    doc.setTextColor(...PRIMARY_BLUE);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("ESENER", marginX + 10, 13);

    doc.setTextColor(...ACCENT_BLUE);
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.text("SMART ENERGY", marginX + 10, 16);

    // Metadatos derecha
    doc.setTextColor(...TEXT_DARK);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(`${data.certificateCode} · Rev. ${data.revision}`, pageWidth - marginX, 11, {
      align: "right",
    });
    doc.setTextColor(...TEXT_MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text("Certificado de medición y mantenimiento de SPAT", pageWidth - marginX, 15, {
      align: "right",
    });

    if (showTitleBar) {
      // Barra azul marino gruesa con título
      doc.setFillColor(...PRIMARY_BLUE);
      doc.rect(marginX, 20, contentWidth, 11, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text(
        "CERTIFICADO PROTOCOLO DE MEDICIÓN Y MANTENIMIENTO",
        pageWidth / 2,
        24.5,
        { align: "center" }
      );
      doc.setFontSize(8);
      doc.text(
        `SISTEMA DE PUESTA A TIERRA · SPAT ${data.clientData.spatId.split(" ")[0]}`,
        pageWidth / 2,
        29,
        { align: "center" }
      );
    }
  };

  const drawFooter = () => {
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setDrawColor(...BORDER_COLOR);
      doc.line(marginX, 285, pageWidth - marginX, 285);

      doc.setTextColor(...TEXT_MUTED);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(
        "GESENER SMART ENERGY S.A.C. · Protocolo validado según CNE y NTP 370.052",
        marginX,
        290
      );
      doc.text(`Página ${i} de ${pages}`, pageWidth - marginX, 290, { align: "right" });
    }
  };

  const drawSectionHeader = (title: string, y: number): number => {
    doc.setFillColor(...PRIMARY_BLUE);
    doc.rect(marginX, y, contentWidth, 6.5, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(title.toUpperCase(), marginX + 3, y + 4.5);

    return y + 9.5;
  };

  // ══════════════════════════════════════════════════════════════════
  // PÁGINA 1: DATOS GENERALES Y KPIS
  // ══════════════════════════════════════════════════════════════════
  drawPageHeader(true);

  let currentY = 34;

  // 1. Tabla resumen superior
  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: 1.8,
      lineColor: BORDER_COLOR,
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: "normal", textColor: TEXT_MUTED, fillColor: ROW_ALT },
      1: { cellWidth: contentWidth - 50, fontStyle: "bold", textColor: TEXT_DARK },
    },
    body: [
      ["Código de documento", data.certificateCode],
      ["Revisión", `Rev. ${data.revision}`],
      ["Fecha de medición", data.measurementDate],
      ["Fecha de emisión", data.issueDate],
      ["Vigencia del certificado", `${data.validityDate} (12 meses)`],
      ["Resultado global", data.globalResult],
    ],
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // 2. Tarjetas KPI (4 columnas)
  const kpiWidth = (contentWidth - 6) / 4;
  const kpis = [
    {
      title: "Resistencia PAT",
      value: `${data.resistanceValue.toFixed(2)} \u03A9`,
      sub: `Criterio \u2264 ${data.resistanceLimit.toFixed(2)} \u03A9`,
      color: data.resistanceValue <= data.resistanceLimit ? COLOR_GREEN : COLOR_RED,
    },
    {
      title: "Corriente de fuga",
      value: `${data.leakageCurrent.toFixed(2)} mA`,
      sub: `Criterio \u2264 ${data.leakageLimit.toFixed(2)} mA`,
      color: data.leakageCurrent <= data.leakageLimit ? COLOR_GREEN : COLOR_RED,
    },
    {
      title: "Diámetro varilla",
      value: `${data.rodDiameter.toFixed(2)} mm`,
      sub: `Nominal ${data.rodNominal.toFixed(2)} mm`,
      color: COLOR_AMBER,
    },
    {
      title: "Índice de salud SPAT",
      value: `${data.healthIndex} / 100`,
      sub: `Clasificación: ${data.healthStatus.toLowerCase()}`,
      color: data.healthIndex >= 80 ? COLOR_GREEN : COLOR_AMBER,
    },
  ];

  kpis.forEach((kpi, idx) => {
    const x = marginX + idx * (kpiWidth + 2);
    doc.setFillColor(...ROW_ALT);
    doc.roundedRect(x, currentY, kpiWidth, 20, 2, 2, "F");

    doc.setDrawColor(...BORDER_COLOR);
    doc.roundedRect(x, currentY, kpiWidth, 20, 2, 2, "S");

    // Título
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(kpi.title, x + 3, currentY + 5);

    // Valor grande
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...TEXT_DARK);
    doc.text(kpi.value, x + 3, currentY + 12);

    // Subcriterio
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...kpi.color);
    doc.text(kpi.sub, x + 3, currentY + 17);
  });

  currentY += 24;

  // Resumen ejecutivo cursiva
  const summaryText =
    data.executiveSummary ||
    "Resumen ejecutivo: Todos los valores medidos son conformes con los criterios de aceptación adoptados. El análisis de tendencia quinquenal activa alerta temprana por velocidad de corrosión del electrodo y acidificación sostenida del terreno.";

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(summaryText, marginX, currentY, { maxWidth: contentWidth });

  currentY += 10;

  // 3. Sección 1: Datos Generales
  currentY = drawSectionHeader("1. DATOS GENERALES DEL CLIENTE Y DEL SISTEMA", currentY);

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 7.2,
      cellPadding: 2,
      lineColor: BORDER_COLOR,
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: "normal", textColor: TEXT_MUTED, fillColor: ROW_ALT },
      1: { cellWidth: contentWidth - 55, fontStyle: "normal", textColor: TEXT_DARK },
    },
    body: [
      ["Razón social", data.clientData.businessName],
      ["RUC", data.clientData.ruc],
      ["Sede / instalación", data.clientData.facility],
      ["Dirección", data.clientData.address],
      ["Coordenadas (WGS-84)", data.clientData.coordinates],
      ["Identificación del SPAT", data.clientData.spatId],
      ["Función del sistema", data.clientData.systemFunction],
      ["Configuración", data.clientData.configuration],
      ["Electrodo", data.clientData.electrode],
      ["Conductor de conexión", data.clientData.conductor],
      ["Tipo de conexión", data.clientData.connectionType],
      ["Caja de registro", data.clientData.registerBox],
      ["Fecha de instalación", data.clientData.installationDate],
      ["N.° de SPAT en la instalación", data.clientData.totalSpats],
    ],
  });

  // ══════════════════════════════════════════════════════════════════
  // PÁGINA 2: GRÁFICOS DE TENDENCIA QUINQUENAL (Vectoriales limpios)
  // ══════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageHeader(false);
  currentY = 24;

  currentY = drawSectionHeader("4. TENDENCIA HISTÓRICA QUINQUENAL Y ALERTA TEMPRANA", currentY);

  const years = data.historicalYears || ["2022", "2023", "2024", "2025", "2026"];
  const resData = data.resistanceHistory || [2.12, 2.38, 2.58, 2.71, 2.98];
  const leakData = data.leakageHistory || [0.8, 0.9, 1.1, 1.2, 1.4];
  const rodData = data.rodHistory || [15.8, 15.6, 15.3, 15.0, 14.6];
  const phData = data.phHistory || [7.4, 7.1, 6.8, 6.5, 6.1];

  // Helper para trazar mini-gráficos lineales idénticos a los de la imagen
  const drawMiniChart = (
    title: string,
    badgeText: string,
    badgeColor: [number, number, number],
    subtext: string,
    vals: number[],
    minY: number,
    maxY: number,
    critLimit: number | null,
    critLabel: string,
    x: number,
    y: number,
    w: number,
    h: number,
    // unit: string
  ) => {
    // Título y badge
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...TEXT_DARK);
    doc.text(title, x, y + 4);

    // Badge
    doc.setFillColor(...badgeColor);
    doc.roundedRect(x + w - 24, y, 24, 5, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(5.5);
    doc.text(badgeText, x + w - 12, y + 3.6, { align: "center" });

    // Subtítulo
    doc.setTextColor(...TEXT_MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.text(subtext, x, y + 8);

    const chartX = x + 10;
    const chartY = y + 14;
    const chartW = w - 18;
    const chartH = h - 22;

    // Líneas de cuadrícula horizontales
    doc.setDrawColor(241, 245, 249);
    doc.line(chartX, chartY, chartX + chartW, chartY);
    doc.line(chartX, chartY + chartH / 2, chartX + chartW, chartY + chartH / 2);
    doc.line(chartX, chartY + chartH, chartX + chartW, chartY + chartH);

    // Línea de Criterio punteada roja si existe
    if (critLimit !== null && critLimit >= minY && critLimit <= maxY) {
      const critY = chartY + chartH - ((critLimit - minY) / (maxY - minY)) * chartH;
      doc.setDrawColor(...COLOR_RED);
      doc.setLineDashPattern([1.5, 1.5], 0);
      doc.line(chartX, critY, chartX + chartW, critY);
      doc.setLineDashPattern([], 0); // Reset

      doc.setTextColor(...COLOR_RED);
      doc.setFontSize(5);
      doc.text(critLabel, chartX + chartW - 2, critY - 1, { align: "right" });
    }

    // Coordenadas de los 5 puntos
    const points: { px: number; py: number }[] = [];
    vals.forEach((v, idx) => {
      const px = chartX + (idx / (vals.length - 1)) * chartW;
      const py = chartY + chartH - ((v - minY) / (maxY - minY)) * chartH;
      points.push({ px, py });
    });

    // Línea continua azul gruesa
    doc.setDrawColor(...ACCENT_BLUE);
    doc.setLineWidth(0.7);
    for (let i = 0; i < points.length - 1; i++) {
      doc.line(points[i].px, points[i].py, points[i + 1].px, points[i + 1].py);
    }
    doc.setLineWidth(0.2); // Reset

    // Círculos y etiquetas
    points.forEach((pt, idx) => {
      doc.setFillColor(...ACCENT_BLUE);
      doc.circle(pt.px, pt.py, 1.2, "F");

      // Año en eje X
      doc.setTextColor(...TEXT_MUTED);
      doc.setFontSize(6);
      doc.text(years[idx], pt.px, chartY + chartH + 5, { align: "center" });
    });

    // Valor destacado en el último año
    const last = points[points.length - 1];
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_DARK);
    doc.text(`${vals[vals.length - 1].toFixed(2)}`, last.px + 2, last.py - 2);
  };

  const chartBoxW = (contentWidth - 8) / 2;
  const chartBoxH = 50;

  // 1. Resistencia PAT
  drawMiniChart(
    "Resistencia de puesta a tierra (\u03A9)",
    "VIGILANCIA",
    COLOR_AMBER,
    "Criterio \u2264 5.00 \u03A9  ·  Tasa media +8.9 %/año",
    resData,
    1.5,
    5.5,
    5.0,
    "--- Criterio 5.00 \u03A9 ---",
    marginX,
    currentY,
    chartBoxW,
    chartBoxH,
    // "\u03A9"
  );

  // 2. Corriente de fuga
  drawMiniChart(
    "Corriente de fuga (mA)",
    "NORMAL",
    COLOR_GREEN,
    "Criterio \u2264 5.00 mA  ·  Tasa media +15.0 %/año",
    leakData,
    0.5,
    5.5,
    5.0,
    "--- Criterio 5.00 mA ---",
    marginX + chartBoxW + 8,
    currentY,
    chartBoxW,
    chartBoxH,
    // "mA"
  );

  currentY += chartBoxH + 6;

  // 3. Diámetro de varilla
  drawMiniChart(
    "Diámetro de varilla (mm)",
    "ALERTA",
    COLOR_RED,
    "Nominal 16.0 mm  ·  Corrosión -0.40 mm/año",
    rodData,
    14.0,
    16.2,
    14.4,
    "- - - Umbral observación 14.40 mm - - -",
    marginX,
    currentY,
    chartBoxW,
    chartBoxH,
    // "mm"
  );

  // 4. pH del terreno
  drawMiniChart(
    "pH del terreno",
    "VIGILANCIA",
    COLOR_AMBER,
    "Rango óptimo 6.5 - 8.0  ·  -0.33 /año",
    phData,
    5.0,
    8.0,
    5.5,
    "- - - Crítico 5.50 - - -",
    marginX + chartBoxW + 8,
    currentY,
    chartBoxW,
    chartBoxH,
    // ""
  );

  currentY += chartBoxH + 6;

  // Leyenda de colores inferior
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(
    "Verde: dentro de criterio    Ámbar: vigilancia por tendencia    Rojo: alerta temprana",
    marginX,
    currentY
  );
  doc.text(
    `SPAT ${data.clientData.spatId.split(" ")[0]} — ${data.clientData.businessName}, ${data.clientData.facility}`,
    pageWidth - marginX,
    currentY,
    { align: "right" }
  );

  // ══════════════════════════════════════════════════════════════════
  // PÁGINA 3: PANEL FOTOGRÁFICO, DIAGNÓSTICO Y FIRMAS
  // ══════════════════════════════════════════════════════════════════
  doc.addPage();
  drawPageHeader(false);
  currentY = 22;

  currentY = drawSectionHeader("5. PANEL FOTOGRÁFICO COMPARATIVO", currentY);

  const photoWidth = (contentWidth - 6) / 3;
  const photoHeight = 32;

  // Helper para dibujar bloque de 3 fotos
  const drawPhotoRow = (subTitle: string, photos: { label: string; url: string }[], y: number): number => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...PRIMARY_BLUE);
    doc.text(subTitle, marginX, y);
    y += 3;

    photos.forEach((photo, idx) => {
      const px = marginX + idx * (photoWidth + 3);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...PRIMARY_BLUE);
      doc.text(photo.label, px + photoWidth / 2, y + 3.5, { align: "center" });

      // Recuadro fotográfico o placeholder
      doc.setFillColor(...ROW_ALT);
      doc.roundedRect(px, y + 5, photoWidth, photoHeight, 1.5, 1.5, "F");
      doc.setDrawColor(...BORDER_COLOR);
      doc.roundedRect(px, y + 5, photoWidth, photoHeight, 1.5, 1.5, "S");

      // Si viene URL válida, se puede cargar con doc.addImage; aquí se dibuja un placeholder con icono
      doc.setTextColor(...TEXT_MUTED);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text("[Evidencia Fotográfica]", px + photoWidth / 2, y + 5 + photoHeight / 2, {
        align: "center",
      });
    });

    return y + photoHeight + 8;
  };

  const defaultBefore = [
    { label: "F-01 · Caja de registro / entorno", url: "" },
    { label: "F-02 · Medición de electrodo", url: "" },
    { label: "F-03 · Corriente de fuga", url: "" },
  ];
  const defaultAfter = [
    { label: "F-04 · Caja de registro / entorno", url: "" },
    { label: "F-05 · Medición de electrodo", url: "" },
    { label: "F-06 · Corriente de fuga", url: "" },
  ];

  currentY = drawPhotoRow("5.1  Antes del mantenimiento", data.photosBefore || defaultBefore, currentY);
  currentY = drawPhotoRow("5.2  Después del mantenimiento", data.photosAfter || defaultAfter, currentY);

  // 6. Diagnóstico Técnico Integral
  currentY = drawSectionHeader("6. DIAGNÓSTICO TÉCNICO INTEGRAL", currentY);

  const diagText = data.diagnosisParagraphs || [
    `El valor de resistencia es conforme, pero es el indicador menos preocupante del conjunto. Los ${data.resistanceValue} \u03A9 representan el 60% del criterio de ${data.resistanceLimit.toFixed(2)} \u03A9 y dejan margen operativo. Lo relevante es que ese valor ha crecido de forma monótona, es una tendencia física de degradación por lixiviación del compuesto químico.`,
    `La causa de esa tendencia obedece a la pérdida de área efectiva del electrodo (diámetro descendió a ${data.rodDiameter.toFixed(2)} mm) y al incremento de resistividad del suelo circundante desprovisto de humedad pluvial bajo el pavimento de concreto. Se detecta acidificación a pH ${phData[phData.length - 1].toFixed(2)}.`,
    `El hallazgo crítico es la velocidad de corrosión del electrodo (-0.40 mm/año). Se recomienda programar reemplazo preventivo de varilla antes del año 2028 para evitar pérdida de continuidad ante corrientes de falla.`,
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(...TEXT_DARK);

  diagText.forEach((p) => {
    const lines = doc.splitTextToSize(p, contentWidth);
    doc.text(lines, marginX, currentY);
    currentY += lines.length * 3 + 2;
  });

  currentY += 2;

  // 7. Firmas en 3 Columnas
  currentY = drawSectionHeader("7. RESPONSABLES, FIRMAS Y VERIFICACIÓN DIGITAL", currentY);

  const colWidth = (contentWidth - 8) / 3;
  const signers = data.signers || {
    measurement: {
      name: "Eduardo Huamán Choque",
      role: "Proyectos e Ingeniería",
      date: data.measurementDate,
    },
    review: {
      name: "Geily Vela",
      role: "Ingeniería GESENER",
      date: data.issueDate,
    },
    approval: {
      name: "Ing. César Augusto Inga Zapata",
      role: "Ingeniero Electricista · CIP 99496",
      date: data.issueDate,
    },
  };

  const signatureColumns = [
    { title: "EJECUCIÓN DE LA MEDICIÓN", ...signers.measurement },
    { title: "REVISIÓN TÉCNICA", ...signers.review },
    { title: "SUPERVISIÓN Y APROBACIÓN", ...signers.approval },
  ];

  signatureColumns.forEach((col, idx) => {
    const cx = marginX + idx * (colWidth + 4);

    // Título de columna
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(col.title, cx + colWidth / 2, currentY + 3, { align: "center" });

    // Línea de firma
    const lineY = currentY + 22;
    doc.setDrawColor(...TEXT_DARK);
    doc.setLineWidth(0.3);
    doc.line(cx + 4, lineY, cx + colWidth - 4, lineY);
    doc.setLineWidth(0.2);

    // Nombre y Cargo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_DARK);
    doc.text(col.name, cx + colWidth / 2, lineY + 4, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(col.role, cx + colWidth / 2, lineY + 7.5, { align: "center" });
    doc.text(col.date, cx + colWidth / 2, lineY + 11, { align: "center" });
  });

  currentY += 38;

  // Verificación digital
  doc.setFont("helvetica", "italic");
  doc.setFontSize(6);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(
    "Verificación digital: código QR enlazado al registro del certificado en el repositorio GESENER, que permite al cliente y a auditores validar autenticidad, revisión vigente y fecha de vencimiento.",
    marginX,
    currentY,
    { maxWidth: contentWidth }
  );

  drawFooter();

  // Abrir vista previa directa
  window.open(doc.output("bloburl"));
};