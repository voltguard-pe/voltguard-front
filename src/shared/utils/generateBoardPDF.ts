import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { PublicBoardByCodeResponseDTO } from "../types/BoardProps";

const value = (data: unknown) =>
  data === null || data === undefined || data === "" ? "-" : String(data);

const bool = (data?: boolean) => (data ? "Sí" : "No");

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleString("es-PE") : "-";

export const generateBoardPDF = async (
  board: PublicBoardByCodeResponseDTO
) => {
  const doc = new jsPDF({ format: "a4" });

  const pageWidth = 210;
  const marginX = 14;
  const bottomLimit = 270;

  const companyName =
    typeof board.company === "object" ? board.company.name : "Sin empresa";

  const drawHeader = () => {
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageWidth, 25, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("VOLTGUARD", 14, 15);

    doc.setFontSize(10);
    doc.text("REPORTE DE TABLERO ELÉCTRICO", 120, 15);

    doc.setTextColor(0, 0, 0);
  };

  const checkPage = (y: number, space = 30) => {
    if (y + space > bottomLimit) {
      doc.addPage();
      drawHeader();
      return 35;
    }

    return y;
  };

  const sectionTitle = (title: string, y: number) => {
    y = checkPage(y, 20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(title, marginX, y);

    return y + 6;
  };

  const loadImage = async (url: string) => {
    const res = await fetch(url.replace("/upload/", "/upload/w_1200/"));
    const blob = await res.blob();

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
      styles: {
        fontSize: 9,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: [255, 255, 255],
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: "bold" },
        1: { cellWidth: 122 },
      },
    });

    return (doc as any).lastAutoTable.finalY + 10;
  };

  drawHeader();

  let y = 35;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(value(board.name), marginX, y);

  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Empresa: ${companyName}`, marginX, y);

  y += 10;

  y = drawKeyValueTable(
    "Identificación",
    [
      ["ID interno", value(board.code)],
      ["Código real del tablero", value(board.boardCode)],
      ["Empresa", companyName],
    ],
    y
  );

  y = drawKeyValueTable(
    "Información general",
    [
      ["Nombre", value(board.name)],
      ["Tipo", value(board.type)],
      ["Sistema", value(board.sistema)],
      ["Estado general", value(board.estadoGeneral)],
      ["Ubicación", value(board.location)],
      ["Descripción", value(board.description)],
    ],
    y
  );

  y = drawKeyValueTable(
    "Información eléctrica",
    [
      [
        "Tensión nominal",
        board.tensionNominal ? `${board.tensionNominal} V` : "-",
      ],
      ["Número de fases", value(board.numeroFases)],
      ["Incluye neutro", bool(board.incluyeNeutro)],
    ],
    y
  );

  y = drawKeyValueTable(
    "Main Breaker",
    [
      [
        "Amperaje",
        board.mainBreaker?.amperaje
          ? `${board.mainBreaker.amperaje} A`
          : "-",
      ],
      ["Polos", value(board.mainBreaker?.polos)],
      ["Marca", value(board.mainBreaker?.marca)],
      ["Modelo", value(board.mainBreaker?.modelo)],
    ],
    y
  );

  y = drawKeyValueTable(
    "Protección",
    [
      ["Sobretensión", bool(board.proteccion?.sobretension)],
      ["Marca", value(board.proteccion?.marca)],
      ["Modelo", value(board.proteccion?.modelo)],
    ],
    y
  );

  y = checkPage(y, 60);

  y = sectionTitle("Circuitos", y);

  autoTable(doc, {
    startY: y,
    head: [["Circuito", "Descripción", "Amperaje", "Fase", "Tipo", "Estado"]],
    body:
      board.circuits?.length > 0
        ? board.circuits.map((c) => [
            value(c.circuito),
            value(c.descripcion),
            c.amperaje ? `${c.amperaje} A` : "-",
            value(c.fase),
            value(c.tipo),
            value(c.estado),
          ])
        : [["-", "Sin circuitos registrados", "-", "-", "-", "-"]],
    margin: { left: marginX, right: marginX },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  y = drawKeyValueTable(
    "Imágenes registradas",
    [
      ["Imágenes del tablero", String(board.images?.tablero?.length || 0)],
      ["Diagramas unifilares", String(board.images?.unifilar?.length || 0)],
      ["Termografías", String(board.images?.termografia?.length || 0)],
    ],
    y
  );

  y = drawKeyValueTable(
    "Auditoría",
    [
      ["Creado por", value((board as any).createdBy)],
      ["Fecha de creación", formatDate(board.createdAt)],
      ["Última actualización", formatDate((board as any).updatedAt)],
    ],
    y
  );

  const drawImages = async (title: string, images: string[] = []) => {
    if (!images.length) return;

    doc.addPage();
    drawHeader();

    let imgY = 35;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(title, marginX, imgY);

    imgY += 10;

    for (let i = 0; i < images.length; i++) {
      try {
        const { data, img } = await loadImage(images[i]);
        const dim = getDim(img, 182, 120);

        if (imgY + dim.h > bottomLimit) {
          doc.addPage();
          drawHeader();
          imgY = 35;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`${title} ${i + 1}`, marginX, imgY);

        imgY += 5;

        const x = (pageWidth - dim.w) / 2;

        doc.addImage(data, "JPEG", x, imgY, dim.w, dim.h);

        imgY += dim.h + 12;
      } catch (error) {
        console.error("Error cargando imagen PDF:", error);
      }
    }
  };

  await drawImages("Imagen del tablero", board.images?.tablero || []);
  await drawImages("Diagrama unifilar", board.images?.unifilar || []);
  await drawImages("Termografía", board.images?.termografia || []);

  const pages = doc.getNumberOfPages();

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);

    doc.text(`Generado el ${new Date().toLocaleString("es-PE")}`, 14, 290);
    doc.text(`Página ${i} de ${pages}`, 170, 290);

    doc.setTextColor(0, 0, 0);
  }

  window.open(doc.output("bloburl"));
};