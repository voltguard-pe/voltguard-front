import type { CompanyResponseDTO } from "./CompanyProps";

export type ImportUnifilarBoardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  companies: CompanyResponseDTO[];
  onSuccess: () => void;
};