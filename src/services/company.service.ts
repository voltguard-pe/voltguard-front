import clientAxios from "../shared/config/clientAxios";
import type { PublicCompanyDTO } from "../shared/types/CompanyProps";

export const publicGetCompanies = async (): Promise<PublicCompanyDTO[]> => {
  const { data } = await clientAxios.get<PublicCompanyDTO[]>("/company");
  return data;
};