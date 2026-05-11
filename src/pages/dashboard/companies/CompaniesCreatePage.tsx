import {
  ArrowLeft,
  Building2,
} from "lucide-react";

import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import { createCompany } from "../../../services/company.service";
import type { CompaniesFormData } from "./CompaniesFormPage";
import CompaniesFormPage from "./CompaniesFormPage";


const CompaniesCreatePage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    data: CompaniesFormData
  ) => {
    try {
      setLoading(true);

      await createCompany({
        name: data.name,
        ruc: data.ruc,
      });

      toast.success(
        "Empresa creada correctamente"
      );

      navigate("/dashboard/companies");
    } catch (error) {
      console.error(error);

      toast.error(
        "Error al crear empresa"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <ArrowLeft size={18} />
        Volver
      </button>

      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
          <Building2 size={24} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Crear empresa
          </h1>

          <p className="text-sm text-slate-500">
            Registra una nueva empresa en
            Voltguard.
          </p>
        </div>
      </div>

      <CompaniesFormPage
        mode="create"
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
      />
    </section>
  );
};

export default CompaniesCreatePage;