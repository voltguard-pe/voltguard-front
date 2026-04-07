import jsPDF from "jspdf";
import type { PublicBoardByCodeResponseDTO } from "../types/BoardProps";

export const generateBoardPDF = async (
  board: PublicBoardByCodeResponseDTO
) => {
  const doc = new jsPDF();

  // =========================
  // 🏢 PORTADA
  // =========================

  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, 210, 297, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("VOLTGUARD", 105, 100, { align: "center" });

  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text("Reporte de tablero eléctrico", 105, 115, { align: "center" });

  doc.setFontSize(12);
  doc.text(`Empresa: ${board.company?.name || "N/A"}`, 105, 140, { align: "center" });

  doc.setFontSize(12);
  doc.text(`Tablero: ${board.name}`, 105, 150, { align: "center" });

  doc.text(
    `Fecha: ${new Date().toLocaleDateString()}`,
    105,
    160,
    { align: "center" }
  );

  // nueva página
  doc.addPage();

  let y = 20;

  // =========================
  // 🏢 HEADER
  // =========================
  doc.setFillColor(30, 64, 175); // azul
  doc.rect(0, 0, 210, 25, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  // doc.text("REPORTE DE TABLERO ELÉCTRICO", 14, 15);
  doc.text("VOLTGUARD", 14, 15);

  doc.setFontSize(10);
  // doc.text(`Código: ${board.code}`, 150, 15);
  doc.text("REPORTE DE TABLERO ELÉCTRICO", 140, 15);

  // reset color
  doc.setTextColor(0, 0, 0);

  y = 35;

  // =========================
  // 📌 TÍTULO
  // =========================
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(board.name, 14, y);

  y += 10;

  // =========================
  // 📋 DATOS GENERALES (BOX)
  // =========================
  doc.setDrawColor(200);
  doc.rect(14, y, 182, 40);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  const xLeft = 18;
  const xRight = 110;
  let yBox = y + 8;

  doc.text(`Tipo: ${board.type}`, xLeft, yBox);
  doc.text(`Tensión: ${board.tensionNominal} V`, xRight, yBox);

  yBox += 10;

  doc.text(`Fases: ${board.numeroFases}`, xLeft, yBox);
  doc.text(
    `Neutro: ${board.incluyeNeutro ? "Sí" : "No"}`,
    xRight,
    yBox
  );

  yBox += 10;

  doc.text(`Ubicación: ${board.location || "N/A"}`, xLeft, yBox);

  y += 50;

  // =========================
  // 📝 DESCRIPCIÓN
  // =========================
  doc.setFont("helvetica", "bold");
  doc.text("Descripción", 14, y);

  y += 6;

  doc.setFont("helvetica", "normal");

  const splitDesc = doc.splitTextToSize(
    board.description || "Sin descripción",
    180
  );

  doc.text(splitDesc, 14, y);

  y += splitDesc.length * 6 + 10;

  // =========================
  // 🖼️ IMÁGENES
  // =========================
  if (board.images?.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Evidencias fotográficas", 14, y);
    y += 10;

    const pageWidth = 210;
    const margin = 14;
    const gap = 6;

    const imgWidth = (pageWidth - margin * 2 - gap) / 2;

    let x = margin;
    let rowMaxHeight = 0;

    for (let i = 0; i < board.images.length; i++) {
      const imgUrl = board.images[i];

      // const res = await fetch(imgUrl);
      const res = await fetch(
        imgUrl.replace("/upload/", "/upload/w_1200/")
      );
      const blob = await res.blob();

      const reader = new FileReader();

      await new Promise<void>((resolve) => {
        reader.onloadend = () => {
          const imgData = reader.result as string;

          const img = new Image();
          img.src = imgData;

          img.onload = () => {
            const ratio = img.width / img.height;
            const imgHeight = imgWidth / ratio;

            // 🔥 salto de página
            if (y + imgHeight + 10 > 280) {
              doc.addPage();
              y = 20;
              x = margin;
            }

            // 🏷️ TÍTULO (AQUÍ VA)
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text(`Imagen ${i + 1}`, x, y - 2);

            // 🧱 BORDE / FONDO (AQUÍ VA)
            doc.setDrawColor(220);
            doc.rect(x - 1, y - 1, imgWidth + 2, imgHeight + 2);

            // 🖼️ IMAGEN
            doc.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);

            rowMaxHeight = Math.max(rowMaxHeight, imgHeight);

            // mover posición
            if (x === margin) {
              x += imgWidth + gap;
            } else {
              x = margin;
              y += rowMaxHeight + gap + 6;
              rowMaxHeight = 0;
            }

            resolve();
          };
        };

        reader.readAsDataURL(blob);
      });
    }

    y += 10;
  }

  // =========================
  // 📅 FOOTER
  // =========================
  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setFontSize(9);
    doc.setTextColor(150);

    doc.text(
      `Generado el ${new Date().toLocaleDateString()}`,
      14,
      290
    );

    doc.text(`Página ${i} de ${pageCount}`, 170, 290);
  }

  // =========================
  // 🚀 ABRIR PDF
  // =========================
  window.open(doc.output("bloburl"));
};