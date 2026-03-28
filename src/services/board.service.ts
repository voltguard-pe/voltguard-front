import clientAxios from "../shared/config/clientAxios";
import type {
  BoardCreateDTO,
  BoardResponseDTO,
  BoardUpdateDTO,
  PublicBoardByCodeResponseDTO,
  PublicCompanyBoardsResponseDTO,
} from "../shared/types/BoardProps";

// Privado: obtener tableros de la empresa del admin autenticado
export const getCompanyBoards = async (): Promise<BoardResponseDTO[]> => {
  const { data } = await clientAxios.get<BoardResponseDTO[]>("/board");
  return data;
};

// Privado: obtener un tablero por id, solo si pertenece a la empresa del admin
export const getCompanyBoardById = async (id: string): Promise<BoardResponseDTO> => {
  const { data } = await clientAxios.get<BoardResponseDTO>(`/board/${id}`);
  return data;
};

// Privado: crear tablero para la empresa del admin autenticado
export const createBoard = async (board: BoardCreateDTO): Promise<{ message: string; board: BoardResponseDTO }> => {
  const { data } = await clientAxios.post<{ message: string; board: BoardResponseDTO }>("/board", board);
  return data;
};

// Privado: actualizar tablero si luego implementas esa ruta en backend
export const updateBoard = async (
  id: string,
  board: BoardUpdateDTO
): Promise<BoardResponseDTO> => {
  const { data } = await clientAxios.put<BoardResponseDTO>(`/board/${id}`, board);
  return data;
};

// Privado: eliminar tablero de la empresa del admin
export const deleteBoard = async (id: string): Promise<{ message: string }> => {
  const { data } = await clientAxios.delete<{ message: string }>(`/board/${id}`);
  return data;
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