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
  location?: string;
  description?: string;
  images?: string[];
}

export interface BoardUpdateDTO {
  name?: string;
  location?: string;
  description?: string;
  images?: string[];
}

export interface PublicCompanyBoardsItemDTO {
  code: string;
  name: string;
  location: string;
  description: string;
  images: string[];
  createdAt: string;
}

export interface PublicCompanyBoardsResponseDTO {
  company: {
    name: string;
    publicCode: string;
  };
  boards: PublicCompanyBoardsItemDTO[];
}

export interface PublicBoardByCodeResponseDTO {
  board: {
    name: string;
    location: string;
    description: string;
    images: string[];
    createdAt: string;
  };
  company: {
    name: string;
    publicCode: string;
  };
}