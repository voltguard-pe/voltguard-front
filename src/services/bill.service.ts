import clientAxios from "../shared/config/clientAxios";

export interface BillRatesResponse {
  success: boolean;
  message?: string;
  data: {
    tarifaHP: number;
    tarifaFP: number;
    history?: any[];
    historyOk?: boolean;
    totalActual?: number | null;
    factorFactura?: number | null;
    ahorroMeta?: number | null;
    warning?: string | null;
  };
}

export interface AhorroMetaResponse {
  success: boolean;
  ahorroMeta: number;
}

// Sube el recibo de luz. La meta de ahorro (%) viaja junto con el archivo
// y el backend la guarda en el tablero.
export const uploadReceiptBill = async (
  boardId: string,
  receiptFile: File,
  ahorroMeta?: number
): Promise<BillRatesResponse> => {
  const formData = new FormData();
  formData.append("receiptFile", receiptFile);
  if (ahorroMeta !== undefined) {
    formData.append("ahorroMeta", String(ahorroMeta));
  }

  const { data } = await clientAxios.post(
    `/bill/${boardId}/extract-rates`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
};

// Actualiza solo la meta de ahorro, sin volver a subir el recibo.
export const updateAhorroMeta = async (
  boardId: string,
  ahorroMeta: number
): Promise<AhorroMetaResponse> => {
  const { data } = await clientAxios.post(`/bill/${boardId}/ahorro-meta`, {
  ahorroMeta,
  });
  return data;
};
