import clientAxios from "../shared/config/clientAxios";

export interface VoltageEventItem {
  tipoEvento: string;
  horaInicio: string;
  duracionSegundos: number;
  fase: string;
  tensionResidual: number;
}

// Subir el archivo CSV exportado desde Metrel
export const uploadIticCsv = async (boardId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await clientAxios.post(`/voltage-events/${boardId}/upload-itic`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Obtener los eventos registrados del tablero
export const getIticEvents = async (boardId: string): Promise<{ success: boolean; events: VoltageEventItem[] }> => {
  const response = await clientAxios.get(`/voltage-events/${boardId}`);
  return response.data;
};