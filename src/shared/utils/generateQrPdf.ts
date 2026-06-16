// import { jsPDF } from "jspdf";

// const generateQrBase64 = (url: string): Promise<string> => {
//   return new Promise((resolve) => {
//     const qrSize = 300;
//     const canvas = document.createElement("canvas");
//     canvas.width = qrSize;
//     canvas.height = qrSize;
//     const ctx = canvas.getContext("2d");
//     if (!ctx) return resolve("");

//     const img = new Image();
//     img.crossOrigin = "anonymous";
//     img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&ecc=H`;

//     img.onload = () => {
//       ctx.drawImage(img, 0, 0, qrSize, qrSize);

//       // Contenedor blanco para el logo en el centro
//       const logoSize = 64;
//       const logoX = (qrSize - logoSize) / 2;
//       const logoY = (qrSize - logoSize) / 2;

//       ctx.fillStyle = "#ffffff";
//       ctx.beginPath();
//       if (ctx.roundRect) {
//         ctx.roundRect(logoX, logoY, logoSize, logoSize, 10);
//       } else {
//         ctx.rect(logoX, logoY, logoSize, logoSize);
//       }
//       ctx.fill();

//       const logoImg = new Image();
//       logoImg.src = "/voltguard.png";
//       logoImg.onload = () => {
//         ctx.drawImage(logoImg, logoX + 6, logoY + 6, logoSize - 12, logoSize - 12);
//         resolve(canvas.toDataURL("image/png"));
//       };
//       logoImg.onerror = () => {
//         resolve(canvas.toDataURL("image/png"));
//       };
//     };
//     img.onerror = () => resolve("");
//   });
// };

// export const generateQrPdf = async (boards: any[], companyName: string, effectivePublicCode: string) => {
//   if (!boards || boards.length === 0) {
//     alert("No hay tableros seleccionados.");
//     return;
//   }

//   const doc = new jsPDF({
//     orientation: "portrait",
//     unit: "mm",
//     format: "a4",
//   });

//   // Configuración de cuadrícula balanceada (8 etiquetas por hoja A4)
//   const marginX = 20;       // Margen izquierdo de la hoja
//   const marginY = 15;       // Margen superior de la hoja
//   const cardWidth = 80;     // Ancho del bloque de cada etiqueta
//   const cardHeight = 62;    // Alto del bloque de cada etiqueta
//   const gapX = 10;          // Espacio entre las 2 columnas
//   const gapY = 8;           // Espacio entre las 4 filas
  
//   const maxCols = 2;
//   const maxRows = 4;
//   const itemsPerPage = maxCols * maxRows;

//   for (let index = 0; index < boards.length; index++) {
//     const board = boards[index];

//     if (index > 0 && index % itemsPerPage === 0) {
//       doc.addPage();
//     }

//     const pageIndex = index % itemsPerPage;
//     const col = pageIndex % maxCols;
//     const row = Math.floor(pageIndex / maxCols);

//     const x = marginX + col * (cardWidth + gapX);
//     const y = marginY + row * (cardHeight + gapY);

//     // Calculamos el centro horizontal dinámico para esta columna de etiqueta
//     const centerX = x + (cardWidth / 2);

//     // ── TEXTOS SUPERIORES (TODOS CENTRADOS HORIZONTALMENTE) ──
    
//     // 1. Nombre de la Empresa
//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(8);
//     doc.setTextColor(100, 116, 139); // Slate 500
//     doc.text(companyName.toUpperCase(), centerX, y + 5, { align: "center" });

//     // 2. Nombre del Tablero
//     doc.setTextColor(15, 23, 42); // Slate 900
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(11);
//     doc.text(String(board.name).toUpperCase(), centerX, y + 10, { align: "center" });

//     // 3. Código ID del Tablero
//     doc.setFont("helvetica", "normal");
//     doc.setFontSize(8.5);
//     doc.setTextColor(71, 85, 105); // Slate 600
//     doc.text(`ID: ${board.boardCode || "-"}`, centerX, y + 14.5, { align: "center" });

//     // ── CÓDIGO QR ABAJO (CENTRADO RESPECTO A LA ETIQUETA) ──
//     const boardUrl = `${window.location.origin}/dashboard/boards/${effectivePublicCode}/${board.code}`;
    
