import clientAxios from "../shared/config/clientAxios";

export interface ThermographyStats {
  min: number;
  max: number;
  avg: number;
  deltaT: number;
  maxPos: [number, number];
  minPos: [number, number];
  severity: "NORMAL" | "MONITOREO" | "INTERVENCION_PROXIMA" | "CRITICO";
}

export interface ThermographyData {
  id: string;
  rows: number;
  cols: number;
  originalImageUrl?: string;
  stats: ThermographyStats;
}

// Subir CSV e imagen de termografía
export const uploadThermographyPackage = async (
  boardId: string,
  csvFile: File,
  thermalImageFile: File | null,
  visualImageFile: File | null
) => {
  const formData = new FormData();
  formData.append("csvFile", csvFile);
if (thermalImageFile) {
    formData.append("thermalImage", thermalImageFile);
  }
  if (visualImageFile) {
    formData.append("visualImage", visualImageFile);
  }

  const { data } = await clientAxios.post(`/thermography/${boardId}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Obtener datos y métricas
export const getThermographyInfo = async (boardId: string) => {
  const { data } = await clientAxios.get(`/thermography/${boardId}`);
  return data;
};

// Descargar matriz binaria ultrarrápida (ArrayBuffer -> Float32Array)
export const fetchThermalMatrix = async (boardId: string) => {
  const response = await clientAxios.get(`/thermography/${boardId}/matrix`, {
    responseType: "arraybuffer",
  });

  const rows = parseInt(response.headers["x-rows"] || "0", 10) || 480;
  const cols = parseInt(response.headers["x-cols"] || "0", 10) || 640;
  const floatArray = new Float32Array(response.data);

  return {
    matrix: floatArray,
    rows,
    cols,
  };
};