import { jsPDF } from "jspdf";

const generateQrBase64 = (url: string): Promise<string> => {
  return new Promise((resolve) => {
    const qrSize = 300;
    const canvas = document.createElement("canvas");
    canvas.width = qrSize;
    canvas.height = qrSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return resolve("");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&ecc=H`;

    img.onload = () => {
      ctx.drawImage(img, 0, 0, qrSize, qrSize);

      // Contenedor blanco para el logo en el centro
      const logoSize = 64;
      const logoX = (qrSize - logoSize) / 2;
      const logoY = (qrSize - logoSize) / 2;

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(logoX, logoY, logoSize, logoSize, 10);
      } else {
        ctx.rect(logoX, logoY, logoSize, logoSize);
      }
      ctx.fill();

      const logoImg = new Image();
      logoImg.src = "/voltguard.png";
      logoImg.onload = () => {
        ctx.drawImage(logoImg, logoX + 6, logoY + 6, logoSize - 12, logoSize - 12);
        resolve(canvas.toDataURL("image/png"));
      };
      logoImg.onerror = () => {
        resolve(canvas.toDataURL("image/png"));
      };
    };
    img.onerror = () => resolve("");
  });
};

export const generateQrPdf = async (boards: any[], companyName: string, effectivePublicCode: string) => {
  if (!boards || boards.length === 0) {
    alert("No hay tableros seleccionados.");
    return;
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Configuración de cuadrícula balanceada (8 etiquetas por hoja A4)
  const marginX = 20;       // Margen izquierdo de la hoja
  const marginY = 15;       // Margen superior de la hoja
  const cardWidth = 80;     // Ancho del bloque de cada etiqueta
  const cardHeight = 62;    // Alto del bloque de cada etiqueta
  const gapX = 10;          // Espacio entre las 2 columnas
  const gapY = 8;           // Espacio entre las 4 filas
  
  const maxCols = 2;
  const maxRows = 4;
  const itemsPerPage = maxCols * maxRows;

  for (let index = 0; index < boards.length; index++) {
    const board = boards[index];

    if (index > 0 && index % itemsPerPage === 0) {
      doc.addPage();
    }

    const pageIndex = index % itemsPerPage;
    const col = pageIndex % maxCols;
    const row = Math.floor(pageIndex / maxCols);

    const x = marginX + col * (cardWidth + gapX);
    const y = marginY + row * (cardHeight + gapY);

    // Calculamos el centro horizontal dinámico para esta columna de etiqueta
    const centerX = x + (cardWidth / 2);

    // ── TEXTOS SUPERIORES (TODOS CENTRADOS HORIZONTALMENTE) ──
    
    // 1. Nombre de la Empresa
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(companyName.toUpperCase(), centerX, y + 5, { align: "center" });

    // 2. Nombre del Tablero
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(String(board.name).toUpperCase(), centerX, y + 10, { align: "center" });

    // 3. Código ID del Tablero
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105); // Slate 600
    doc.text(`ID: ${board.boardCode || "-"}`, centerX, y + 14.5, { align: "center" });

    // ── CÓDIGO QR ABAJO (CENTRADO RESPECTO A LA ETIQUETA) ──
    const boardUrl = `${window.location.origin}/dashboard/boards/${effectivePublicCode}/${board.code}`;
    
    try {
      const qrSize = 38; 
      const qrX = x + (cardWidth - qrSize) / 2; // Centrado exacto del QR
      const qrY = y + 17.5;

      const qrBase64 = await generateQrBase64(boardUrl);
      if (qrBase64) {
        doc.addImage(qrBase64, "PNG", qrX, qrY, qrSize, qrSize);
      }
    } catch (err) {
      console.error("Error al renderizar QR centrado:", err);
    }

    // ── PIE DE ETIQUETA CENTRADA: VOLTGUARD ──
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(7, 151, 213); // Celeste Voltguard
    doc.text("VOLTGUARD - SISTEMA DE GESTIÓN", centerX, y + 59, { align: "center" });
  }

  doc.save(`QRs_Centrados_Tableros_${new Date().getTime()}.pdf`);
};