import clientAxios from "../shared/config/clientAxios";

export type CreateBoardFromUnifilarResponse = {
  ok: boolean;
  message: string;
  board: any;
  warnings?: string[];
  aiResult?: any;
};


export const createBoardFromUnifilar = async (
  file: File,
  token: string,
  companyCode: string
) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("companyCode", companyCode);

  const { data } = await clientAxios.post(
    "/boards-unifilar/import-unifilares",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};