import clientAxios from "../shared/config/clientAxios";
import type { CreateUserDTO, UpdateUserDTO, UserProps } from "../shared/types/UserProps";


/**
 * 🔹 PERFIL USUARIO AUTENTICADO
 */
export const updateMe = async (
  formData: Partial<UpdateUserDTO>
): Promise<UserProps> => {
  const { data } = await clientAxios.put<UserProps>("/admin/profile", formData);
  return data;
};

export const getAdmins = async (): Promise<UserProps[]> => {
  try {
    const { data } = await clientAxios.get<UserProps[]>("/admin");
    return data;
  } catch (error) {
    throw new Error("Error al obtener administradores: " + error);
  }
};

export const updateUser = async (
  id: string,
  formData: Partial<UpdateUserDTO>
): Promise<UserProps> => {
  try {
    const { data } = await clientAxios.put<UserProps>(`/admin/${id}`, formData);
    return data;
  } catch (error) {
    throw new Error("Error al actualizar el usuario: " + error);
  }
};


/**
 * 🔹 CRUD DE ADMINS (solo SUPERADMIN)
 */
export const getAllUsers = async (): Promise<UserProps[]> => {
  try {
    const { data } = await clientAxios.get<UserProps[]>("/admin/all");
    return data;
  } catch (error) {
    throw new Error("Error al obtener usuarios: " + error);
  }
};

export const getUserById = async (id: string): Promise<UserProps> => {
  try {
    const { data } = await clientAxios.get<UserProps>(`/admin/${id}`);
    return data;
  } catch (error) {
    throw new Error("Error al obtener el administrador por id: " + error);
  }
};

export const createUser = async (formData: CreateUserDTO): Promise<UserProps> => {
  try {
    const { data } = await clientAxios.post<UserProps>("/admin", formData);
    return data;
  } catch (error) {
    throw new Error("Error al crear el administrador: " + error);
  }
};

export const updateAdmin = async (
  id: string,
  formData: Partial<UpdateUserDTO>
): Promise<UserProps> => {
  try {
    const { data } = await clientAxios.put<UserProps>(`/admin/${id}`, formData);
    return data;
  } catch (error) {
    throw new Error("Error al actualizar el administrador: " + error);
  }
};

export const getAdminById = async (id: string): Promise<UserProps> => {
  try {
    const { data } = await clientAxios.get<UserProps>(`/admin/${id}`);
    return data;
  } catch (error) {
    throw new Error("Error al obtener el administrador: " + error);
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    await clientAxios.delete(`/admin/${id}`);
  } catch (error) {
    throw new Error("Error al eliminar el administrador: " + error);
  }
};