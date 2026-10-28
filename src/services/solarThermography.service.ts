import clientAxios from "../shared/config/clientAxios";

export interface SolarListItem {
  solarCode: string;
  title: string;
}

export interface Hotspot {
  id: string;
  panelId: string;
  cellLocation: string;
  x: number;
  y: number;
  tSpot: number;
  tNormal: number;
  deltaT: number;
  status: "CRITICAL" | "WARNING";
  visualCause: string;
  action: string;
}

export interface SolarInspectionData {
  id: string;
  companyPublicCode: string;
  solarCode: string;
  title: string;
  droneModel: string;
  thermalImageUrl: string;
  visualImageUrl: string;
  rows: number;
  cols: number;
  stats: {
    min: number;
    max: number;
    avg: number;
    deltaTMax: number;
    criticalHotspotsCount: number;
    warningHotspotsCount: number;
    panelsToReplaceCount: number;
  };
  hotspots: Hotspot[];
  technicalDiagnosis: string;
}

export const solarThermographyService = {
  // Lista para el Sidebar y para el dropdown de selector
  async getCompanySolarList(companyCode: string): Promise<SolarListItem[]> {
    const { data } = await clientAxios.get(`/solar-thermography/company/${companyCode}`);
    return data.data || [];
  },

  // Detalle de la inspección seleccionada
  async getSolarDetails(companyCode: string, solarCode?: string): Promise<SolarInspectionData | null> {
    const url = solarCode
      ? `/solar-thermography/${companyCode}/${solarCode}`
      : `/solar-thermography/${companyCode}`;
    const { data } = await clientAxios.get(url);
    return data.data || null;
  },

  // Matriz binaria para hover de temperatura
  async getThermalMatrix(companyCode: string, solarCode?: string): Promise<Float32Array> {
    const url = solarCode
      ? `/solar-thermography/${companyCode}/${solarCode}/matrix`
      : `/solar-thermography/${companyCode}/matrix`;
    const response = await clientAxios.get(url, { responseType: "arraybuffer" });
    return new Float32Array(response.data);
  },

  // Subida del modal (archivos separados)
  async uploadPackage(
    companyCode: string,
    csvFile: File,
    thermalImageFile?: File,
    visualImageFile?: File,
    title?: string,
    solarCode?: string
  ) {
    const formData = new FormData();
    formData.append("companyCode", companyCode);
    formData.append("csvFile", csvFile);
    if (title) formData.append("title", title);
    if (solarCode) formData.append("solarCode", solarCode);
    if (thermalImageFile) formData.append("thermalImage", thermalImageFile);
    if (visualImageFile) formData.append("visualImage", visualImageFile);

    const { data } = await clientAxios.post(
      `/solar-thermography/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data;
  },

  // Subida masiva mediante archivo ZIP (Estilo SPAT)
  async uploadPackageZip(
    companyCode: string,
    zipFile: File,
    title?: string,
    solarCode?: string
  ) {
    const formData = new FormData();
    formData.append("companyCode", companyCode);
    formData.append("zipFile", zipFile); // El archivo .zip
    if (title) formData.append("title", title);
    if (solarCode) formData.append("solarCode", solarCode);

    const { data } = await clientAxios.post(
      `/solar-thermography/upload`, // 👈 Apuntamos a la ruta que SÍ existe en tu backend
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data;
  },
};