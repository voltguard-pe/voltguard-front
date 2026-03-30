import type { Role } from "./AuthProps"

export type UserProps = {
  _id: number | string
  firstname: string
  lastname: string
  email: string
  isActive: boolean
  role: Role
  company: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserDTO {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface UpdateUserDTO {
  firstname: string;
  lastname: string;
  email: string;
}
