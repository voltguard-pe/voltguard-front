import clientAxios from "../shared/config/clientAxios";

// El mapa base por día y hora se mantiene igual
export interface DayTimeMap {
  [timeKey: string]: number;
}

/**
 * Nueva interfaz unificada que mapea la respuesta enriquecida del Backend
 */
export interface DemandChartDataResponse {
  agrupado: { [dayKey: string]: DayTimeMap };            // Potencia Activa (kW)
  agrupadoReactivaInd: { [dayKey: string]: DayTimeMap }; // Reactiva Inductiva (kvar)
  agrupadoReactivaCap: { [dayKey: string]: DayTimeMap }; // Reactiva Capacitiva (kvar)
  minFecha: string;
  maxFecha: string;
}

/**
 * Obtiene los registros de demanda (kW) y reactivas (kvar) agrupados por fecha/día
 */
export const getDemandChartData = async (
  boardId: string, 
  fechaInicio?: string, 
  fechaFin?: string
): Promise<DemandChartDataResponse> => {
  const response = await clientAxios.get<DemandChartDataResponse>(
    `/mediciones/chart-data/${boardId}`,
    {
      params: { fechaInicio, fechaFin }
    }
  );
  return response.data;
};

/**
 * Envía el archivo CSV extraído de Metrel para ser guardado en la BD
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