//     try {
//       const qrSize = 38; 
//       const qrX = x + (cardWidth - qrSize) / 2; // Centrado exacto del QR
//       const qrY = y + 17.5;

//       const qrBase64 = await generateQrBase64(boardUrl);
//       if (qrBase64) {
//         doc.addImage(qrBase64, "PNG", qrX, qrY, qrSize, qrSize);
//       }
//     } catch (err) {
//       console.error("Error al renderizar QR centrado:", err);
//     }

//     // ── PIE DE ETIQUETA CENTRADA: VOLTGUARD ──
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(7.5);
//     doc.setTextColor(7, 151, 213); // Celeste Voltguard
//     doc.text("VOLTGUARD - SISTEMA DE GESTIÓN", centerX, y + 59, { align: "center" });
//   }

//   doc.save(`QRs_Centrados_Tableros_${new Date().getTime()}.pdf`);
// };









import { jsPDF } from "jspdf";

// Función auxiliar para generar el código QR en base64
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
      // Dibuja el código QR puro sin parches blancos ni logos encima
      ctx.drawImage(img, 0, 0, qrSize, qrSize);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve("");
  });
};

// Función auxiliar para pre-cargar el logo lateral izquierdo de manera asíncrona
const preloadLogoImage = (src: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
};

export const generateQrPdf = async (boards: any[], _companyName: string, effectivePublicCode: string) => {
  if (!boards || boards.length === 0) {
    alert("No hay tableros seleccionados.");
    return;
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Configuración de cuadrícula balanceada (8 etiquetas por hoja A4) sin bordes
  const marginX = 15;       // Margen izquierdo de la hoja para dar más espacio horizontal
  const marginY = 15;       // Margen superior de la hoja
  const cardWidth = 85;     // Ampliado a 85mm para dos bloques perfectos de ~40-42mm
  const cardHeight = 62;    // Alto del bloque de cada etiqueta
  const gapX = 10;          // Espacio entre las 2 columnas
  const gapY = 8;           // Espacio entre las 4 filas
  
  const maxCols = 2;
  const maxRows = 4;
  const itemsPerPage = maxCols * maxRows;

  // Pre-cargamos el logo una sola vez para optimizar rendimiento de renderizado
  const voltguardLogoImg = await preloadLogoImage("/voltguard.png");

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

    // Dimensiones idénticas para ambos lados (Simetría total)
    const elementSize = 42; 
    const verticalPadding = (cardHeight - elementSize) / 2; // Centrado vertical exacto para ambos

    // ── LADO IZQUIERDO: LOGO GRANDE Y NOMBRE CENTRADO ──
    const leftBlockWidth = cardWidth / 2;
    const leftCenterX = x + (leftBlockWidth / 2); // Centro horizontal de la mitad izquierda
    const logoY = y + verticalPadding;

    // 1. Dibujar el Logo grande de Voltguard (Tamaño proporcional al QR)
    if (voltguardLogoImg) {
      const logoSize = 28; // Logo grande destacado
      const logoX = leftCenterX - (logoSize / 2); // Centrado horizontal estricto
      doc.addImage(voltguardLogoImg, "PNG", logoX, logoY + 2, logoSize, logoSize);
    }

    // 2. Nombre "VOLTGUARD" centrado justo debajo de su logo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11); // Fuente más grande y clara
    doc.setTextColor(7, 151, 213); // Celeste corporativo Voltguard
    doc.text("VOLTGUARD", leftCenterX, logoY + 38, { align: "center" });


    // ── LADO DERECHO: CÓDIGO QR IDÉNTICO EN TAMAÑO ──
    const boardUrl = `${window.location.origin}/dashboard/boards/${effectivePublicCode}/${board.code}`;
    
    try {
      const qrX = x + cardWidth - elementSize - 2; 
      const qrY = y + verticalPadding;

      const qrBase64 = await generateQrBase64(boardUrl);
      if (qrBase64) {
        doc.addImage(qrBase64, "PNG", qrX, qrY, elementSize, elementSize);
      }
    } catch (err) {
      console.error("Error al renderizar QR en lado derecho:", err);
    }
  }

  doc.save(`QRs_Simetricos_Voltguard_${new Date().getTime()}.pdf`);
};