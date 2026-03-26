// Archivo: src/shared/types/BoardTypes.ts

// ========================
// DTO de archivos
// ========================
export interface BoardFileDTO {
    id: number;
    filename: string;
    url: string;
    fileType: "DIAGRAMA" | "LEYENDA" | "GALERIA";
    fileSize: number;
  }
  
  // ========================
  // DTO de respuesta de board
  // ========================
  export interface BoardResponseDTO {
    id: number;
    userId: number;
    name: string;
    type: string;
    tensionNominal: number;
    numeroFases: number;
    incluyeNeutro: boolean;
    createdAt: string; // string ISO desde backend
    updatedAt: string;
    files: BoardFileDTO[];
  }
  
  // ========================
  // DTO para crear board
  // ========================
  export interface BoardCreateDTO {
    name: string;
    type: string;
    tensionNominal: number;
    numeroFases: number;
    incluyeNeutro: boolean;
  }
  
  // ========================
  // DTO para actualizar board
  // ========================
  export interface BoardUpdateDTO {
    name: string;
    type: string;
    tensionNominal: number;
    numeroFases: number;
    incluyeNeutro: boolean;
  }
  