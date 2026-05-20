import clientAxios from "../shared/config/clientAxios";

import type {
    InsulationMeasurementRecord,
    InsulationMeasurementRow
} from "../shared/types/BoardProps";

export interface InsulationValidationBoard {
    boardCode: string;
    existsInDb: boolean;
    boardImages: string[];
}

export interface InsulationValidationResponse {
    ok: boolean;
    companyPublicCode: string;
    totalBoardsDetected: number;
    errors: string[];
    warnings: string[];
    boards: InsulationValidationBoard[];
}

export interface InsulationImportResult {
    boardCode: string;
    boardId: string;
    measurementId: string | null;
    totalRows: number;
    warnings: string[];
    table?: {
        boardCode: string;
        unit: "MΩ";
        rows: InsulationMeasurementRow[];
        warnings: string[];
        summary: string;
    };
}

export interface InsulationImportResponse {
    ok: boolean;
    message: string;
    companyPublicCode: string;
    batchCode: string;
    processed: number;
    errors: {
        boardCode: string;
        error: string;
    }[];
    results: InsulationImportResult[];
}

export interface InsulationManualPayload {
    description: string;
    measurement_l1_g: number | null;
    measurement_l2_g: number | null;
    measurement_l3_g: number | null;
}

export interface InsulationManualResponse {
    ok: boolean;
    message: string;
    data: {
        boardId: string;
        code: string;
        boardCode: string;
        sistema?: "MONOFASICO" | "TRIFASICO";
        numeroFases?: number;
        bloqueaFase3Tierra: boolean;
        measurement: InsulationMeasurementRecord;
    };
}

export interface InsulationDeleteResponse {
    ok: boolean;
    message: string;
    data: {
        boardId: string;
        code: string;
        boardCode: string;
        remainingMeasurements: number;
    };
}

// =========================
// ZIP IA
// =========================
export const validateInsulationZip = async (
    file: File,
    companyCode: string
): Promise<InsulationValidationResponse> => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("companyCode", companyCode);

    const { data } = await clientAxios.post<InsulationValidationResponse>(
        "/insulation/zip/validate",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return data;
};

export const runInsulationZip = async (
    file: File,
    companyCode: string
): Promise<InsulationImportResponse> => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("companyCode", companyCode);

    const { data } = await clientAxios.post<InsulationImportResponse>(
        "/insulation/zip/run",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return data;
};

// =========================
// MANUAL
// =========================
export const createBoardInsulationMeasurement = async (
    code: string,
    payload: InsulationManualPayload
): Promise<InsulationManualResponse> => {
    const { data } = await clientAxios.post<InsulationManualResponse>(
        `/insulation/boards/${code}/measurements`,
        payload
    );

    return data;
};

export const updateBoardInsulationMeasurement = async (
    code: string,
    payload: InsulationManualPayload
): Promise<InsulationManualResponse> => {
    const { data } = await clientAxios.patch<InsulationManualResponse>(
        `/insulation/boards/${code}/measurements`,
        payload
    );

    return data;
};

export const deleteBoardInsulationMeasurement = async (
    code: string
): Promise<InsulationDeleteResponse> => {
    const { data } = await clientAxios.delete<InsulationDeleteResponse>(
        `/insulation/boards/${code}/measurements`
    );

    return data;
};