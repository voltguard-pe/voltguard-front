import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import warningLogo from "../../../public/warningIcon.png";

// Helper para cargar imágenes en base64 de manera asíncrona y segura
const loadBase64Img = (src: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve("");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve("");
  });
};

// Separador de valores y unidades para mantener consistencia con el componente React
const parseValUnit = (strValue: string | number | null | undefined, defaultUnit: string = "") => {
  if (strValue === undefined || strValue === null || strValue === "" || strValue === "-") {
    return { val: "-", unit: defaultUnit };
  }
  const str = String(strValue).trim();
  const match = str.match(/^([\d.,]+)\s*(.*)$/);
  if (match && match[1]) {
    return {
      val: match[1],
      unit: match[2] ? match[2] : defaultUnit,
    };
  }
  return { val: str, unit: defaultUnit };
};

export const generateNfpaPDF = async (
  boards: any | any[],
  _companyName: string,
  publicCode: string = "default"
) => {
  const items = Array.isArray(boards) ? boards : [boards];
  const validBoards = items.filter((b) => b.nfpa);

  if (validBoards.length === 0) {
    alert("Ninguno de los tableros seleccionados cuenta con parámetros NFPA 70E.");
    return;
  }

  // Pre-carga del logo de Voltguard
  const voltguardLogoBase64 = await loadBase64Img("/voltguard.png");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageStartX = 10;
  const pageWidth = 190; // Ancho amplio aprovechando márgenes

  for (let index = 0; index < validBoards.length; index++) {
    const board = validBoards[index];

    const isTopSlot = index % 2 === 0;
    if (index > 0 && isTopSlot) {
      doc.addPage();
    }

    const slotOffsetY = isTopSlot ? 8 : 150;

    // Línea divisoria de corte en el centro del A4
    if (isTopSlot) {
      doc.setDrawColor(203, 213, 225);
      doc.setLineDashPattern([2, 2], 0);
      doc.line(0, 148.5, 210, 148.5);
      doc.setLineDashPattern([], 0);
    }

    // ── 1. ENCABEZADO "PELIGRO" (GRADIENTE ROJO / SÓLIDO) ──
    doc.setFillColor(200, 16, 46); // #C8102E
    doc.rect(pageStartX, slotOffsetY, pageWidth, 18, "F");

    const logoSize = 12;
    const headerStartX = 105 - 32;

    if (warningLogo) {
      doc.addImage(warningLogo, "PNG", headerStartX, slotOffsetY + 3, logoSize, logoSize);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28); // Tipografía en grande como en la web (78px proporcionales)
    doc.text("PELIGRO", headerStartX + logoSize + 4, slotOffsetY + 12.5);

    // ── 2. FRANCIA NEGRA Y BADGE NORMA ──
    const darkHeaderY = slotOffsetY + 18;
    const darkHeaderHeight = 16;
    doc.setFillColor(15, 23, 42); // slate-900 (#0f172a)
    doc.rect(pageStartX, darkHeaderY, pageWidth, darkHeaderHeight, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(
      "RIESGO DE ARCO ELÉCTRICO Y ELECTROCUCIÓN PRESENTE",
      105,
      darkHeaderY + 5.8,
      { align: "center" }
    );

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("Se requiere EPP de acuerdo a categoría", 110, darkHeaderY + 12, { align: "right" });

    // Badge "NORMA NFPA 70E · 2027"
    const badgeX = 112;
    const badgeY = darkHeaderY + 8.5;
    const badgeW = 36;
    const badgeH = 5.2;
    doc.setFillColor(30, 41, 59); // slate-800
    doc.setDrawColor(71, 85, 105); // slate-600
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2.5, 2.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.8);
    doc.setTextColor(241, 245, 249);
    doc.text("NORMA NFPA 70E · 2027", badgeX + badgeW / 2, badgeY + 3.6, { align: "center" });

    // ── 3. CUERPO DE TARJETAS EN PARALELO ──
    const cardsY = darkHeaderY + darkHeaderHeight + 3.5;
    const cardColWidth = 93.5;
    const cardHeight = 38;

    // ──────────────── CARD IZQUIERDA: ARCO ELÉCTRICO ────────────────
    const leftCardX = pageStartX;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(leftCardX, cardsY, cardColWidth, cardHeight, 2, 2, "FD");

    // Indicador rojo lateral
    doc.setFillColor(200, 16, 46);
    doc.rect(leftCardX + 3, cardsY + 3, 1.5, 5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text("RIESGO DE ARCO ELÉCTRICO", leftCardX + 6.5, cardsY + 7);

    // Caja Categoría EPP (Rojo Destacado)
    const catBoxW = 24;
    const catBoxH = 24;
    const catBoxX = leftCardX + 3;
    const catBoxY = cardsY + 10.5;

    doc.setFillColor(200, 16, 46);
    doc.roundedRect(catBoxX, catBoxY, catBoxW, catBoxH, 2, 2, "F");

    doc.setFontSize(5.2);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(254, 226, 226);
    doc.text("CATEGORÍA EPP", catBoxX + catBoxW / 2, catBoxY + 4, { align: "center" });

    doc.setFontSize(48); // Número gigante como en el diseño React (92px)
    doc.setTextColor(255, 255, 255);
    doc.text(String(board.nfpa?.categoriaRiesgo ?? 1), catBoxX + catBoxW / 2, catBoxY + 18, { align: "center" });

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.8);
    doc.line(catBoxX + 5, catBoxY + 20, catBoxX + catBoxW - 5, catBoxY + 20);
    doc.setLineWidth(0.2);

    // Parseo de los 3 valores de Arco
    const parsedIncidente = parseValUnit(board.nfpa?.energiaIncidente, "cal/cm²");
    const parsedArco = parseValUnit(board.nfpa?.distanciaArco, "m");
    const parsedTrabajo = parseValUnit(board.nfpa?.distanciaTrabajo, "cm (18 in)");

    const rowXLabel = catBoxX + catBoxW + 4;
    const rowXValRight = leftCardX + cardColWidth - 3;

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);

    doc.setFontSize(6.2);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("ENERGÍA INCIDENTE", rowXLabel, cardsY + 14);
    doc.text("DISTANCIA DE ARCO", rowXLabel, cardsY + 22);
    doc.text("DISTANCIA DE TRABAJO", rowXLabel, cardsY + 30);

    // Filas con números agrandados
    let unitW = doc.getTextWidth(parsedIncidente.unit);
    doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
    doc.text(parsedIncidente.unit, rowXValRight, cardsY + 14, { align: "right" });
    doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
    doc.text(parsedIncidente.val, rowXValRight - (unitW > 0 ? unitW + 3.5 : 0), cardsY + 14, { align: "right" });

    doc.line(rowXLabel, cardsY + 17, rowXValRight, cardsY + 17);

    unitW = doc.getTextWidth(parsedArco.unit);
    doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
    doc.text(parsedArco.unit, rowXValRight - 0.5, cardsY + 22, { align: "right" });
    doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
    doc.text(parsedArco.val, rowXValRight - (unitW > 0 ? unitW + 0.5 : 0), cardsY + 22, { align: "right" });

    doc.line(rowXLabel, cardsY + 25, rowXValRight, cardsY + 25);

    unitW = doc.getTextWidth(parsedTrabajo.unit);
    doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
    doc.text(parsedTrabajo.unit, rowXValRight - 0.5, cardsY + 30, { align: "right" });
    doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
    doc.text(parsedTrabajo.val, rowXValRight - (unitW > 0 ? unitW - 5 : 0), cardsY + 30, { align: "right" });

    // ──────────────── CARD DERECHA: ELECTROCUCIÓN ────────────────
    const rightCardX = pageStartX + pageWidth - cardColWidth;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(rightCardX, cardsY, cardColWidth, cardHeight, 2, 2, "FD");

    // Indicador azul lateral
    doc.setFillColor(14, 165, 233); // sky-500
    doc.rect(rightCardX + 3, cardsY + 3, 1.5, 5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text("RIESGO DE ELECTROCUCIÓN", rightCardX + 6.5, cardsY + 7);

    // Caja Tensión Nominal
    const tensionBoxX = rightCardX + 3;
    const tensionBoxY = cardsY + 10.5;
    const tensionBoxW = 24;
    const tensionBoxH = 24;

    doc.setFillColor(15, 23, 42);
    doc.roundedRect(tensionBoxX, tensionBoxY, tensionBoxW, tensionBoxH, 2, 2, "F");

    doc.setFontSize(5.2);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184);
    doc.text("TENSIÓN NOMINAL", tensionBoxX + tensionBoxW / 2, tensionBoxY + 4, { align: "center" });

    doc.setFontSize(36);
    doc.setTextColor(255, 255, 255);
    doc.text(`${board.tensionNominal || 380}`, tensionBoxX + tensionBoxW / 2, tensionBoxY + 16.5, { align: "center" });

    doc.setFontSize(5.5);
    doc.setTextColor(148, 163, 184);
    doc.text("VOLTIOS CA", tensionBoxX + tensionBoxW / 2, tensionBoxY + 21.5, { align: "center" });

    // Filas Límites
    const parsedLimite = parseValUnit(board.nfpa?.limiteAproximacion, "m");
    const parsedRestringida = parseValUnit(board.nfpa?.distanciaRestringida, "m");

    const rRowXLabel = tensionBoxX + tensionBoxW + 4;
    const rRowXValRight = rightCardX + cardColWidth - 3;

    doc.setFontSize(6.2);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("LÍMITE DE APROXIMACIÓN", rRowXLabel, cardsY + 14);
    doc.text("DISTANCIA RESTRINGIDA", rRowXLabel, cardsY + 22);

    unitW = doc.getTextWidth(parsedLimite.unit);
    doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
    doc.text(parsedLimite.unit, rRowXValRight, cardsY + 14, { align: "right" });
    doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
    doc.text(parsedLimite.val, rRowXValRight - (unitW > 0 ? unitW + 1.5 : 0), cardsY + 14, { align: "right" });

    doc.line(rRowXLabel, cardsY + 17, rRowXValRight, cardsY + 17);

    unitW = doc.getTextWidth(parsedRestringida.unit);
    doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
    doc.text(parsedRestringida.unit, rRowXValRight, cardsY + 22, { align: "right" });
    doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
    doc.text(parsedRestringida.val, rRowXValRight - (unitW > 0 ? unitW - 0.5 : 0), cardsY + 22, { align: "right" });

    // Caja Guantes Dieléctricos
    const guantesX = rRowXLabel;
    const guantesY = cardsY + 26;
    const guantesW = rRowXValRight - rRowXLabel;
    const guantesH = 8.5;

    doc.setFillColor(254, 246, 224); // #FEF6E0
    doc.setDrawColor(240, 180, 41); // #F0B429
    doc.roundedRect(guantesX, guantesY, guantesW, guantesH, 1.5, 1.5, "FD");

    // Dibujo del icono Hand/Mano vectorial
    // doc.setFillColor(122, 78, 11);
    // doc.circle(guantesX + 3.5, guantesY + 5.5, 1.3, "F");

    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(122, 78, 11);
    doc.text("GUANTES DIELÉCTRICOS", guantesX + 2, guantesY + 3);

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(74, 48, 7);
    const guantesTexto = String(board.nfpa?.guantesClase || "No especificados");
    const guantesLines = doc.splitTextToSize(guantesTexto, guantesW - 5);
    doc.text(guantesLines, guantesX + 2, guantesY + 7);

    // ──────────────── CARD INFERIOR IZQ: EPP REQUERIDO ────────────────
    const eppBoxY = cardsY + cardHeight + 3.5;
    const eppBoxHeight = 44;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(leftCardX, eppBoxY, cardColWidth, eppBoxHeight, 2, 2, "FD");

    doc.setFillColor(200, 16, 46);
    doc.rect(leftCardX + 3, eppBoxY + 3, 1.5, 5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text("EPP REQUERIDO", leftCardX + 6.5, eppBoxY + 7);

    // Badge Mínimo
    const eppBadgeW = 24;
    const eppBadgeH = 5.2;
    const eppBadgeX = leftCardX + cardColWidth - eppBadgeW - 3;
    const eppBadgeY = eppBoxY + 3;

    doc.setFillColor(253, 236, 239);
    doc.setDrawColor(250, 200, 206);
    doc.roundedRect(eppBadgeX, eppBadgeY, eppBadgeW, eppBadgeH, 2, 2, "FD");

    doc.setFontSize(5.8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(155, 12, 34);
    const minValText = parsedIncidente.val !== "-" ? `${parsedIncidente.val} cal/cm²` : "4 cal/cm²";
    doc.text(`MÍNIMO ${minValText}`, eppBadgeX + eppBadgeW / 2, eppBadgeY + 3.6, { align: "center" });

    // Lista de ítems EPP con el ícono Shield dibujado
    const defaultEppItems = [
      "Casco de Seguridad de Polímero Tipo E con Careta Facial AR (Mín. 4 cal/cm²)",
      "Lentes de Seguridad de Policarbonato con protección UV",
      "Camisa de manga larga y pantalón de trabajo AR (Mínimo 4 cal/cm² a 8 cal/cm²)",
      "Guantes de Cuero para Trabajo Mecánico o Dieléctricos según corresponda",
      "Zapatos Dieléctricos de Seguridad con puntera de composite",
    ];

    const eppList = Array.isArray(board.nfpa?.eppRequerido) && board.nfpa.eppRequerido.length > 0
      ? board.nfpa.eppRequerido
      : defaultEppItems;

    let listY = eppBoxY + 14;

    eppList.forEach((itemText: string) => {
      // Círculo rosa de fondo para el icono Shield (de tu componente React)
      // doc.setFillColor(253, 236, 239);
      // doc.circle(leftCardX + 5, listY - 0.8, 2, "F");

      doc.setFillColor(30, 41, 59);
      doc.circle(leftCardX + 4.5, listY - 1, 0.6, "F");

      // Ícono de escudo vectorial rojo
      // doc.setDrawColor(155, 12, 34);
      // doc.setLineWidth(0.3);
      // doc.lines(
      //   [
      //     [1.6, 0],
      //     [0, 1.6],
      //     [-0.8, 1.0],
      //     [-0.8, -1.0],
      //     [0, -1.6],
      //   ],
      //   leftCardX + 4.2,
      //   listY - 1.8,
      //   [1, 1],
      //   "S",
      //   true
      // );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(30, 41, 59);

      const lines = doc.splitTextToSize(itemText, cardColWidth - 8);
      doc.text(lines, leftCardX + 7, listY);
      listY += lines.length * 3.8;
    });

    // ──────────────── CARD INFERIOR DER: ESCANEAR TABLERO (QR) ────────────────
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(rightCardX, eppBoxY, cardColWidth, eppBoxHeight, 2, 2, "FD");

    doc.setFillColor(14, 165, 233);
    doc.rect(rightCardX + 3, eppBoxY + 3, 1.5, 5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text("ESCANEAR TABLERO", rightCardX + 6.5, eppBoxY + 7);

    // Generar el código QR exactamente con la misma URL
    const qrOrigin = typeof window !== "undefined" ? window.location.origin : "https://voltguard.pe";
    const qrUrl = `${qrOrigin}/dashboard/boards/${publicCode}/${board.code || "default"}`;

    try {
      const qrBase64 = await QRCode.toDataURL(qrUrl, { margin: 1, errorCorrectionLevel: "H" });
      if (qrBase64) {
        // Renderizado del QR
        doc.addImage(qrBase64, "PNG", rightCardX + 3, eppBoxY + 12, 25, 25);

        // Logo flotante al centro del QR (como en tu JSX)
        if (voltguardLogoBase64) {
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(rightCardX + 13, eppBoxY + 22, 5, 5, 0.8, 0.8, "F");
          doc.addImage(voltguardLogoBase64, "PNG", rightCardX + 13.5, eppBoxY + 22.5, 4, 4);
        }
      }
    } catch (e) {
      console.error("Error al generar el QR:", e);
    }

    // Textos informativos
    const qrInfoX = rightCardX + 30;
    doc.setFontSize(6.2);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("ACCESO RÁPIDO", qrInfoX, eppBoxY + 14);

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    const qrDescLines = doc.splitTextToSize(
      "Datos técnicos, memoria de cálculo y curvas de protección del tablero.",
      cardColWidth - 33
    );
    doc.text(qrDescLines, qrInfoX, eppBoxY + 18.5);

    // Píldora URL
    const urlBoxY = eppBoxY + 28;
    const urlBoxW = cardColWidth - 33;
    const urlBoxH = 9;

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(qrInfoX, urlBoxY, urlBoxW, urlBoxH, 1.5, 1.5, "F");

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85);
    const displayUrl = qrUrl.replace(/^https?:\/\//, "");
    const splitUrl = doc.splitTextToSize(displayUrl, urlBoxW - 3);
    doc.text(splitUrl, qrInfoX + 1.5, urlBoxY + 3.5);

    // ── 4. PIE DE PÁGINA (ESTILO CONSOLA OSCURA) ──
    const footerY = eppBoxY + eppBoxHeight + 3.5;
    const footerHeight = 12;

    doc.setFillColor(11, 18, 32); // #0B1220
    doc.rect(pageStartX, footerY, pageWidth, footerHeight, "F");

    // Borde superior rojo
    doc.setFillColor(200, 16, 46);
    doc.rect(pageStartX, footerY, pageWidth, 0.8, "F");

    // Columna 1: Tablero
    doc.setFontSize(5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184);
    doc.text("TABLERO", pageStartX + 4, footerY + 4);

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(String(board?.name || "PRUEBA").toUpperCase(), pageStartX + 4, footerY + 8.8);

    // Columna 2: Creado por Voltguard
    doc.setFontSize(5);
    doc.setTextColor(148, 163, 184);
    doc.text("CREADO POR", 105, footerY + 4, { align: "center" });

    if (voltguardLogoBase64) {
      doc.addImage(voltguardLogoBase64, "PNG", 96, footerY + 6, 3.8, 3.8);
    }
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text("Voltguard", 101, footerY + 8.8);

    // Columna 3: Fecha
    const fecha = board?.createdAt ? new Date(board.createdAt).toLocaleDateString("es-ES") : "21/6/2026";
    doc.setFontSize(5);
    doc.setTextColor(148, 163, 184);
    doc.text("FECHA DE CÁLCULO", pageStartX + pageWidth - 4, footerY + 4, { align: "right" });

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(fecha, pageStartX + pageWidth - 4, footerY + 8.8, { align: "right" });
  }

  // Guardar archivo en descarga
  const safeCompanyName = _companyName ? _companyName.trim().replace(/\s+/g, "_") : "Empresa";
  doc.save(`NFPA70E_${safeCompanyName}_Voltguard.pdf`);
};