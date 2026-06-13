import { jsPDF } from "jspdf";
// Importa o define tu logo aquí (puede ser un Base64 o la ruta de tus assets que use tu bundler)
// import nfpa70eLogo from "@/assets/nfpa70e.png"; 
import nfpa70eLogo from "../../../public/nfpa70e.png"

export const generateNfpaPDF = (boards: any | any[]) => {
  const items = Array.isArray(boards) ? boards : [boards];
  const validBoards = items.filter((b) => b.nfpa);

  if (validBoards.length === 0) {
    alert("Ninguno de los tableros seleccionados cuenta con parámetros NFPA 70E.");
    return;
  }

  // ── HOJA COMPLETA EN FORMATO A4 VERTICAL ──
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageStartX = 15;
  const pageWidth = 180; // Ancho efectivo dentro de los márgenes

  // Procesamos los tableros de 2 en 2 para meterlos en la misma página
  validBoards.forEach((board, index) => {
    // Si es un índice impar, significa que es el segundo tablero de la página actual.
    // Si es par y mayor a 0, creamos una nueva hoja A4 para la siguiente pareja.
    const isTopSlot = index % 2 === 0;
    if (index > 0 && isTopSlot) {
      doc.addPage();
    }

    // Calcular el desplazamiento Vertical (Y) dinámico según la posición (Arriba o Abajo)
    // El slot superior arranca en Y=15, el inferior en Y=152 (dejando espacio y margen intermedio)
    const slotOffsetY = isTopSlot ? 15 : 152;

    // Linea sutil de corte o separación si es el elemento superior para guiar la tijera/guillotina
    if (isTopSlot) {
      doc.setDrawColor(226, 232, 240);
      doc.setLineDashPattern([2, 2], 0); // Línea punteada
      doc.line(0, 148.5, 210, 148.5);  // Mitad exacta del A4
      doc.setLineDashPattern([], 0);     // Restaurar línea continua
    }

    // ── CABECERA ROJA COMPACTA ──
    doc.setFillColor(220, 38, 34); // #dc2626 (Rojo Danger)
    doc.rect(pageStartX, slotOffsetY, pageWidth, 20, "F");

    // Dimensiones del logo y cálculo para centrar el bloque (Logo + Texto)
    const logoWidth = 14;
    const logoHeight = 14;
    const textWidth = 46; // Ancho aproximado del texto "PELIGRO" en font 28
    const spaceBetween = 4; // Espacio entre el logo y el texto
    
    const totalHeaderContentWidth = logoWidth + spaceBetween + textWidth;
    // Centro del rectángulo rojo es 105mm (mitad de un A4 de 210mm)
    const headerStartX = 105 - (totalHeaderContentWidth / 2);
    
    // Centrado vertical dentro de los 20mm de la cabecera (slotOffsetY + 3)
    const logoY = slotOffsetY + 3; 

    // Insertar el logo al costado izquierdo de "PELIGRO"
    if (nfpa70eLogo) {
      doc.addImage(nfpa70eLogo, "PNG", headerStartX, logoY, logoWidth, logoHeight);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28); 
    // Colocamos el texto justo después del logo + el espacio configurado
    doc.text("PELIGRO", headerStartX + logoWidth + spaceBetween, slotOffsetY + 14);

    // Subtítulo centrado debajo de la cabecera roja (Agrandado a 11.5)
    doc.setTextColor(15, 23, 42); 
    doc.setFontSize(11.5);
    doc.setFont("helvetica", "bold");
    doc.text("RIESGO DE ARCO ELÉCTRICO Y ELECTROCUCIÓN PRESENTE", 105, slotOffsetY + 26, { align: "center" });
    
    // Agrandado a 9.5
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139); 
    doc.text(`Tablero: ${board.name} (${board.boardCode || "-"})`, 105, slotOffsetY + 31, { align: "center" });

    // Separador horizontal superior interno
    doc.setDrawColor(203, 213, 225); // Slate 300
    doc.line(pageStartX, slotOffsetY + 34, pageStartX + pageWidth, slotOffsetY + 34);

    // Coordenadas para las dos cards en paralelo
    const cardsY = slotOffsetY + 37;
    const cardColWidth = 87;
    const cardHeight = 44; // Altura reducida proporcionalmente para optimizar espacio

    // ── CARD IZQUIERDA: RIESGO DE ARCO ELÉCTRICO ──
    const leftCardX = pageStartX;
    
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225); // Slate 300
    doc.roundedRect(leftCardX, cardsY, cardColWidth, cardHeight, 2.5, 2.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5); // Agrandado a 10.5
    doc.setTextColor(15, 23, 42); 
    doc.text("RIESGO DE ARCO ELÉCTRICO", leftCardX + 4, cardsY + 5.5);

    doc.setFontSize(9); // Agrandado a 9
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
    doc.setFontSize(8.5); // Agrandado a 8.5
    doc.setTextColor(153, 27, 27); 
    doc.text("Categoría de riesgo", leftCardX + 7, catBoxY + 7.5);
    
    doc.setFontSize(24); // Agrandado a 24
    doc.setTextColor(220, 38, 34); 
    doc.text(String(board.nfpa.categoriaRiesgo || "-"), leftCardX + cardColWidth - 7, catBoxY + 9.5, { align: "right" });


    // ── CARD DERECHA: RIESGO DE ELECTROCUCIÓN ──
    const rightCardX = pageStartX + pageWidth - cardColWidth;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225); 
    doc.roundedRect(rightCardX, cardsY, cardColWidth, cardHeight, 2.5, 2.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5); // Agrandado a 10.5
    doc.setTextColor(15, 23, 42);
    doc.text("RIESGO DE ELECTROCUCIÓN", rightCardX + 4, cardsY + 5.5);

    doc.setFontSize(9); // Agrandado a 9
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
    doc.setFontSize(8.5); // Agrandado a 8.5
    doc.setTextColor(146, 64, 14); 
    doc.text("GUANTES", rightCardX + 7, guantesBoxY + 5);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5); // Agrandado a 8.5
    doc.setTextColor(15, 23, 42);
    doc.text(String(board.nfpa.guantesClase || "No especificado"), rightCardX + 7, guantesBoxY + 9);


    // ── CARD INFERIOR: EPP REQUERIDO ──
    const eppItems = board.nfpa.eppRequerido || [];
    const eppBoxY = cardsY + cardHeight + 5; 
    const maxTextWidth = pageWidth - 10; 

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9); // Agrandado a 9

    const formattedEppLines: string[] = [];
    eppItems.forEach((item: string) => {
      const splitLines = doc.splitTextToSize(`•  ${item}`, maxTextWidth);
      formattedEppLines.push(...splitLines);
    });

    const eppLineHeight = 4.8; // Ajustado proporcionalmente al tamaño del texto
    // Forzamos un alto dinámico pero con un límite controlado para evitar desbordar el espacio asignado por etiqueta
    const dynamicEppHeight = Math.max(18, (formattedEppLines.length * eppLineHeight) + 10);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225); 
    doc.roundedRect(pageStartX, eppBoxY, pageWidth, dynamicEppHeight, 2.5, 2.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5); // Agrandado a 10.5
    doc.setTextColor(15, 23, 42);
    doc.text("EPP REQUERIDO", pageStartX + 5, eppBoxY + 6);

    let currentTextY = eppBoxY + 12;
    doc.setFontSize(9); // Agrandado a 9

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

    // ── PIE DE PÁGINA ACOMODADO POR ELEMENTO ──
    const footerY = eppBoxY + dynamicEppHeight + 6;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate 400
    
    // Izquierda: Nombre del tablero
    doc.text(`Tablero: ${board.name}`, pageStartX, footerY);
    
    // Centro: Voltguard y NFPA70E
    doc.text("Voltguard | NFPA 70E", 105, footerY, { align: "center" });
    
    // Derecha: Fecha de cálculo original
    const fecha = board.createdAt ? new Date(board.createdAt).toLocaleDateString('es-ES') : '01/01/2026';
    doc.text(`Fecha: ${fecha}`, pageStartX + pageWidth, footerY, { align: "right" });
  });

  doc.save(`NFPA70E_Dual_A4_${new Date().getTime()}.pdf`);
};