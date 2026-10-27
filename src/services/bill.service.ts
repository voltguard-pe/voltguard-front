import clientAxios from "../shared/config/clientAxios";

export interface BillRatesResponse {
  success: boolean;
  message?: string;
  data: {
    tarifaHP: number;
    tarifaFP: number;
  };
}

export const uploadReceiptBill = async (
  boardId: string,
  receiptFile: File
): Promise<BillRatesResponse> => {
  const formData = new FormData();
  formData.append("receiptFile", receiptFile);

  const { data } = await clientAxios.post(
    `/bill/${boardId}/extract-rates`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
};