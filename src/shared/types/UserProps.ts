import type { Role } from "./AuthProps";

export interface CompanySummaryDTO {
  name: string;
  publicCode: string;
}

export type UserProps = {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  isActive: boolean;
  role: Role;
  companyPublicCode: string | CompanySummaryDTO | null;
  createdAt: string;
  updatedAt: string;
};

export interface CreateUserDTO {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  companyPublicCode: string;
}

export interface UpdateUserDTO {
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  companyPublicCode?: string;
}