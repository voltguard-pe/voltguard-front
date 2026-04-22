import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { PublicBoardByCodeResponseDTO } from "../types/BoardProps";

export const generateBoardPDF = async (
  board: PublicBoardByCodeResponseDTO
) => {
  const doc = new jsPDF({ format: "a4" });

  // =========================
  // HEADER
  // =========================
  const drawHeader = () => {
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 25, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("VOLTGUARD", 14, 15);

    doc.setFontSize(10);
    doc.text("REPORTE DE TABLERO ELÉCTRICO", 120, 15);

    doc.setTextColor(0, 0, 0);
  };

  // =========================
  // INFO GENERAL
  // =========================
  const drawGeneralInfo = () => {
    let y = 35;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(board.name || "Sin nombre", 14, y);

    y += 10;

    doc.rect(14, y, 182, 60);

    let yBox = y + 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    doc.text(`Tipo: ${board.type}`, 18, yBox);
    doc.text(`Tensión: ${board.tensionNominal} V`, 110, yBox);

    yBox += 10;

    doc.text(`Fases: ${board.numeroFases}`, 18, yBox);
    doc.text(`Neutro: ${board.incluyeNeutro ? "Sí" : "No"}`, 110, yBox);

    yBox += 10;

    doc.text(`Sistema: ${board.sistema}`, 18, yBox);
    doc.text(`Estado: ${board.estadoGeneral}`, 110, yBox);

    yBox += 10;

    doc.text(`Ubicación: ${board.location || "-"}`, 18, yBox);

    y += 75;

    doc.setFont("helvetica", "bold");
    doc.text("Descripción", 14, y);

    y += 6;

    doc.setFont("helvetica", "normal");

    const split = doc.splitTextToSize(board.description || "-", 180);
    doc.text(split, 14, y);

    return y + split.length * 6 + 10;
  };

  // =========================
  // LOAD IMAGE
  // =========================
  const loadImage = async (url: string) => {
    const res = await fetch(url.replace("/upload/", "/upload/w_1200/"));
    const blob = await res.blob();

    return new Promise<{ data: string; img: HTMLImageElement }>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () =>
          resolve({ data: reader.result as string, img });
      };
      reader.readAsDataURL(blob);
    });
  };

  const getDim = (img: HTMLImageElement, maxW = 182, maxH = 120) => {
    const ratio = img.width / img.height;
    let w = maxW;
    let h = w / ratio;

    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }

    return { w, h };
  };

  // =========================
  // 📄 PÁGINA 1 → GENERAL + UNIFILAR
  // =========================
  if (board.images?.unifilar?.[0]) {
    drawHeader();

    let y = drawGeneralInfo();

    const { data, img } = await loadImage(board.images.unifilar[0]);
    const dim = getDim(img);

    const x = (210 - dim.w) / 2;

    doc.text("Diagrama unifilar", 14, y);
    doc.addImage(data, "JPEG", x, y + 5, dim.w, dim.h);
  }

  // =========================
  // 📄 PÁGINA 2 → CIRCUITOS
  // =========================
  if (board.circuits?.length) {
    doc.addPage();
    drawHeader();

    doc.setFont("helvetica", "bold");
    doc.text("Circuitos", 14, 35);

    autoTable(doc, {
      startY: 45,
      // head: [["Circuito", "Descripción", "Estado", "Amperaje"]],
      head: [["Circuito", "Descripción"]],
      body: board.circuits.map((c) => [
        c.circuito || "-",
        c.descripcion || "-",
        // c.estado || "-",
        // c.amperaje || "-",
      ]),
      margin: { left: 14, right: 14 },
      styles: { fontSize: 10 },
      headStyles: { fillColor: [30, 64, 175] },
    });
  }

  // =========================
  // 📄 PÁGINA 3 → PROTECCIÓN + IMÁGENES
  // =========================
  if (board.images?.tablero?.[0] || board.images?.termografia?.[0]) {
    doc.addPage();
    drawHeader();

    let y = 35;

    // MAIN BREAKER
    if (board.mainBreaker) {
      doc.setFont("helvetica", "bold");
      doc.text("Main Breaker", 14, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.text(`Amperaje: ${board.mainBreaker.amperaje} A`, 14, y);
      doc.text(`Polos: ${board.mainBreaker.polos}`, 90, y);

      y += 6;

      doc.text(`Marca: ${board.mainBreaker.marca}`, 14, y);
      doc.text(`Modelo: ${board.mainBreaker.modelo}`, 90, y);

      y += 10;
    }

    // PROTECCIÓN
    if (board.proteccion) {
      doc.setFont("helvetica", "bold");
      doc.text("Protección", 14, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.text(
        `Sobretensión: ${board.proteccion.sobretension ? "Sí" : "No"}`,
        14,
        y
      );

      y += 10;
    }

    // IMÁGENES
    doc.text("Tablero / Termografía", 14, y);

    const yImg = y + 10;

    if (board.images?.tablero?.[0]) {
      const { data, img } = await loadImage(board.images.tablero[0]);
      const dim = getDim(img, 85, 110);
      doc.addImage(data, "JPEG", 14, yImg, dim.w, dim.h);
    }

    if (board.images?.termografia?.[0]) {
      const { data, img } = await loadImage(board.images.termografia[0]);
      const dim = getDim(img, 85, 110);
      doc.addImage(data, "JPEG", 110, yImg, dim.w, dim.h);
    }
  }

  // =========================
  // FOOTER
  // =========================
  const pages = doc.getNumberOfPages();

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);

    doc.text(
      `Generado el ${new Date().toLocaleDateString()}`,
      14,
      290
    );

    doc.text(`Página ${i} de ${pages}`, 170, 290);
  }

  window.open(doc.output("bloburl"));
};