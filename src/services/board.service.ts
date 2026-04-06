import clientAxios from "../shared/config/clientAxios";
import type {
  BoardCreateDTO,
  BoardResponseDTO,
  BoardUpdateDTO,
  PublicBoardByCodeResponseDTO,
  PublicCompanyBoardsResponseDTO,
} from "../shared/types/BoardProps";

type CreateBoardPayload = BoardCreateDTO & {
  diagrama?: File[];
  leyenda?: File[];
  galeria?: File[];
};

export const getBoards = async (): Promise<BoardResponseDTO[]> => {
  const res = await clientAxios.get<BoardResponseDTO[]>("/board");
  return res.data;
};

export const createBoard = async (data: CreateBoardPayload) => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("type", data.type);
  formData.append("tensionNominal", String(data.tensionNominal));
  formData.append("numeroFases", String(data.numeroFases));
  formData.append("incluyeNeutro", String(data.incluyeNeutro));
  formData.append("company", data.company!);

  if (data.location) formData.append("location", data.location);
  if (data.description) formData.append("description", data.description);

  data.diagrama?.forEach((file) => {
    formData.append("unifilar", file);
  });

  data.leyenda?.forEach((file) => {
    formData.append("leyenda", file);
  });

  data.galeria?.forEach((file) => {
    formData.append("tablero", file);
  });

  const res = await clientAxios.post("/board", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const getBoardByCode = async (code: string): Promise<BoardResponseDTO> => {
  const res = await clientAxios.get<BoardResponseDTO>(`/board/${code}`);
  return res.data;
};

export const updateBoard = async (
  code: string,
  data: BoardUpdateDTO
): Promise<{ message: string; board: BoardResponseDTO }> => {
  const res = await clientAxios.put<{ message: string; board: BoardResponseDTO }>(
    `/board/${code}`,
    data
  );
  return res.data;
};

export const deleteBoard = async (code: string) => {
  const res = await clientAxios.delete(`/board/${code}`);
  return res.data;
};

export const publicGetCompanyBoards = async (
  publicCode: string
): Promise<PublicCompanyBoardsResponseDTO> => {
  const { data } = await clientAxios.get<PublicCompanyBoardsResponseDTO>(
    `/board/public/company/${publicCode}`
  );
  return data;
};

export const publicGetCompanyBoardByCode = async (
  code: string
): Promise<PublicBoardByCodeResponseDTO> => {
  const { data } = await clientAxios.get<PublicBoardByCodeResponseDTO>(
    `/board/public/${code}`
  );
  return data;
};

export const uploadFile = async (file: File, userId: string): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("userId", userId);
  const res = await clientAxios.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
