import clientAxios from "../shared/config/clientAxios";
import type {
  BoardCreateDTO,
  BoardResponseDTO,
  BoardUpdateDTO,
  PublicBoardByCodeResponseDTO,
  PublicCompanyBoardsResponseDTO
} from "../shared/types/BoardProps";

// =========================
// 📥 GET BOARDS
// =========================
export const getBoards = async (
  publicCode: string
): Promise<{
  company: { name: string; publicCode: string };
  boards: BoardResponseDTO[];
}> => {
  const res = await clientAxios.get(
    `/board/${publicCode}`
  );
  return res.data;
};

// =========================
// 🆕 CREATE BOARD
// =========================
export const createBoard = async (data: BoardCreateDTO) => {
  const formData = new FormData();

  formData.append("boardCode", data.boardCode);
  formData.append("name", data.name);
  formData.append("type", data.type);
  formData.append("tensionNominal", String(data.tensionNominal));
  formData.append("numeroFases", String(data.numeroFases));
  formData.append("incluyeNeutro", String(data.incluyeNeutro));

  if (data.sistema) formData.append("sistema", data.sistema);
  if (data.estadoGeneral) formData.append("estadoGeneral", data.estadoGeneral);
  if (data.location) formData.append("location", data.location);
  if (data.description) formData.append("description", data.description);
  if (data.publicCode)
    formData.append("companyPublicCode", data.publicCode);

  // 🔥 circuits
  formData.append("circuits", JSON.stringify(data.circuits));

  // // 🔥 mainBreaker
  // if (data.mainBreaker) {
  //   formData.append("mainBreaker", JSON.stringify(data.mainBreaker));
  // }

  // // 🔥 proteccion
  // if (data.proteccion) {
  //   formData.append("proteccion", JSON.stringify(data.proteccion));
  // }

  // 🖼 imágenes
  data.unifilar?.forEach((file) =>
    formData.append("unifilar", file)
  );

  data.tablero?.forEach((file) =>
    formData.append("tablero", file)
  );

  data.termografia?.forEach((file) =>
    formData.append("termografia", file)
  );

  // 📄 documentos técnicos
  data.certificadosMantenimiento?.forEach((file) =>
    formData.append("certificadosMantenimiento", file)
  );

  data.certificadosOperatividad?.forEach((file) =>
    formData.append("certificadosOperatividad", file)
  );

  const res = await clientAxios.post("/board", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

// =========================
// 🔍 GET BOARD BY CODE
// =========================
export const getBoardByCode = async (
  publicCode: string,
  code: string
): Promise<BoardResponseDTO> => {
  const res = await clientAxios.get(
    `/board/${publicCode}/${code}`
  );
  return res.data;
};

// =========================
// ✏️ UPDATE BOARD
// =========================
export const updateBoard = async (
  publicCode: string,
  code: string,
  data: BoardUpdateDTO
) => {
  const formData = new FormData();

  if (data.boardCode !== undefined) formData.append("boardCode", data.boardCode);
  if (data.name !== undefined) formData.append("name", data.name);
  if (data.type !== undefined) formData.append("type", data.type);
  if (data.tensionNominal !== undefined)
    formData.append("tensionNominal", String(data.tensionNominal));
  if (data.numeroFases !== undefined)
    formData.append("numeroFases", String(data.numeroFases));
  if (data.incluyeNeutro !== undefined)
    formData.append("incluyeNeutro", String(data.incluyeNeutro));
  if (data.sistema !== undefined)
    formData.append("sistema", data.sistema);
  if (data.estadoGeneral !== undefined)
    formData.append("estadoGeneral", data.estadoGeneral);

  if (data.location !== undefined)
    formData.append("location", data.location || "");
  if (data.description !== undefined)
    formData.append("description", data.description || "");

  // 🔥 circuits
  if (data.circuits !== undefined) {
    formData.append("circuits", JSON.stringify(data.circuits));
  }

  // // 🔥 mainBreaker
  // if (data.mainBreaker !== undefined) {
  //   formData.append("mainBreaker", JSON.stringify(data.mainBreaker));
  // }

  // // 🔥 proteccion
  // if (data.proteccion !== undefined) {
  //   formData.append("proteccion", JSON.stringify(data.proteccion));
  // }

  // =========================
  // 📦 EXISTING IMAGES
  // =========================
  if (data.existingUnifilar)
    formData.append(
      "existingUnifilar",
      JSON.stringify(data.existingUnifilar)
    );

  if (data.existingTablero)
    formData.append(
      "existingTablero",
      JSON.stringify(data.existingTablero)
    );

  if (data.existingTermografia)
    formData.append(
      "existingTermografia",
      JSON.stringify(data.existingTermografia)
    );

  // =========================
  // 📦 EXISTING DOCUMENTS
  // =========================
  if (data.existingCertificadosMantenimiento)
    formData.append(
      "existingCertificadosMantenimiento",
      JSON.stringify(data.existingCertificadosMantenimiento)
    );

  if (data.existingCertificadosOperatividad)
    formData.append(
      "existingCertificadosOperatividad",
      JSON.stringify(data.existingCertificadosOperatividad)
    );

  // =========================
  // 🖼 NUEVAS IMÁGENES
  // =========================
  data.unifilar?.forEach((file) =>
    formData.append("unifilar", file)
  );

  data.tablero?.forEach((file) =>
    formData.append("tablero", file)
  );

  data.termografia?.forEach((file) =>
    formData.append("termografia", file)
  );

  // =========================
  // 📄 NUEVOS DOCUMENTOS
  // =========================
  data.certificadosMantenimiento?.forEach((file) =>
    formData.append("certificadosMantenimiento", file)
  );

  data.certificadosOperatividad?.forEach((file) =>
    formData.append("certificadosOperatividad", file)
  );

  const res = await clientAxios.put(
    `/board/${publicCode}/${code}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

// =========================
// 🗑 DELETE
// =========================
export const deleteBoard = async (
  publicCode: string,
  code: string
) => {
  const res = await clientAxios.delete(
    `/board/${publicCode}/${code}`
  );
  return res.data;
};

// =========================
// 🌐 PUBLIC
// =========================
export const publicGetCompanyBoards = async (
  publicCode: string
): Promise<PublicCompanyBoardsResponseDTO> => {
  const { data } = await clientAxios.get(
    `/board/public/company/${publicCode}`
  );
  return data;
};

export const publicGetCompanyBoardByCode = async (
  publicCode: string,
  code: string
): Promise<PublicBoardByCodeResponseDTO> => {
  const { data } = await clientAxios.get(
    `/board/public/${publicCode}/${code}`
  );
  return data;
};

export const getCompanyBoards = async (): Promise<{
  boards: BoardResponseDTO[];
}> => {
  const res = await clientAxios.get("/board");
  console.log(res)
  return res.data;
};

// =========================
// 📤 UPLOAD FILE
// =========================
export const uploadFile = async (
  file: File,
  userId: string
): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("userId", userId);

  const res = await clientAxios.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};