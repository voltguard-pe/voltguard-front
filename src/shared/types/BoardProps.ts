export interface CompanySummaryDTO {
  _id: string;
  name: string;
  publicCode?: string;
}

export interface UserSummaryDTO {
  _id: string;
  name: string;
  email: string;
}

// 🔥 NUEVO: CIRCUITS
export interface BoardCircuit {
  circuito: string;
  descripcion: string;

  // Campo interno para lógica de mediciones de aislamiento.
  // No es necesario mostrarlo en la tabla de leyenda.
  tipo?: "MONOFASICO" | "TRIFASICO" | null;
}

// =========================
// 📋 LEYENDA
// =========================
export interface BoardLeyendaItem {
  circuito: string;
  descripcion: string;
}

// =========================
// 🖼 IMÁGENES
// =========================
export interface BoardImages {
  unifilar: string[];
  tablero: string[];
  termografia: string[];
}

// =========================
// 🧪 MEDICIONES DE AISLAMIENTO
// =========================
export type InsulationStatus = "PENDING_REVIEW" | "CONFIRMED" | "FAILED";

export type InsulationPhase = "F1-G" | "F2-G" | "F3-G";

export interface InsulationPhaseMeasurement {
  fase: InsulationPhase;
  valor: number | null;
  unidad: "MΩ";
  aplica: boolean;
  display: string;
  confianza?: number | null;
}

export interface InsulationCircuitMeasurement {
  circuito: string;
  descripcion?: string | null;

  // Puede venir desde el backend/IA, pero no es obligatorio mostrarlo.
  tipoCircuito?: "MONOFASICO" | "TRIFASICO" | string | null;

  faseTierra: InsulationPhaseMeasurement[];

  confianzaLectura?: number | null;
  confianzaAsociacion?: number | null;
  observacion?: string;
}

export interface InsulationMeasurementRow {
  circuit: string;
  description: string;
  circuitType?: "MONOFASICO" | "TRIFASICO" | string | null;
  measurement_l1_g: number | null;
  measurement_l2_g: number | null;
  measurement_l3_g: number | null;
  unit: "MΩ";
  readingConfidence?: number | null;
  associationConfidence?: number | null;
  observation?: string;
}

export interface InsulationMeasurementRecord {
  _id?: string;
  batchCode: string;
  unit: "MΩ";
  status: InsulationStatus;
  sourceImages?: {
    boardImage?: string;
    unifilarImage?: string;
  };
  rows: InsulationMeasurementRow[];
  warnings?: string[];
  rawAiResponse?: unknown;
  importedBy?: string | null;
  importedAt?: string;
}

// =========================
// 🧱 BOARD RESPONSE
// =========================
export interface BoardResponseDTO {
  _id: string;

  // ID interno
  code: string;

  // Código real del tablero: T001, T002, etc.
  boardCode: string;

  name: string;
  type: string;

  tensionNominal: number;
  numeroFases: number;
  incluyeNeutro: boolean;

  // Sistema general del tablero.
  // No reemplaza al tipo de cada circuito.
  sistema?: "MONOFASICO" | "TRIFASICO";

  location: string;
  description: string;

  // Leyenda / circuitos del tablero
  circuits: BoardCircuit[];

  images: BoardImages;

  // Últimos o históricos registros de mediciones de aislamiento.
  // Normalmente el backend puede devolver el último registro como [0].
  insulationMeasurements?: InsulationMeasurementRecord[];

  estadoGeneral?: "OPERATIVO" | "OBSERVACION" | "CRITICO";

  company: CompanySummaryDTO;
  createdBy: string | UserSummaryDTO;

  createdAt: string;
  updatedAt: string;
}

// =========================
// 📝 CREATE
// =========================
export interface BoardCreateDTO {
  boardCode: string;
  name: string;
  type: string;

  tensionNominal: number;
  numeroFases: number;
  incluyeNeutro: boolean;

  sistema?: "MONOFASICO" | "TRIFASICO";
  estadoGeneral?: "OPERATIVO" | "OBSERVACION" | "CRITICO";

  location?: string;
  description?: string;

  publicCode?: string;

  circuits: BoardCircuit[];

  // Imágenes multipart
  tablero?: File[];
  unifilar?: File[];
  termografia?: File[];

  certificadosMantenimiento?: File[];
  certificadosOperatividad?: File[];
}

// =========================
// ✏️ UPDATE
// =========================
export interface BoardUpdateDTO {
  boardCode?: string;
  name?: string;
  type?: string;

  tensionNominal?: number;
  numeroFases?: number;
  incluyeNeutro?: boolean;

  sistema?: "MONOFASICO" | "TRIFASICO";
  estadoGeneral?: "OPERATIVO" | "OBSERVACION" | "CRITICO";

  location?: string;
  description?: string;

  circuits?: BoardCircuit[];

  existingUnifilar?: string[];
  existingTablero?: string[];
  existingTermografia?: string[];

  unifilar?: File[];
  tablero?: File[];
  termografia?: File[];

  certificadosMantenimiento?: File[];
  certificadosOperatividad?: File[];

  existingCertificadosMantenimiento?: {
    url: string;
    public_id: string;
    originalName: string;
  }[];

  existingCertificadosOperatividad?: {
    url: string;
    public_id: string;
    originalName: string;
  }[];
}

// =========================
// 🌐 PUBLIC - LISTADO
// =========================
export interface PublicCompanyBoardsItemDTO {
  code: string;
  boardCode: string;
  name: string;
  type: string;

  tensionNominal: number;
  numeroFases: number;
  incluyeNeutro: boolean;

  sistema?: "MONOFASICO" | "TRIFASICO";

  location: string;
  description: string;

  images: BoardImages;

  estadoGeneral?: "OPERATIVO" | "OBSERVACION" | "CRITICO";

  createdAt: string;
}

// =========================
// 🌐 PUBLIC - DETALLE POR CÓDIGO
// =========================
export interface PublicBoardByCodeResponseDTO {
  code: string;
  boardCode: string;
  name: string;
  type: string;

  tensionNominal: number;
  numeroFases: number;
  incluyeNeutro: boolean;

  // Este campo ya estaba bien aquí.
  // No lo agregues nuevamente.
  sistema?: "MONOFASICO" | "TRIFASICO";

  location: string;
  description: string;

  circuits: BoardCircuit[];

  images: BoardImages;

  // Para mostrar la tabla debajo de la leyenda en la vista pública/detalle.
  insulationMeasurements?: InsulationMeasurementRecord[];

  estadoGeneral?: "OPERATIVO" | "OBSERVACION" | "CRITICO";

  createdAt: string;

  company: {
    name: string;
    publicCode: string;
  };
}

export interface PublicCompanyBoardsResponseDTO {
  company: {
    name: string;
    publicCode: string;
  };

  boards: PublicCompanyBoardsItemDTO[];
}