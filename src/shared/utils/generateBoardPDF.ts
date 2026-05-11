import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { PublicBoardByCodeResponseDTO } from "../types/BoardProps";

const value = (data: unknown) =>
  data === null || data === undefined || data === "" ? "-" : String(data);

const bool = (data?: boolean) => (data ? "Sí" : "No");

const BLUE: [number, number, number] = [7, 151, 213];
// const BLUE_DARK = [8, 127, 179] as const;
const GREEN: [number, number, number] = [140, 207, 47];
// const GREEN_DARK = [58, 170, 53] as const;
const SLATE: [number, number, number] = [15, 23, 42];
const SLATE_MUTED: [number, number, number] = [100, 116, 139];
const BORDER: [number, number, number] = [226, 232, 240];
const SOFT: [number, number, number] = [248, 250, 252];

export const generateBoardPDF = async (
  board: PublicBoardByCodeResponseDTO
) => {
  const doc = new jsPDF({
    format: "a4",
    unit: "mm",
  });

  const pageWidth = 210;
  // const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;
  const bottomLimit = 274;

  const companyName =
    typeof board.company === "object" ? board.company.name : "Sin empresa";

  const drawHeader = () => {
    doc.setFillColor(...BLUE);
    doc.rect(0, 0, pageWidth, 30, "F");

    doc.setFillColor(...GREEN);
    doc.rect(0, 27, pageWidth, 3, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("VOLTGUARD", marginX, 14);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Sistema de gestion de tableros electricos", marginX, 20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("REPORTE TECNICO DE TABLERO", pageWidth - marginX, 15, {
      align: "right",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(companyName, pageWidth - marginX, 21, {
      align: "right",
    });

    doc.setTextColor(...SLATE);
  };

  const drawFooter = () => {
    const pages = doc.getNumberOfPages();

    for (let index = 1; index <= pages; index++) {
      doc.setPage(index);

      doc.setDrawColor(...BORDER);
      doc.line(marginX, 282, pageWidth - marginX, 282);

      doc.setTextColor(...SLATE_MUTED);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      doc.text(
        `Generado el ${new Date().toLocaleString("es-PE")}`,
        marginX,
        289
      );

      doc.text(`Pagina ${index} de ${pages}`, pageWidth - marginX, 289, {
        align: "right",
      });

      doc.setTextColor(...SLATE);
    }
  };

  const checkPage = (y: number, space = 30) => {
    if (y + space > bottomLimit) {
      doc.addPage();
      drawHeader();
      return 42;
    }

    return y;
  };

  const sectionTitle = (title: string, y: number) => {
    y = checkPage(y, 22);

    doc.setFillColor(...SOFT);
    doc.roundedRect(marginX, y - 6, contentWidth, 12, 3, 3, "F");

    doc.setFillColor(...BLUE);
    doc.roundedRect(marginX, y - 6, 3, 12, 1.5, 1.5, "F");

    doc.setTextColor(...SLATE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(title, marginX + 8, y + 1);

    return y + 12;
  };

  const drawHero = (y: number) => {
    doc.setFillColor(...SLATE);
    doc.roundedRect(marginX, y, contentWidth, 34, 5, 5, "F");

    doc.setFillColor(...BLUE);
    doc.roundedRect(marginX, y, 5, 34, 2, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text(value(board.name), marginX + 10, y + 13, {
      maxWidth: 120,
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(companyName, marginX + 10, y + 22, {
      maxWidth: 120,
    });

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth - marginX - 48, y + 7, 40, 20, 4, 4, "F");

    doc.setTextColor(...SLATE_MUTED);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("CODIGO", pageWidth - marginX - 28, y + 14, {
      align: "center",
    });

    doc.setTextColor(...SLATE);
    doc.setFontSize(12);
    doc.text(value(board.boardCode), pageWidth - marginX - 28, y + 22, {
      align: "center",
    });

    doc.setTextColor(...SLATE);

    return y + 44;
  };

  const drawSummaryCards = (y: number) => {
    y = checkPage(y, 32);

    const gap = 4;
    const cardWidth = (contentWidth - gap * 3) / 4;
    const cards = [
      ["Tipo", value(board.type)],
      ["Sistema", value(board.sistema)],
      ["Estado", value(board.estadoGeneral)],
      ["Fases", value(board.numeroFases)],
    ];

    cards.forEach(([label, data], index) => {
      const x = marginX + index * (cardWidth + gap);

      doc.setFillColor(...SOFT);
      doc.roundedRect(x, y, cardWidth, 24, 4, 4, "F");

      doc.setDrawColor(...BORDER);
      doc.roundedRect(x, y, cardWidth, 24, 4, 4, "S");

      doc.setTextColor(...SLATE_MUTED);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text(label.toUpperCase(), x + 4, y + 8);

      doc.setTextColor(...SLATE);
      doc.setFontSize(9);
      doc.text(data, x + 4, y + 17, {
        maxWidth: cardWidth - 8,
      });
    });

    return y + 34;
  };

  const drawKeyValueTable = (
    title: string,
    rows: [string, string][],
    startY: number
  ) => {
    startY = sectionTitle(title, startY);

    autoTable(doc, {
      startY,
      head: [["Campo", "Valor"]],
      body: rows,
      margin: { left: marginX, right: marginX },
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8.5,
        cellPadding: 3,
        lineColor: BORDER,
        lineWidth: 0.1,
        textColor: SLATE,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: BLUE,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: SOFT,
      },
      columnStyles: {
        0: {
          cellWidth: 58,
          fontStyle: "bold",
          textColor: SLATE,
        },
        1: {
          cellWidth: contentWidth - 58,
          textColor: SLATE_MUTED,
        },
      },
    });

    return (doc as any).lastAutoTable.finalY + 10;
  };

  const loadImage = async (url: string) => {
    const optimizedUrl = url.includes("/upload/")
      ? url.replace("/upload/", "/upload/w_1400/")
      : url;

    const response = await fetch(optimizedUrl);
    const blob = await response.blob();

    return new Promise<{ data: string; img: HTMLImageElement }>((resolve) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;

        img.onload = () =>
          resolve({
            data: reader.result as string,
            img,
          });
      };

      reader.readAsDataURL(blob);
    });
  };

  const getImageDimensions = (
    img: HTMLImageElement,
    maxW = 176,
    maxH = 120
  ) => {
    const ratio = img.width / img.height;

    let width = maxW;
    let height = width / ratio;

    if (height > maxH) {
      height = maxH;
      width = height * ratio;
    }

    return { width, height };
  };

  const drawImages = async (
    title: string,
    description: string,
    images: string[] = []
  ) => {
    if (!images.length) return;

    doc.addPage();
    drawHeader();

    let y = 42;

    y = sectionTitle(title, y);

    doc.setTextColor(...SLATE_MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(description, marginX, y, {
      maxWidth: contentWidth,
    });

    y += 10;

    for (let index = 0; index < images.length; index++) {
      try {
        const { data, img } = await loadImage(images[index]);
        const { width, height } = getImageDimensions(img);

        if (y + height + 18 > bottomLimit) {
          doc.addPage();
          drawHeader();
          y = 42;
        }

        doc.setFillColor(...SOFT);
        doc.roundedRect(marginX, y, contentWidth, height + 18, 4, 4, "F");

        doc.setDrawColor(...BORDER);
        doc.roundedRect(marginX, y, contentWidth, height + 18, 4, 4, "S");

        doc.setTextColor(...SLATE);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(`${title} ${index + 1}`, marginX + 5, y + 8);

        const x = (pageWidth - width) / 2;

        doc.addImage(data, "JPEG", x, y + 12, width, height);

        y += height + 25;
      } catch (error) {
        console.error("Error cargando imagen PDF:", error);
      }
    }
  };

  drawHeader();

  let y = 42;

  y = drawHero(y);
  y = drawSummaryCards(y);

  y = drawKeyValueTable(
    "Informacion general",
    [
      ["Codigo real del tablero", value(board.boardCode)],
      ["Nombre", value(board.name)],
      ["Tipo", value(board.type)],
      ["Sistema", value(board.sistema)],
      ["Estado general", value(board.estadoGeneral)],
      ["Ubicacion", value(board.location)],
      ["Descripcion", value(board.description)],
    ],
    y
  );

  y = drawKeyValueTable(
    "Informacion electrica",
    [
      [
        "Tension nominal",
        board.tensionNominal ? `${board.tensionNominal} V` : "-",
      ],
      ["Numero de fases", value(board.numeroFases)],
      ["Incluye neutro", bool(board.incluyeNeutro)],
    ],
    y
  );

  y = checkPage(y, 70);
  y = sectionTitle("Circuitos", y);

  autoTable(doc, {
    startY: y,
    head: [["Circuito", "Descripcion"]],
    body:
      board.circuits?.length > 0
        ? board.circuits.map((circuit) => [
            value(circuit.circuito),
            value(circuit.descripcion),
          ])
        : [["-", "Sin circuitos registrados"]],
    margin: { left: marginX, right: marginX },
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 3,
      lineColor: BORDER,
      lineWidth: 0.1,
      textColor: SLATE,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: BLUE,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: SOFT,
    },
    columnStyles: {
      0: {
        cellWidth: 44,
        fontStyle: "bold",
      },
      1: {
        cellWidth: contentWidth - 44,
      },
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  y = drawKeyValueTable(
    "Imagenes registradas",
    [
      ["Imagenes del tablero", String(board.images?.tablero?.length || 0)],
      ["Diagramas unifilares", String(board.images?.unifilar?.length || 0)],
      ["Termografias", String(board.images?.termografia?.length || 0)],
    ],
    y
  );

  await drawImages(
    "Imagen del tablero",
    "Fotos generales, interiores o exteriores del tablero electrico.",
    board.images?.tablero || []
  );

  await drawImages(
    "Diagrama unifilar",
    "Imagenes asociadas al diagrama unifilar del tablero.",
    board.images?.unifilar || []
  );

  await drawImages(
    "Termografia",
    "Imagenes termograficas o evidencias visuales de inspeccion.",
    board.images?.termografia || []
  );

  drawFooter();

  window.open(doc.output("bloburl"));
};