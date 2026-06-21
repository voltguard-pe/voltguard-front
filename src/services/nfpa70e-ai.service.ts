import clientAxios from "../shared/config/clientAxios";

export const generateNfpaLabelsFromZip = async (
    file: File,
    token: string,
    companyCode: string
) => {
    const formData = new FormData();
    formData.append("file", file); // Archivo ZIP completo
    formData.append("companyCode", companyCode);

    const res = await clientAxios.post(`/nfpa70e/generate-label`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
    });

    return res.data;
};