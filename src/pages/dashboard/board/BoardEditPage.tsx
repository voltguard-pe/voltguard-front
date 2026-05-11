import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import type { InsulationMeasurementRecord } from "../../../shared/types/BoardProps";

import { getBoardByCode, updateBoard } from "../../../services/board.service";

import { getCompanies } from "../../../services/company.service";

import {
  createBoardInsulationMeasurement,
  deleteBoardInsulationMeasurement,
  updateBoardInsulationMeasurement,
  type InsulationManualPayload,
} from "../../../services/insulation.service";

import type {
  BoardCircuit,
  BoardResponseDTO,
} from "../../../shared/types/BoardProps";

import type { CompanyResponseDTO } from "../../../shared/types/CompanyProps";
import type { BoardFormErrors, BoardFormValues } from "./BoardFormPage";
import BoardForm from "./BoardFormPage";

const initialValues: BoardFormValues = {
  boardCode: "",
  name: "",
  type: "",
  tensionNominal: undefined,
  numeroFases: undefined,
  incluyeNeutro: false,
  sistema: undefined,
  estadoGeneral: undefined,
  location: "",
  description: "",
  company: "",
  circuits: [],
  unifilar: [],
  tablero: [],
  termografia: [],
  existingUnifilar: [],
  existingTablero: [],
  existingTermografia: [],
};

const initialInsulationValues: InsulationManualPayload = {
  measurement_l1_g: null,
  measurement_l2_g: null,
  measurement_l3_g: null,
};

