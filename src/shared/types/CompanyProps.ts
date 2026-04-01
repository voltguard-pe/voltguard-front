export interface PublicCompanyDTO {
  _id: string;
  name: string;
  publicCode: string;
}

export interface CompanyResponseDTO {
  _id: string;
  name: string;
  ruc: string;
  publicCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyCreateDTO {
  name: string;
}

export interface CompanyUpdateDTO {
  name?: string;
}