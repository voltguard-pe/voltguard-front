import clientAxios from "../shared/config/clientAxios";
import type { BoardCreateDTO, BoardResponseDTO, BoardUpdateDTO } from "../shared/types/BoardProps";
import type { PageProps } from "../shared/types/PageProps";

// Obtener todos los boards paginados
export const getAllBoards = async (page = 0, size = 10): Promise<PageProps<BoardResponseDTO>> => {
  const { data } = await clientAxios.get<PageProps<BoardResponseDTO>>("/boards", { params: { page, size } });
  console.log("error boards", data)
  return data;
};

// Obtener un board por id
export const getBoardById = async (id: number): Promise<BoardResponseDTO> => {
  const { data } = await clientAxios.get<BoardResponseDTO>(`/boards/${id}`);
  return data;
};

// Crear un board
export const createBoard = async (
  board: BoardCreateDTO,
  // diagrama?: File | null,
  // leyenda?: File | null,
  diagrama?: File[],
  leyenda?: File[],
  galeria?: File[]
): Promise<BoardResponseDTO> => {
  const formData = new FormData();
  formData.append("board", new Blob([JSON.stringify(board)], { type: "application/json" }));
  // if (diagrama) formData.append("diagrama", diagrama);
  // if (leyenda) formData.append("leyenda", leyenda);
  diagrama?.forEach(file => formData.append("diagrama", file));
  leyenda?.forEach(file => formData.append("leyenda", file));
  galeria?.forEach(file => formData.append("galeria", file));

  const { data } = await clientAxios.post<BoardResponseDTO>(`/boards`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};

// Actualizar un board (incluye eliminación de archivos existentes)
export const updateBoard = async (
  id: number,
  board: BoardUpdateDTO,
  // diagrama?: File | null,
  // leyenda?: File | null,
  diagrama?: File[],
  leyenda?: File[],
  galeria?: File[],
  filesToDelete?: number[]
): Promise<BoardResponseDTO> => {
  const formData = new FormData();
  const payload = {
    ...board,
    filesToDelete,
  };
  formData.append("board", new Blob([JSON.stringify(payload)], { type: "application/json" }));
  // if (diagrama) formData.append("diagrama", diagrama);
  // if (leyenda) formData.append("leyenda", leyenda);
  diagrama?.forEach(file => formData.append("diagrama", file));
  leyenda?.forEach(file => formData.append("leyenda", file));
  galeria?.forEach(file => formData.append("galeria", file));

  // // Enviar los ids de los archivos que se quieren eliminar
  // if (filesToDelete && filesToDelete.length > 0) {
  //   formData.append("filesToDelete", JSON.stringify(filesToDelete));
  // }

  const { data } = await clientAxios.put<BoardResponseDTO>(`/boards/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
};

// Eliminar un board completo
export const deleteBoard = async (id: number): Promise<void> => {
  await clientAxios.delete(`/boards/${id}`);
};

// Eliminar un archivo específico de un board
export const deleteBoardFile = async (fileId: number): Promise<void> => {
  await clientAxios.delete(`/boards/file/${fileId}`);
};