export type User = {
  id: number;
  name: string;
  email: string;
  role: "Administrador" | "Editor" | "Usuario";
  status: "Activo" | "Bloqueado";
  createdAt: string;
};

export const usersMock: User[] = [
  {
    id: 1,
    name: "Juan Pérez",
    email: "juan@example.com",
    role: "Administrador",
    status: "Activo",
    createdAt: "2024-11-10",
  },
  {
    id: 2,
    name: "María López",
    email: "maria@example.com",
    role: "Usuario",
    status: "Activo",
    createdAt: "2024-11-15",
  },
  {
    id: 3,
    name: "Carlos Gómez",
    email: "carlos@example.com",
    role: "Editor",
    status: "Bloqueado",
    createdAt: "2024-10-01",
  },
];
