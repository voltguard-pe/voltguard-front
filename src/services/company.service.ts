import clientAxios from "../shared/config/clientAxios";
import type {
  CompanyCreateDTO,
  CompanyOptionDTO,
  CompanyResponseDTO,
  CompanyUpdateDTO,
} from "../shared/types/CompanyProps";

export const getCompanies = async (): Promise<CompanyResponseDTO[]> => {
  const { data } = await clientAxios.get<CompanyResponseDTO[]>("/company");
  return data;
};

export const getCompanyByCode = async (publicCode: string): Promise<CompanyResponseDTO> => {
  const { data } = await clientAxios.get<CompanyResponseDTO>(`/company/${publicCode}`);
  return data;
};

export const createCompany = async (
  formData: CompanyCreateDTO
): Promise<CompanyResponseDTO> => {
  const { data } = await clientAxios.post<CompanyResponseDTO>("/company", formData);
  return data;
};

export const updateCompany = async (
  publicCode: string,
  formData: CompanyUpdateDTO
): Promise<CompanyResponseDTO> => {
  const { data } = await clientAxios.put<CompanyResponseDTO>(
    `/company/${publicCode}`,
    formData
  );
  return data;
};

export const deleteCompany = async (id: string): Promise<void> => {
  await clientAxios.delete(`/company/${id}`);
};

export const getCompanyOptions = async (): Promise<CompanyOptionDTO[]> => {
  const { data } = await clientAxios.get<CompanyOptionDTO[]>("/company");
  return data.map((company) => ({
    name: company.name,
    publicCode: company.publicCode,
  }));
};

export const publicGetCompanies = async (): Promise<CompanyOptionDTO[]> => {
  const { data } = await clientAxios.get<CompanyOptionDTO[]>("/company/public");
  return data;
};