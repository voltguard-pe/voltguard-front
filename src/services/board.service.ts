import clientAxios from "../shared/config/clientAxios";
import type {
  BoardCreateDTO,
  BoardResponseDTO,
  BoardUpdateDTO,
  PublicBoardByCodeResponseDTO,
  PublicCompanyBoardsResponseDTO,
} from "../shared/types/BoardProps";

// Privado: obtener tableros de la empresa del admin autenticado
export const getBoards = async () => {
  const res = await clientAxios.get("/board");
  return res.data;
};

// Privado: obtener un tablero por id, solo si pertenece a la empresa del admin
export const getBoardById = async (id: string) => {
  const res = await clientAxios.get(`/board/${id}`);
  return res.data;
};

// Privado: crear tablero para la empresa del admin autenticado
export const createBoard = async (data: any) => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("location", data.location);
  formData.append("description", data.description);

  // 📸 imágenes
  data.tablero?.forEach((file: File) => {
    formData.append("tablero", file);
  });

  data.unifilar?.forEach((file: File) => {
    formData.append("unifilar", file);
  });

  data.leyenda?.forEach((file: File) => {
    formData.append("leyenda", file);
  });

  data.termografia?.forEach((file: File) => {
    formData.append("termografia", file);
  });

  const res = await clientAxios.post("/board", formData);
  return res.data;
};

// Privado: actualizar tablero si luego implementas esa ruta en backend
export const updateBoard = async (
  id: string,
  data: any
) => {
  const formData = new FormData();

  // 🧾 datos
  if (data.name) formData.append("name", data.name);
  if (data.location) formData.append("location", data.location);
  if (data.description) formData.append("description", data.description);

  // 🔴 eliminar imágenes
  if (data.imagesToDelete?.length > 0) {
    formData.append(
      "imagesToDelete",
      JSON.stringify(data.imagesToDelete)
    );
  }

  // 🟢 nuevas imágenes
  data.tablero?.forEach((file: File) => {
    formData.append("tablero", file);
  });

  data.unifilar?.forEach((file: File) => {
    formData.append("unifilar", file);
  });

  data.leyenda?.forEach((file: File) => {
    formData.append("leyenda", file);
  });

  data.termografia?.forEach((file: File) => {
    formData.append("termografia", file);
  });

  const res = await clientAxios.put(`/board/${id}`, formData);
  return res.data;
};

// Privado: eliminar tablero de la empresa del admin
export const deleteBoard = async (id: string) => {
  const res = await clientAxios.delete(`/board/${id}`);
  return res.data;
};




// Público: obtener tableros de una empresa por publicCode
export const publicGetCompanyBoards = async (
  publicCode: string
): Promise<PublicCompanyBoardsResponseDTO> => {
  const { data } = await clientAxios.get<PublicCompanyBoardsResponseDTO>(
    `/board/public/company/${publicCode}`
  );
  return data;
};

// Público: obtener detalle público de un tablero por code
export const publicGetCompanyBoardByCode = async (
  code: string
): Promise<PublicBoardByCodeResponseDTO> => {
  const { data } = await clientAxios.get<PublicBoardByCodeResponseDTO>(
    `/board/public/board/${code}`
  );
  return data;
};