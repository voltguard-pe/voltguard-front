import clientAxios from "../shared/config/clientAxios";

export interface AnnualMeasurement {
  año: string;
  resistencia: number;
  fuga: number;
  diametro: number;
  ph: number;
  images?: {
    caja?: string;
    telurometro?: string;
    fuga?: string;
  };
  measuredAt?: string;
}

export interface SpatPozoItem {
  _id: string;
  companyPublicCode: string;
  pozoCode: string;
  name: string;
  location: string;
  certificateCode: string;
  measurements: AnnualMeasurement[];
}

export const importSpatZip = async (file: File, companyCode: string, location?: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("companyCode", companyCode);
  if (location) formData.append("defaultLocation", location);

  const { data } = await clientAxios.post("/spat/import-zip", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const getCompanyPozosList = async (companyPublicCode: string) => {
  const { data } = await clientAxios.get(`/spat/${companyPublicCode}/list`);
  return data;
};

export const getPozoDetails = async (companyPublicCode: string, pozoCode: string) => {
  const { data } = await clientAxios.get(`/spat/${companyPublicCode}/${pozoCode}`);
  return data;
};