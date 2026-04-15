import clientAxios from "../shared/config/clientAxios";

export const validateImport = async (file: File, token: string) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await clientAxios.post(`/import/validate`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const runImport = async (file: File, token: string, companyCode: string, onProgress?: (percent: number) => void) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("company_code", companyCode);

  const res = await clientAxios.post(`/import/run`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    onUploadProgress: (progressEvent) => {
      if (!progressEvent.total) return;

      const percent = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );

      onProgress?.(percent);
    },
  });

  return res.data;
};