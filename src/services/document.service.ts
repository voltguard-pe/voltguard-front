import clientAxios from "../shared/config/clientAxios";
import type { DocumentResponseDTO, UploadDocumentsDTO } from "../shared/types/BoardProps";

export const uploadCompanyDocuments = async (
  data: UploadDocumentsDTO,
  onProgress?: (percent: number) => void // 👈 Agregamos el callback de progreso
): Promise<{ message: string; documents: DocumentResponseDTO[] }> => {
  const formData = new FormData();
  formData.append("companyPublicCode", data.companyPublicCode);
  formData.append("uploadedBy", data.uploadedBy);

  data.files.forEach((file) => formData.append("files", file));

  // if (data.types) {
  //   data.types.forEach((type) => formData.append("types", type));
  // }

  const res = await clientAxios.post("/document", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent); // 👈 Ejecuta la función del componente
      }
    },
  });
  return res.data;
};

export const getDocumentsByCompany = async (companyPublicCode: string): Promise<DocumentResponseDTO[]> => {
  const res = await clientAxios.get(`/document/company/${companyPublicCode}`);
  return res.data;
};

export const deleteDocument = async (id: string): Promise<{ message: string }> => {
  const res = await clientAxios.delete(`/document/${id}`);
  return res.data;
};

export const getDocumentById = async (documentId: string): Promise<DocumentResponseDTO> => {
  const { data } = await clientAxios.get(`/document/${documentId}`);
  return data;
};

// ── INFORMES ──
export const getReportsByCompany = async (companyPublicCode: string): Promise<DocumentResponseDTO[]> => {
  const res = await clientAxios.get(`/reports/company/${companyPublicCode}`);
  return res.data;
};

export const getReportById = async (id: string): Promise<DocumentResponseDTO> => {
  const res = await clientAxios.get(`/reports/${id}`);
  return res.data;
};

export const uploadReport = async (
  companyPublicCode: string,
  title: string,
  file: File
): Promise<DocumentResponseDTO> => {
  const formData = new FormData();
  formData.append("companyPublicCode", companyPublicCode);
  formData.append("title", title);
  formData.append("file", file);

  const res = await clientAxios.post("/reports", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteReport = async (id: string): Promise<{ message: string }> => {
  const res = await clientAxios.delete(`/reports/${id}`);
  return res.data;
};