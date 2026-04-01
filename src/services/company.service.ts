import clientAxios from "../shared/config/clientAxios";
import type { CompanyResponseDTO, PublicCompanyDTO } from "../shared/types/CompanyProps";
import type { PageProps } from "../shared/types/PageProps";

interface GetCompaniesParams {
  page?: number;
  size?: number;
}

export const publicGetCompanies = async (): Promise<PublicCompanyDTO[]> => {
  const { data } = await clientAxios.get<PublicCompanyDTO[]>("/company");
  return data;
};


export const getAllCompanies = async (params: GetCompaniesParams): Promise<PageProps<CompanyResponseDTO>> => {
  try {
    const { data } = await clientAxios.get<PageProps<CompanyResponseDTO>>('/company', {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 10
      }
    });
    return data;
  } catch (error) {
    throw new Error('Error al obtener todas las empresas con paginación' + error);
  }
}

export const deleteCompany = async () => {
  console.log("Eliminar empresa")
}