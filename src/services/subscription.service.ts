import clientAxios from '../shared/config/clientAxios'

export const subscription = async (userId: string, chosenPlan: string) => {
    try {
        const response = await clientAxios.put('/subscription', {
            userId,
            chosenPlan
        });
        console.log("Respuesta", response)
        return response
    } catch (error) {
        console.error("Error", error);
        throw new Error('Error al iniciar sesión')
    }
}