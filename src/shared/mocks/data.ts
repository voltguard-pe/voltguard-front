import type { BoardResponseDTO } from "../types/BoardProps";
import type { CompanyResponseDTO } from "../types/CompanyProps";

// src/mock/data.ts
export const mockAdmins = [
    {
        _id: 1,
        firstname: "Gustavo",
        lastname: "Torres",
        isActive: true,
        email: "gustavo.torres@recoleta.edu.pe",
        role: "ADMIN",
        company: "Recoleta"
    },
    {
        _id: 2,
        firstname: "Juan",
        lastname: "Mendez",
        isActive: true,
        email: "juan.mendez@volvo.pe",
        role: "ADMIN",
        company: "Volvo"
    },
];

export const mockCompanies: CompanyResponseDTO[] = [
  {
    _id: "1",
    name: "Recoleta",
    publicCode: "recoleta",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "2",
    name: "Volvo",
    publicCode: "volvo",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockBoards: Record<string, BoardResponseDTO[]> = {
  Recoleta: [
    {
      _id: "1",
      code: "REC001",
      name: "T. Transferencia",
      location: "Piso 1",
      description: "Tablero de transferencia",
      images: ["/img/demo.jpg"],
      company: {
        _id: "c1",
        name: "Recoleta",
        publicCode: "recoleta",
      },
      createdBy: {
        _id: "u1",
        name: "Gustavo",
        email: "gustavo@mail.com",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],

  Volvo: [
    {
      _id: "2",
      code: "VOL001",
      name: "T. Motor",
      location: "Zona A",
      description: "Tablero de motores",
      images: [],
      company: {
        _id: "c2",
        name: "Volvo",
        publicCode: "volvo",
      },
      createdBy: {
        _id: "u2",
        name: "Juan",
        email: "juan@mail.com",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};