const EditBoardPage = () => {
  const { publicCode, code } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState<BoardResponseDTO | null>(null);
  const [values, setValues] = useState<BoardFormValues>(initialValues);
  const [companies, setCompanies] = useState<CompanyResponseDTO[]>([]);
  const [errors, setErrors] = useState<BoardFormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [insulationValues, setInsulationValues] =
    useState<InsulationManualPayload>(initialInsulationValues);

  const [savingInsulation, setSavingInsulation] = useState(false);
  const [deletingInsulation, setDeletingInsulation] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!publicCode || !code) {
        toast.error("Datos del tablero inválidos");
        navigate("/dashboard/boards");
        return;
      }

      try {
        const [boardData, companiesData] = await Promise.all([
          getBoardByCode(publicCode, code),
          getCompanies(),
        ]);

        setBoard(boardData);
        setCompanies(companiesData);

        const companyPublicCode =
          typeof boardData.company === "object"
            ? boardData.company.publicCode ?? ""
            : boardData.company ?? publicCode;

        setValues({
          boardCode: boardData.boardCode || "",
          name: boardData.name || "",
          type: boardData.type || "",
          tensionNominal: boardData.tensionNominal,
          numeroFases: boardData.numeroFases,
          incluyeNeutro: boardData.incluyeNeutro || false,
          sistema: boardData.sistema,
          estadoGeneral: boardData.estadoGeneral,
          location: boardData.location || "",
          description: boardData.description || "",
          company: companyPublicCode,
          circuits: boardData.circuits || [],
          unifilar: [],
          tablero: [],
          termografia: [],
          existingUnifilar: boardData.images?.unifilar || [],
          existingTablero: boardData.images?.tablero || [],
          existingTermografia: boardData.images?.termografia || [],
        });

        const insulationRecords = boardData.insulationMeasurements || [];
        const latestInsulation =
          insulationRecords.length > 0
            ? insulationRecords[insulationRecords.length - 1]
            : null;

        const latestRow = latestInsulation?.rows?.[0];

        setInsulationValues({
          measurement_l1_g: latestRow?.measurement_l1_g ?? null,
          measurement_l2_g: latestRow?.measurement_l2_g ?? null,
          measurement_l3_g: latestRow?.measurement_l3_g ?? null,
        });
      } catch (error) {
        console.error(error);
        toast.error("Error cargando tablero");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [publicCode, code, navigate]);

  const hasInsulationMeasurement = Boolean(
    board?.insulationMeasurements?.length
  );

  const isMonofasicBoard =
    values.sistema === "MONOFASICO" || Number(values.numeroFases) < 3;

  const handleChange = <K extends keyof BoardFormValues>(
    key: K,
    value: BoardFormValues[K]
  ) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (key === "sistema" && value === "MONOFASICO") {
      setInsulationValues((prev) => ({
        ...prev,
        measurement_l3_g: null,
      }));
    }

    if (key === "numeroFases" && Number(value) < 3) {
      setInsulationValues((prev) => ({
        ...prev,
        measurement_l3_g: null,
      }));
    }
  };

  const handleCircuitChange = (
    index: number,
    field: keyof BoardCircuit,
    value: any
  ) => {
    setValues((prev) => {
      const updated = [...prev.circuits];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...prev,
        circuits: updated,
      };
    });
  };

  const addCircuit = () => {
    setValues((prev) => ({
      ...prev,
      circuits: [
        ...prev.circuits,
        {
          circuito: "",
          descripcion: "",
          tipo: null,
        },
      ],
    }));
  };

  const removeCircuit = (index: number) => {
    setValues((prev) => ({
      ...prev,
      circuits: prev.circuits.filter((_, i) => i !== index),
    }));
  };

  const handleInsulationChange = (
    key: keyof InsulationManualPayload,
    value: string
  ) => {
    if (key === "measurement_l3_g" && isMonofasicBoard) {
      setInsulationValues((prev) => ({
        ...prev,
        measurement_l3_g: null,
      }));
      return;
    }

    const parsedValue = value === "" ? null : Number(value);

    if (Number.isNaN(parsedValue)) return;

    setInsulationValues((prev) => ({
      ...prev,
      [key]: parsedValue,
    }));
  };

  const handleSaveInsulation = async () => {
    if (!code) return;

    try {
      setSavingInsulation(true);

      const payload: InsulationManualPayload = {
        measurement_l1_g: insulationValues.measurement_l1_g,
        measurement_l2_g: insulationValues.measurement_l2_g,
        measurement_l3_g: isMonofasicBoard
          ? null
          : insulationValues.measurement_l3_g,
      };

      const response = hasInsulationMeasurement
        ? await updateBoardInsulationMeasurement(code, payload)
        : await createBoardInsulationMeasurement(code, payload);

      setBoard((prev) => {
        if (!prev) return prev;

        const previousMeasurements = prev.insulationMeasurements || [];

        const updatedMeasurements = hasInsulationMeasurement
          ? previousMeasurements.map((measurement, index) =>
              index === previousMeasurements.length - 1
                ? response.data.measurement
                : measurement
            )
          : [...previousMeasurements, response.data.measurement];

        return {
          ...prev,
          insulationMeasurements: updatedMeasurements,
        };
      });

      toast.success(
        hasInsulationMeasurement
          ? "Mediciones de aislamiento actualizadas"
          : "Tabla de aislamiento registrada"
      );
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Error guardando mediciones de aislamiento"
      );
    } finally {
      setSavingInsulation(false);
    }
  };

  const handleDeleteInsulation = async () => {
    if (!code) return;

    const confirmDelete = confirm(
      "¿Eliminar la tabla de mediciones de aislamiento?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingInsulation(true);

      await deleteBoardInsulationMeasurement(code);

      setBoard((prev) =>
        prev
          ? {
              ...prev,
              insulationMeasurements: [],
            }
          : prev
      );

      setInsulationValues(initialInsulationValues);

      toast.success("Tabla de aislamiento eliminada");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Error eliminando mediciones de aislamiento"
      );
    } finally {
      setDeletingInsulation(false);
    }
  };

  const validate = () => {
    const newErrors: BoardFormErrors = {};

    if (!values.boardCode.trim()) {
      newErrors.boardCode = "El código es obligatorio";
    }

    if (!values.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!values.type.trim()) {
      newErrors.type = "El tipo es obligatorio";
    }

    if (!values.tensionNominal || values.tensionNominal <= 0) {
      newErrors.tensionNominal = "Debe ser mayor a 0";
    }

    if (!values.numeroFases || values.numeroFases <= 0) {
      newErrors.numeroFases = "Debe ser mayor a 0";
    }

    if (!values.company) {
      newErrors.company = "Selecciona una empresa";
    }

    if (!values.circuits.length) {
      newErrors.circuits = "Debe agregar al menos un circuito";
    } else {
      const circuitsDetail: BoardFormErrors["circuitsDetail"] = [];
      let hasCircuitErrors = false;

      values.circuits.forEach((circuit, index) => {
        const error: { circuito?: string; descripcion?: string } = {};

        if (!circuit.circuito?.trim()) {
          error.circuito = "Código requerido";
          hasCircuitErrors = true;
        }

        if (!circuit.descripcion?.trim()) {
          error.descripcion = "Descripción requerida";
          hasCircuitErrors = true;
        }

        circuitsDetail[index] = error;
      });

      if (hasCircuitErrors) {
        newErrors.circuitsDetail = circuitsDetail;
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const cleanData = () => ({
    boardCode: values.boardCode.trim(),
    name: values.name.trim(),
    type: values.type.trim(),
    tensionNominal: values.tensionNominal,
    numeroFases: values.numeroFases,
    incluyeNeutro: values.incluyeNeutro,
    sistema: values.sistema || undefined,
    estadoGeneral: values.estadoGeneral || undefined,
    location: values.location.trim(),
    description: values.description.trim(),
    circuits: values.circuits
      .filter((circuit) => circuit.circuito || circuit.descripcion)
      .map((circuit) => ({
        circuito: circuit.circuito,
        descripcion: circuit.descripcion,
        tipo: circuit.tipo ?? null,
      })),
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!publicCode || !code) return;

    if (!validate()) return;

    try {
      setSaving(true);

      await updateBoard(publicCode, code, {
        ...cleanData(),
        existingUnifilar: values.existingUnifilar,
        existingTablero: values.existingTablero,
        existingTermografia: values.existingTermografia,
        unifilar: values.unifilar,
        tablero: values.tablero,
        termografia: values.termografia,
      });

      toast.success("Tablero actualizado correctamente");

      navigate(-1);
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar tablero");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BoardForm
      mode="edit"
      values={values}
      errors={errors}
      companies={companies}
      loading={loading}
      saving={saving}
      selectedImage={selectedImage}
      onSelectedImageChange={setSelectedImage}
      onChange={handleChange}
      onCircuitChange={handleCircuitChange}
      onAddCircuit={addCircuit}
      onRemoveCircuit={removeCircuit}
      onSubmit={handleSubmit}
      onCancel={() => navigate(-1)}
      insulationValues={insulationValues}
      hasInsulationMeasurement={hasInsulationMeasurement}
      isMonofasicBoard={isMonofasicBoard}
      savingInsulation={savingInsulation}
      deletingInsulation={deletingInsulation}
      onInsulationChange={handleInsulationChange}
      onSaveInsulation={handleSaveInsulation}
      onDeleteInsulation={handleDeleteInsulation}
    />
  );
};

export default EditBoardPage;