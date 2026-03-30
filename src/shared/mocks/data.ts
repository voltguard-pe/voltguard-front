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
      name: "TD COLISEO",
      location: "Coliseo",
      description: "Tablero TD COLISEO",
      images: ["/img/demo.jpg"],
      thermalReportUrl: "/THERMAL_SHEETS/TD COLISEO - THERMAL.pdf",
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
    {
      _id: "2",
      code: "REC002",
      name: "TG 4TO SEC",
      location: "4to Secundaria",
      description: "Tablero TG 4TO SEC",
      images: [],
      thermalReportUrl: "/THERMAL_SHEETS/TG 4TO SEC - THERMAL.pdf",
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
    {
      _id: "3",
      code: "REC003",
      name: "TG PAB ADMIN I",
      location: "Pabellón Administración I",
      description: "Tablero TG PAB ADMIN I",
      images: [],
      thermalReportUrl: "/THERMAL_SHEETS/TG PAB ADMIN I - THERMAL.pdf",
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
    {
      _id: "4",
      code: "REC004",
      name: "TG PAB ADMIN II",
      location: "Pabellón Administración II",
      description: "Tablero TG PAB ADMIN II",
      images: [],
      thermalReportUrl: "/THERMAL_SHEETS/TG PAB ADMIN II - THERMAL.pdf",
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
    {
      _id: "5",
      code: "REC005",
      name: "TG SERV COMP II",
      location: "Servicios Complementarios II",
      description: "Tablero TG SERV COMP II",
      images: [],
      thermalReportUrl: "/THERMAL_SHEETS/TG SERV COMP II - THERMAL.pdf",
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
      _id: "6",
      code: "VOL001",
      name: "T. Motor",
      location: "Zona A",
      description: "Tablero de motores",
      images: [],
      thermalReportUrl: "",
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