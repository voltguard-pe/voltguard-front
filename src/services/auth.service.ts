import clientAxios from '../shared/config/clientAxios'

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    company: string;
    ruc: string;
    cargo: string;
    phone: string;
    referralSource: string;
}

export const registerUser = async (data: RegisterData) => {
    try {
        const response = await clientAxios.post('/auth/register', data);
        return response.data;
    } catch (error: any) {
        console.error("REGISTER ERROR:", error);
        throw new Error(error.response?.data?.message || 'Error al registrar el usuario');
    }
};

export const verifyEmailToken = async (token: string) => {
    try {
        const response = await clientAxios.get(`/auth/verify-email/${token}`);
        return response.data;
    } catch (error: any) {
        console.error("VERIFY EMAIL ERROR:", error);
        throw new Error(error.response?.data?.message || 'El enlace de verificación es inválido o ha expirado.');
    }
};
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
        const response = await clientAxios.get('/user/profile')
        return response.data
    } catch (error) {
        throw new Error('Error al ver perfil' + error)
    }
}

// export const forgotPassword = async (email: string) => {
//     const { data } = await clientAxios.post(`/auth/forgot-password?email=${encodeURIComponent(email)}`)
//     return data
// }

// export const resetPassword = async (token: string, newPassword: string) => {
//     try {
//         await clientAxios.post('/auth/reset-password', {
//             token,
//             newPassword
//         })
//     } catch (error) {
//         throw new Error('No se pudo cambiar la contraseña' + error)
//     }
// }

// Ajusta estas dos funciones en tu archivo de servicios en el FRONTEND

export const forgotPassword = async (email: string) => {
  try {
    // Se envía como objeto JSON en el BODY, no como query param
    const { data } = await clientAxios.post('/auth/forgot-password', { email });
    return data; // Devolverá { message, cooldownSeconds }
  } catch (error: any) {
    console.error("FORGOT PASSWORD ERROR:", error);
    throw error; // Lanzamos el error original para que el catch del componente capture AxiosError ( status 429 )
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    // Enviamos el token y la nueva contraseña en el body
    const { data } = await clientAxios.post('/auth/reset-password', {
      token,
      newPassword
    });
    return data;
  } catch (error: any) {
    console.error("RESET PASSWORD ERROR:", error);
    throw new Error(error.response?.data?.message || 'No se pudo cambiar la contraseña');
  }
};