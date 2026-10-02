import React, { useState } from "react";
import { ThermographyViewer } from "./ThermographyViewer";
import { ImportThermographyModal } from "../modals/ImportThermographyModal";

interface ThermographySectionProps {
  boardId: string;
  originalImageUrl?: string;
  title?: string;
}

export const ThermographySection: React.FC<ThermographySectionProps> = ({
  boardId,
  originalImageUrl,
  title = "Inspección Termográfica Radiométrica (NFPA 70B)",
}) => {
  const [showModal, setShowModal] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const handleSuccess = () => {
    setReloadKey((prev) => prev + 1);
  };

  return (
    <>
      <ThermographyViewer
        boardId={boardId}
        title={title}
        originalImageUrl={originalImageUrl}
        onOpenImportModal={() => setShowModal(true)}
        reloadKey={reloadKey}
      />

      <ImportThermographyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        boardId={boardId}
        onSuccess={handleSuccess}
      />
    </>
  );
};