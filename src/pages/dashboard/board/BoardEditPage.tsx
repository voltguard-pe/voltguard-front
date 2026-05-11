import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";


import {
  getBoardByCode,
  updateBoard,
} from "../../../services/board.service";

import { getCompanies } from "../../../services/company.service";

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

const EditBoardPage = () => {
  const { publicCode, code } = useParams();
  const navigate = useNavigate();

  const [, setBoard] = useState<BoardResponseDTO | null>(null);
  const [values, setValues] = useState<BoardFormValues>(initialValues);
  const [companies, setCompanies] = useState<CompanyResponseDTO[]>([]);
  const [errors, setErrors] = useState<BoardFormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
      } catch (error) {
        console.error(error);
        toast.error("Error cargando tablero");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [publicCode, code, navigate]);

  const handleChange = <K extends keyof BoardFormValues>(
    key: K,
    value: BoardFormValues[K]
  ) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
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
    />
  );
};

export default EditBoardPage;