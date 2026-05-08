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
  // amperaje?: number | null;
  // fase?: "R" | "S" | "T" | null;
  // tipo?: "MONOFASICO" | "TRIFASICO" | null;
  // estado?: "ACTIVO" | "INACTIVO" | "FALLA";
}

// 🔥 OPCIONAL (solo si quieres generar leyenda en frontend)
export interface BoardLeyendaItem {
  circuito: string;
  descripcion: string;
}

export interface BoardImages {
  unifilar: string[];
  tablero: string[];
  termografia: string[];
}

// // 🔥 NUEVO: MAIN BREAKER
// export interface MainBreaker {
//   amperaje?: number;
//   polos?: number;
//   marca?: string;
//   modelo?: string;
// }

// // 🔥 NUEVO: PROTECCION
// export interface Proteccion {
//   sobretension?: boolean;
//   marca?: string;
//   modelo?: string;
// }

export interface BoardResponseDTO {
  _id: string;
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

  circuits: BoardCircuit[]; // 🔥 CLAVE

  // mainBreaker?: MainBreaker;
  // proteccion?: Proteccion;

  images: BoardImages;

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

  circuits: BoardCircuit[]; // 🔥

  // mainBreaker?: MainBreaker;
  // proteccion?: Proteccion;

  // imágenes (multipart)
  tablero?: File[];
  unifilar?: File[];
  termografia?: File[];
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

  circuits?: BoardCircuit[]; // 🔥

  // mainBreaker?: MainBreaker;
  // proteccion?: Proteccion;

  existingUnifilar?: string[];
  existingTablero?: string[];
  existingTermografia?: string[];

  unifilar?: File[];
  tablero?: File[];
  termografia?: File[];
}

// =========================
// 🌐 PUBLIC
// =========================
export interface PublicCompanyBoardsItemDTO {
  code: string;
  boardCode: string;
  name: string;
  type: string;
  tensionNominal: number;
  numeroFases: number;
  incluyeNeutro: boolean;
  location: string;
  description: string;
  images: BoardImages;
  createdAt: string;
}

export interface PublicBoardByCodeResponseDTO {
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

  circuits: BoardCircuit[]; // 🔥

  // mainBreaker?: MainBreaker;
  // proteccion?: Proteccion;

  images: BoardImages;

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