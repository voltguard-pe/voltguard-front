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

export interface BoardImages {
  unifilar: string[];
  leyenda: string[];
  tablero: string[];
  termografia: string[];
}

export interface BoardResponseDTO {
  _id: string;
  code: string;
  name: string;
  type: string;
  tensionNominal: number;
  numeroFases: number;
  incluyeNeutro: boolean;
  location: string;
  description: string;
  images: BoardImages;
  company: string | CompanySummaryDTO;
  createdBy: string | UserSummaryDTO;
  createdAt: string;
  updatedAt: string;
}

export interface BoardCreateDTO {
  name: string;
  type: string;
  tensionNominal: number;
  numeroFases: number;
  incluyeNeutro: boolean;
  location?: string;
  description?: string;
  publicCode?: string;
  images?: string[];
}

export interface BoardUpdateDTO {
  name?: string;
  type?: string;
  tensionNominal?: number;
  numeroFases?: number;
  incluyeNeutro?: boolean;
  location?: string;
  description?: string;

  existingUnifilar?: string[];
  existingLeyenda?: string[];
  existingTablero?: string[];
  existingTermografia?: string[];

  unifilar?: File[];
  leyenda?: File[];
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
  name: string;
  type: string;
  tensionNominal: number;
  numeroFases: number;
  incluyeNeutro: boolean;
  location: string;
  description: string;
  images: BoardImages;
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