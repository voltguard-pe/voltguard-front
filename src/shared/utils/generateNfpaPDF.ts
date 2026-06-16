import { jsPDF } from "jspdf";
import warningLogo from "../../../public/warningIcon.png";

// Función auxiliar para pre-cargar el mini logo de Voltguard en Base64 para el PDF de manera segura
const loadBase64Img = (src: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
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

export const generateNfpaPDF = async (boards: any | any[]) => {
  const items = Array.isArray(boards) ? boards : [boards];
  const validBoards = items.filter((b) => b.nfpa);

  if (validBoards.length === 0) {
    alert("Ninguno de los tableros seleccionados cuenta con parámetros NFPA 70E.");
    return;
  }

  // Pre-cargamos el logo de Voltguard una sola vez antes de armar las páginas
  const voltguardLogoBase64 = await loadBase64Img("/voltguard.png");

  // ── HOJA COMPLETA EN FORMATO A4 VERTICAL ──
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageStartX = 15;
  const pageWidth = 180; // Ancho efectivo dentro de los márgenes

  // Procesamos los tableros de 2 en 2 para meterlos en la misma página
  for (let index = 0; index < validBoards.length; index++) {
    const board = validBoards[index];
    
    const isTopSlot = index % 2 === 0;
    if (index > 0 && isTopSlot) {
      doc.addPage();
    }

    const slotOffsetY = isTopSlot ? 15 : 152;

    // Linea sutil de corte o separación si es el elemento superior
    if (isTopSlot) {
      doc.setDrawColor(226, 232, 240);
      doc.setLineDashPattern([2, 2], 0); // Línea punteada
      doc.line(0, 148.5, 210, 148.5);  // Mitad exacta del A4
      doc.setLineDashPattern([], 0);     // Restaurar línea continua
    }

    // ── CABECERA ROJA COMPACTA ──
    doc.setFillColor(220, 38, 34); // #dc2626 (Rojo Danger)
    doc.rect(pageStartX, slotOffsetY, pageWidth, 20, "F");

    const logoWidth = 14;
    const logoHeight = 14;
    const textWidth = 46; 
    const spaceBetween = 4; 
    
    const totalHeaderContentWidth = logoWidth + spaceBetween + textWidth;
    const headerStartX = 105 - (totalHeaderContentWidth / 2);
    const logoY = slotOffsetY + 3; 

    if (warningLogo) {
      doc.addImage(warningLogo, "PNG", headerStartX, logoY, logoWidth, logoHeight);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28); 
    doc.text("PELIGRO", headerStartX + logoWidth + spaceBetween, slotOffsetY + 14);

    // Subtítulo centrado debajo de la cabecera roja
    doc.setTextColor(15, 23, 42); 
    doc.setFontSize(11.5);
    doc.setFont("helvetica", "bold");
    doc.text("RIESGO DE ARCO ELÉCTRICO Y ELECTROCUCIÓN PRESENTE", 105, slotOffsetY + 26, { align: "center" });
    
    // REUBICACIÓN DE LA NORMA: Posicionado en la cabecera técnica de la etiqueta
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105); 
    doc.text("Se requiere EPP de acuerdo a categoría  •  Norma NFPA 70E - 2024", 105, slotOffsetY + 31, { align: "center" });

    // Separador horizontal superior interno
    doc.setDrawColor(203, 213, 225); // Slate 300
    doc.line(pageStartX, slotOffsetY + 34, pageStartX + pageWidth, slotOffsetY + 34);

    // Coordenadas para las dos cards en paralelo
    const cardsY = slotOffsetY + 37;
    const cardColWidth = 87;
    const cardHeight = 44; 

    // ── CARD IZQUIERDA: RIESGO DE ARCO ELÉCTRICO ──
    const leftCardX = pageStartX;
    
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225); 
    doc.roundedRect(leftCardX, cardsY, cardColWidth, cardHeight, 2.5, 2.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5); 
    doc.setTextColor(15, 23, 42); 
    doc.text("RIESGO DE ARCO ELÉCTRICO", leftCardX + 4, cardsY + 5.5);

    doc.setFontSize(9); 
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105); 

    doc.text("Distancia de arco", leftCardX + 4, cardsY + 13);
    doc.text("Energía incidente", leftCardX + 4, cardsY + 18.5);
    doc.text("Distancia de trabajo", leftCardX + 4, cardsY + 24);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(String(board.nfpa.distanciaArco || "-"), leftCardX + cardColWidth - 4, cardsY + 13, { align: "right" });
    doc.text(String(board.nfpa.energiaIncidente || "-"), leftCardX + cardColWidth - 4, cardsY + 18.5, { align: "right" });
    doc.text(String(board.nfpa.distanciaTrabajo || "-"), leftCardX + cardColWidth - 4, cardsY + 24, { align: "right" });

    const catBoxY = cardsY + 28;
    doc.setFillColor(254, 242, 242); 
    doc.setDrawColor(254, 202, 202); 
    doc.roundedRect(leftCardX + 4, catBoxY, cardColWidth - 8, 12, 1.5, 1.5, "FD");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5); 
    doc.setTextColor(153, 27, 27); 
    doc.text("Categoría de riesgo", leftCardX + 7, catBoxY + 7.5);
    
    doc.setFontSize(24); 
    doc.setTextColor(220, 38, 34); 
    doc.text(String(board.nfpa.categoriaRiesgo || "-"), leftCardX + cardColWidth - 7, catBoxY + 9.5, { align: "right" });


    // ── CARD DERECHA: RIESGO DE ELECTROCUCIÓN ──
    const rightCardX = pageStartX + pageWidth - cardColWidth;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225); 
    doc.roundedRect(rightCardX, cardsY, cardColWidth, cardHeight, 2.5, 2.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5); 
    doc.setTextColor(15, 23, 42);
    doc.text("RIESGO DE ELECTROCUCIÓN", rightCardX + 4, cardsY + 5.5);

    doc.setFontSize(9); 
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);

    doc.text("Tensión", rightCardX + 4, cardsY + 13);
    doc.text("Límite de aproximación", rightCardX + 4, cardsY + 18.5);
    doc.text("Distancia restringida", rightCardX + 4, cardsY + 24);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(`${board.tensionNominal || 380} VCA`, rightCardX + cardColWidth - 4, cardsY + 13, { align: "right" });
    doc.text(String(board.nfpa.limiteAproximacion || "-"), rightCardX + cardColWidth - 4, cardsY + 18.5, { align: "right" });
    doc.text(String(board.nfpa.distanciaRestringida || "-"), rightCardX + cardColWidth - 4, cardsY + 24, { align: "right" });

    const guantesBoxY = cardsY + 28;
    doc.setFillColor(255, 251, 235); 
    doc.setDrawColor(252, 211, 77); 
    doc.roundedRect(rightCardX + 4, guantesBoxY, cardColWidth - 8, 12, 1.5, 1.5, "FD");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5); 
    doc.setTextColor(146, 64, 14); 
    doc.text("GUANTES", rightCardX + 7, guantesBoxY + 5);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5); 
    doc.setTextColor(15, 23, 42);
    doc.text(String(board.nfpa.guantesClase || "No especificado"), rightCardX + 7, guantesBoxY + 9);


    // ── CARD INFERIOR: EPP REQUERIDO ──
    const eppItems = board.nfpa.eppRequerido || [];
    const eppBoxY = cardsY + cardHeight + 5; 
    const maxTextWidth = pageWidth - 10; 

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9); 

    const formattedEppLines: string[] = [];
    eppItems.forEach((item: string) => {
      const splitLines = doc.splitTextToSize(`•  ${item}`, maxTextWidth);
      formattedEppLines.push(...splitLines);
    });

    const eppLineHeight = 4.8; 
    const dynamicEppHeight = Math.max(18, (formattedEppLines.length * eppLineHeight) + 10);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225); 
    doc.roundedRect(pageStartX, eppBoxY, pageWidth, dynamicEppHeight, 2.5, 2.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5); 
    doc.setTextColor(15, 23, 42);
    doc.text("EPP REQUERIDO", pageStartX + 5, eppBoxY + 6);

    let currentTextY = eppBoxY + 12;
    doc.setFontSize(9); 

    formattedEppLines.forEach((line) => {
      if (line.startsWith("•")) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(220, 38, 34); 
        doc.text("•", pageStartX + 5, currentTextY);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105); 
        doc.text(line.substring(1), pageStartX + 8, currentTextY);
      } else {
        doc.text(line, pageStartX + 8, currentTextY);
      }
      currentTextY += eppLineHeight;
    });

    // ── PIE DE PÁGINA REORGANIZADO EN 3 COLUMNAS SIMÉTRICAS ──
    const footerY = eppBoxY + dynamicEppHeight + 7;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5); 
    
    // 1. Columna Izquierda: Nombre del tablero
    doc.setTextColor(15, 23, 42); 
    doc.text(`Tablero: ${board.name}`, pageStartX, footerY);
    
    // 2. Columna Central: "Creado por: [Logo] Voltguard" (MÉTRICA AJUSTADA TOTALMENTE PEGADA)
    const textCreadoBy = "Creado por:"; // Quitamos el espacio del final
    const textBrand = "Voltguard";
    
    const widthCreadoBy = doc.getTextWidth(textCreadoBy); 
    const widthBrand = doc.getTextWidth(textBrand);       
    const miniLogoSize = 5.0; 
    const spaceGap = 1.0; // Reducimos el espacio a 1mm para que quede compacto y pegado
    
    const totalCenterBlockWidth = widthCreadoBy + spaceGap + miniLogoSize + spaceGap + widthBrand;
    const startCenterBlockX = 105 - (totalCenterBlockWidth / 2); // Eje central exacto (105mm)
    
    // Texto "Creado por:"
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139); 
    doc.text(textCreadoBy, startCenterBlockX, footerY);
    
    // Logotipo Voltguard
    if (voltguardLogoBase64) {
      const logoX = startCenterBlockX + widthCreadoBy + spaceGap;
      const logoOffsetY = footerY - 4.0; 
      doc.addImage(voltguardLogoBase64, "PNG", logoX, logoOffsetY, miniLogoSize, miniLogoSize);
    }
    
    // Texto "Voltguard"
    doc.setFont("helvetica", "bold");
    doc.setTextColor(7, 151, 213); 
    const brandX = startCenterBlockX + widthCreadoBy + spaceGap + miniLogoSize + spaceGap;
    doc.text(textBrand, brandX, footerY);
    
    // 3. Columna Derecha: Fecha de cálculo original (Alineado a la derecha)
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139); 
    const fecha = board.createdAt ? new Date(board.createdAt).toLocaleDateString('es-ES') : '01/01/2026';
    doc.text(`Fecha de cálculo: ${fecha}`, pageStartX + pageWidth, footerY, { align: "right" });
  }

  doc.save(`NFPA70E_Dual_A4_${new Date().getTime()}.pdf`);
};