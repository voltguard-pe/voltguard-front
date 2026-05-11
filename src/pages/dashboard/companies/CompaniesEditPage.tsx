import {
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

import { useEffect, useState } from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { toast } from "react-toastify";

import {
  getCompanyByCode,
  updateCompany,
} from "../../../services/company.service";
import type { CompaniesFormData } from "./CompaniesFormPage";
import CompaniesFormPage from "./CompaniesFormPage";


const CompaniesEditPage = () => {
  const { publicCode } =
    useParams<{
      publicCode: string;
    }>();

  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [company, setCompany] =
    useState<CompaniesFormData | null>(null);

  useEffect(() => {
    if (!publicCode) {
      setLoading(false);
      return;
    }

    const fetchCompany = async () => {
      try {
        const data =
          await getCompanyByCode(
            publicCode
          );

        setCompany({
          name: data.name || "",
          ruc: data.ruc || "",
        });
      } catch (error) {
        console.error(error);

        toast.error(
          "Error cargando empresa"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [publicCode]);

  const handleSubmit = async (
    data: CompaniesFormData
  ) => {
    if (!publicCode) return;

    try {
      setSaving(true);

      await updateCompany(
        publicCode,
        {
          name: data.name,
          ruc: data.ruc,
        }
      );

      toast.success(
        "Empresa actualizada correctamente"
      );

      navigate("/dashboard/companies");
    } catch (error) {
      console.error(error);

      toast.error(
        "Error actualizando empresa"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl space-y-6">
        <div className="h-10 w-32 animate-pulse rounded-2xl bg-slate-200" />

        <div className="h-20 animate-pulse rounded-3xl bg-slate-200" />

        <div className="h-[320px] animate-pulse rounded-3xl bg-slate-200" />
      </section>
    );
  }

  if (!company) {
    return (
      <section className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">
          Empresa no encontrada
        </div>
      </section>
    );
  }

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
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#8ccf2f]/15 text-[#3aaa35]">
          <ShieldCheck size={24} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Editar empresa
          </h1>

          <p className="text-sm text-slate-500">
            Modifica la información de la
            empresa.
          </p>
        </div>
      </div>

      <CompaniesFormPage
        mode="edit"
        loading={saving}
        initialValues={company}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
      />
    </section>
  );
};

export default CompaniesEditPage;