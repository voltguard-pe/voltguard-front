// import { usersMock, type User } from "../shared/mocks/users.mock";
import clientAxios from '../shared/config/clientAxios'
import type { PageProps } from '../shared/types/PageProps';
import type { CreateUserDTO, UpdateUserDTO, UserProps } from '../shared/types/UserProps';

interface GetUsersParams {
  page?: number;
  size?: number;
}

//
// 🔹 PERFIL USUARIO AUTENTICADO
//

export const getMe = async (): Promise<UserProps> => {
  const { data } = await clientAxios.get<UserProps>('/users/me')
  return data
}

export const updateMe = async (
  formData: Partial<UpdateUserDTO>
): Promise<UserProps> => {
  const { data } = await clientAxios.put<UserProps>('/users/me', formData)
  return data
}

//
// 🔹 ADMIN
//

export const getAllUsers = async (params: GetUsersParams): Promise<PageProps<UserProps>> => {
  try {
    const { data } = await clientAxios.get<PageProps<UserProps>>('/users', {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 10
      }
    });
    return data;
  } catch (error) {
    throw new Error('Error al obtener todos los usuarios con paginación' + error);
  }
}

export const getUserById = async (id: number): Promise<UserProps> => {
  try {
    const { data } = await clientAxios.get<UserProps>(`/users/${id}`);
    return data;
  } catch (error) {
    throw new Error('Error al obtener el usuario por id' + error);
  }
}

export const createUser = async (formData: CreateUserDTO): Promise<UserProps> => {
  try {
    const { data } = await clientAxios.post<UserProps>('/users', formData);
    return data;
  } catch (error) {
    throw new Error('Error al crear el usuario' + error);
  }
}

export const updateUser = async (formData: Partial<UpdateUserDTO>): Promise<UserProps> => {
  try {
    const { data } = await clientAxios.put<UserProps>('/users/me', formData);
    return data;
  } catch (error) {
    throw new Error('Error al actualizar el usuario' + error);
  }
}

export const deleteUser = async (id: number): Promise<void> => {
  try {
    await clientAxios.delete(`/users/${id}`);
  } catch (error) {
    throw new Error('Error al eliminar el usuario' + error);
  }
}