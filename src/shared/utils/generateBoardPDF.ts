import jsPDF from "jspdf";
import type { PublicCompanyBoardsItemDTO } from "../types/BoardProps";

export const generateBoardPDF = async (
  board: PublicCompanyBoardsItemDTO
) => {
  const doc = new jsPDF();

  let y = 20;

  // =========================
  // 🏢 HEADER
  // =========================
  doc.setFillColor(30, 64, 175); // azul
  doc.rect(0, 0, 210, 25, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  // doc.text("REPORTE DE TABLERO ELÉCTRICO", 14, 15);
  doc.text("GESENER", 14, 15);

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
    doc.text("Evidencias fotográficas", 14, y);
    y += 10;

    for (let i = 0; i < board.images.length; i++) {
      const imgUrl = board.images[i];

      const res = await fetch(imgUrl);
      const blob = await res.blob();

      const reader = new FileReader();

      await new Promise<void>((resolve) => {
        reader.onloadend = () => {
          // salto de página si se llena
          if (y > 250) {
            doc.addPage();
            y = 20;
          }

          doc.addImage(reader.result as string, "JPEG", 14, y, 80, 60);
          y += 70;

          resolve();
        };
        reader.readAsDataURL(blob);
      });
    }
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