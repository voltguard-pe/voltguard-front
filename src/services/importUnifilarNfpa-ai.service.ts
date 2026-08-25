import clientAxios from "../shared/config/clientAxios";

export interface ImportBoardsResponse {
  ok: boolean;
  total: number;
  created: number;
  skipped: number;
  failed: number;
  results: Array<{
    boardCode: string;
    status: "created" | "skipped" | "failed";
    boardId?: string;
    hasNfpa?: boolean;
    warnings?: string[];
    error?: string;
  }>;
}

export const importBoardsWithNfpa = async (
  file: File,
  token: string,
  companyCode: string,
  onProgress?: (percent: number) => void
): Promise<ImportBoardsResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("companyCode", companyCode);

  const res = await clientAxios.post<ImportBoardsResponse>(
    `/import-unifilar-nfpa/import-zip`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        // Eliminado "Content-Type" para permitir que Axios/Navegador agregue el boundary automáticamente
      },
      onUploadProgress: (progressEvent) => {
        if (!progressEvent.total) return;
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress?.(percent);
      },
    }
  );

  return res.data;
};