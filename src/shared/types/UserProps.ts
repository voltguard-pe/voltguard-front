import type { Role } from "./AuthProps";

export type PlanType = "basico" | "intermedio" | "empresarial";

export interface CompanySummaryDTO {
  name: string;
  publicCode: string;
}

export type UserProps = {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  // ── CAMPOS ADICIONALES DEL MODELO ──
  company?: string;
  ruc?: string;
  cargo?: string;
  phone?: string;
  referralSource?: string;
  // ── PLAN Y ESTADOS ──
  plan: PlanType; // ← Agregado aquí
  isActive: boolean;
  verified?: boolean;
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
  plan?: PlanType;
}

export interface UpdateUserDTO {
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  companyPublicCode?: string;
  plan?: PlanType;
}