export interface CompanyOptionDTO {
  name: string;
  publicCode: string;
}

export interface CompanyResponseDTO {
  _id: string;
  name: string;
  ruc?: string;
  publicCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyCreateDTO {
  name: string;
  ruc?: string;
}

export interface CompanyUpdateDTO {
  name?: string;
  ruc?: string;
}