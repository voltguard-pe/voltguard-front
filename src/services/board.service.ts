import clientAxios from "../shared/config/clientAxios";
import type {
  BoardCreateDTO,
  BoardResponseDTO,
  PublicBoardByCodeResponseDTO,
  PublicCompanyBoardsResponseDTO
} from "../shared/types/BoardProps";

type CreateBoardPayload = BoardCreateDTO & {
  diagrama?: File[];
  leyenda?: File[];
  galeria?: File[];
  termografia?: File[];
};

export const getBoards = async (
  publicCode: string
): Promise<{ company: { name: string; publicCode: string }; boards: BoardResponseDTO[] }> => {
  const res = await clientAxios.get<{
    company: { name: string; publicCode: string };
    boards: BoardResponseDTO[];
  }>(`/board/${publicCode}`);
  return res.data;
};

export const createBoard = async (data: CreateBoardPayload) => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("type", data.type);
  formData.append("tensionNominal", String(data.tensionNominal));
  formData.append("numeroFases", String(data.numeroFases));
  formData.append("incluyeNeutro", String(data.incluyeNeutro));
  formData.append("companyPublicCode", data.publicCode!);


  if (data.location) formData.append("location", data.location);
  if (data.description) formData.append("description", data.description);

   data.diagrama?.forEach(file => formData.append("unifilar", file));
  data.leyenda?.forEach(file => formData.append("leyenda", file));
  data.galeria?.forEach(file => formData.append("tablero", file));
  data.termografia?.forEach(file => formData.append("termografia", file));

  console.log("companyPublicCode:", data.publicCode);

  const res = await clientAxios.post("/board", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const getBoardByCode = async (
  publicCode: string,
  code: string
): Promise<BoardResponseDTO> => {
  const res = await clientAxios.get<BoardResponseDTO>(
    `/board/${publicCode}/${code}`
  );
  return res.data;
};

export const updateBoard = async (
  publicCode: string,
  code: string,
  formData: FormData
) => {
  const res = await clientAxios.put(
    `/board/${publicCode}/${code}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

export const deleteBoard = async (publicCode: string, code: string) => {
  const res = await clientAxios.delete(`/board/${publicCode}/${code}`);
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
  publicCode: string,
  code: string
): Promise<PublicBoardByCodeResponseDTO> => {
  const { data } = await clientAxios.get<PublicBoardByCodeResponseDTO>(
    `/board/public/${publicCode}/${code}`
  );
  return data;
};

export const uploadFile = async (
  file: File,
  userId: string
): Promise<{ url: string }> => {
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