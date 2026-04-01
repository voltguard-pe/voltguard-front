import clientAxios from '../shared/config/clientAxios'

export interface LoginData {
    email: string;
    password: string;
}

export interface User {
    id: string;
    name: string;
    role: "SUPERADMIN" | "ADMIN" | "USER";
}

export const login = async (data: LoginData) => {
    try {
        console.log("Data enviada", data)
        const response = await clientAxios.post('/auth/login', data)
        console.log("Respuesta", response)
        return response
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        throw new Error('Error al iniciar sesión')
    }
}

export const logout = async () => {
    try {
        await clientAxios.post('/auth/logout')
    } catch (error) {
        throw new Error('Error al cerrar sesión' + error)
    }
}

export const getProfile = async () => {
    try {
        const response = await clientAxios.get('/auth/profile')
        return response.data
    } catch (error) {
        throw new Error('Error al ver perfil' + error)
    }
}

export const forgotPassword = async (email: string) => {
    const { data } = await clientAxios.post(`/auth/forgot-password?email=${encodeURIComponent(email)}`)
    return data
}

export const resetPassword = async (token: string, newPassword: string) => {
    try {
        await clientAxios.post('/auth/reset-password', {
            token,
            newPassword
        })
    } catch (error) {
        throw new Error('No se pudo cambiar la contraseña' + error)
    }
}