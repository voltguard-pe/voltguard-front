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

export interface BoardLeyendaItem {
  circuito: string;
  descripcion: string;
}

export interface BoardImages {
  unifilar: string[];
  tablero: string[];
  termografia: string[];
}

export interface BoardResponseDTO {
  _id: string;
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
  leyenda: BoardLeyendaItem[];
  company: string | CompanySummaryDTO;
  createdBy: string | UserSummaryDTO;
  createdAt: string;
  updatedAt: string;
}

export interface BoardCreateDTO {
  boardCode: string;
  name: string;
  type: string;
  tensionNominal: number;
  numeroFases: number;
  incluyeNeutro: boolean;
  location?: string;
  description?: string;
  publicCode?: string;
  images?: string[];
  leyenda?: BoardLeyendaItem[];
}

export interface BoardUpdateDTO {
  name?: string;
  type?: string;
  tensionNominal?: number;
  numeroFases?: number;
  incluyeNeutro?: boolean;
  location?: string;
  description?: string;

  leyenda?: BoardLeyendaItem[];

  existingUnifilar?: string[];
  existingTablero?: string[];
  existingTermografia?: string[];

  unifilar?: File[];
  tablero?: File[];
  termografia?: File[];
}

export interface PublicCompanyBoardsItemDTO {
  code: string;
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
  location: string;
  description: string;
  images: BoardImages;
  leyenda: BoardLeyendaItem[];
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
  boards: {
    code: string;
    name: string;
    type: string;
    tensionNominal: number;
    numeroFases: number;
    incluyeNeutro: boolean;
    location: string;
    description: string;
    images: BoardImages;
    createdAt: string;
  }[];
}