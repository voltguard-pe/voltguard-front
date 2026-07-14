import clientAxios from "../shared/config/clientAxios";

/**
 * Interfaz para definir el mapa de demanda que retorna el backend agrupado por días
 * Ejemplo: { "2026-06-20 (Sábado)": { "21:18": 4.98 }, ... }
 */
export interface DemandChartDataResponse {
  [dayKey: string]: {
    [timeKey: string]: number;
  };
}

/**
 * Obtiene los registros de demanda calculados en kW y agrupados por fecha/día
 * @param boardId Identificador único del tablero en MongoDB
 */
export const getDemandChartData = async (
  boardId: string, 
  fechaInicio?: string, 
  fechaFin?: string
): Promise<DemandChartDataResponse> => {
  const response = await clientAxios.get<DemandChartDataResponse>(
    `/mediciones/chart-data/${boardId}`,
    {
      params: { fechaInicio, fechaFin } // Inyecta dinámicamente los filtros en la URL
    }
  );
  return response.data;
};

/**
 * Envía el archivo CSV extraído de Metrel para ser procesado por OpenAI y guardado en la BD
 * @param boardId Identificador único del tablero en MongoDB
 * @param file Archivo binario CSV (.Mediciones.csv)
 */
export const uploadMetrelCsv = async (boardId: string, file: File): Promise<{ success: boolean; count: number }> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await clientAxios.post<{ success: boolean; count: number }>(
    `/mediciones/import-metrel/${boardId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};