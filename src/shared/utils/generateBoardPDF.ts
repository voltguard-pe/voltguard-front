import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { PublicBoardByCodeResponseDTO } from "../types/BoardProps";

export const generateBoardPDF = async (
  board: PublicBoardByCodeResponseDTO
) => {
  const doc = new jsPDF({ format: "a4" });

  // =========================
  // 🎨 HEADER
  // =========================
  const drawHeader = () => {
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 25, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("VOLTGUARD", 14, 15);

    doc.setFontSize(10);
    doc.text("REPORTE DE TABLERO ELÉCTRICO", 120, 15);

    doc.setTextColor(0, 0, 0);
  };

  // =========================
  // 📄 INFO
  // =========================
  const drawBoardInfo = () => {
    let y = 35;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(board.name || "Sin nombre", 14, y);

    y += 10;

    doc.setDrawColor(200);
    doc.rect(14, y, 182, 40);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const xLeft = 18;
    const xRight = 110;
    let yBox = y + 8;

    doc.text(`Tipo: ${board.type || "N/A"}`, xLeft, yBox);
    doc.text(`Tensión: ${board.tensionNominal || 0} V`, xRight, yBox);

    yBox += 10;

    doc.text(`Fases: ${board.numeroFases || 0}`, xLeft, yBox);
    doc.text(
      `Neutro: ${board.incluyeNeutro ? "Sí" : "No"}`,
      xRight,
      yBox
    );

    yBox += 10;

    doc.text(`Ubicación: ${board.location || "N/A"}`, xLeft, yBox);

    y += 55;

    doc.setFont("helvetica", "bold");
    doc.text("Descripción", 14, y);

    y += 6;

    doc.setFont("helvetica", "normal");

    const splitDesc = doc.splitTextToSize(
      board.description || "Sin descripción",
      180
    );

    doc.text(splitDesc, 14, y);

    return y + splitDesc.length * 6 + 10;
  };

  // =========================
  // 🖼 LOAD IMAGE
  // =========================
  const loadImage = async (url: string) => {
    const res = await fetch(url.replace("/upload/", "/upload/w_1200/"));
    const blob = await res.blob();

    return new Promise<{ data: string; img: HTMLImageElement }>((resolve) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const imgData = reader.result as string;

        const img = new Image();
        img.src = imgData;

        img.onload = () => resolve({ data: imgData, img });
      };

      reader.readAsDataURL(blob);
    });
  };

  const getImageDimensions = (
    img: HTMLImageElement,
    maxWidth: number,
    maxHeight: number
  ) => {
    const ratio = img.width / img.height;

    let width = maxWidth;
    let height = width / ratio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * ratio;
    }

    return { width, height };
  };

  // =========================
  // 📄 CONTROL DE PÁGINAS
  // =========================
  let isFirstPage = true;

  const createPage = () => {
    if (!isFirstPage) {
      doc.addPage();
    }
    isFirstPage = false;

    drawHeader();
    return drawBoardInfo();
  };

  // =========================
  // 📄 PÁGINA 1 - UNIFILAR
  // =========================
  if (board.images?.unifilar?.[0]) {
    const y = createPage();

    const { data, img } = await loadImage(board.images.unifilar[0]);

    const { width, height } = getImageDimensions(img, 182, 140);
    const x = (210 - width) / 2;

    doc.setFontSize(11);
    doc.text("Diagrama unifilar", 14, y);

    doc.addImage(data, "JPEG", x, y + 5, width, height);
  }

  // =========================
  // 📄 PÁGINA 2 - LEYENDA (🔥 AUTOTABLE)
  // =========================
  if (board.leyenda && board.leyenda.length > 0) {
    const y = createPage();

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Leyenda", 14, y);

    const yTable = y + 10;

    autoTable(doc, {
      startY: yTable,
      head: [["Circuito", "Descripción"]],
      body: board.leyenda.map((item) => [
        item.circuito || "-",
        item.descripcion || "-",
      ]),
      styles: {
        font: "helvetica",
        fontSize: 10,
      },
      headStyles: {
        fillColor: [30, 64, 175],
      },
      margin: { left: 14, right: 14 },
    });
  }

  // =========================
  // 📄 PÁGINA 3 - IMÁGENES
  // =========================
  if (board.images?.tablero?.[0] || board.images?.termografia?.[0]) {
    const y = createPage();

    doc.setFontSize(11);
    doc.text("Tablero / Termografía", 14, y);

    const maxWidth = 85;
    const maxHeight = 110;

    const x1 = 14;
    const x2 = 110;

    const yImg = y + 10;

    if (board.images?.tablero?.[0]) {
      const { data, img } = await loadImage(board.images.tablero[0]);
      const dim = getImageDimensions(img, maxWidth, maxHeight);

      doc.addImage(data, "JPEG", x1, yImg, dim.width, dim.height);
    }

    if (board.images?.termografia?.[0]) {
      const { data, img } = await loadImage(
        board.images.termografia[0]
      );
      const dim = getImageDimensions(img, maxWidth, maxHeight);

      doc.addImage(data, "JPEG", x2, yImg, dim.width, dim.height);
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
  // 🚀 OPEN PDF
  // =========================
  window.open(doc.output("bloburl"));
};