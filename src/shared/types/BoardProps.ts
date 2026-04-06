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
  images: string[];
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
  company?: string;
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
  images?: string[];
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
  images: string[];
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
  images: string[];
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
    images: string[];
    createdAt: string;
  }[];
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
  images: string[];
  createdAt: string;
  company: {
    name: string;
    publicCode: string;
  };
}