// utils/generatePDF.ts
import jsPDF from "jspdf";

export const generateBoardPDF = (board: any) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Ficha Técnica de Tablero", 20, 20);

  doc.setFontSize(12);

  doc.text(`Nombre: ${board.name}`, 20, 40);
  doc.text(`Tipo: ${board.type}`, 20, 50);
  doc.text(`Tensión nominal: ${board.tensionNominal} V`, 20, 60);
  doc.text(`Número de fases: ${board.numeroFases}`, 20, 70);
  doc.text(
    `Incluye neutro: ${board.incluyeNeutro ? "Sí" : "No"}`,
    20,
    80
  );
  doc.text(`Ubicación: ${board.location}`, 20, 90);
  doc.text(`Descripción: ${board.description}`, 20, 100);

  doc.save(`board-${board.name}.pdf`);
};