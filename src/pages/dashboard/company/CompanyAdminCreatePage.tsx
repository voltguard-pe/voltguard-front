import {
  ArrowLeft,
  UserPlus,
} from "lucide-react";

import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import clientAxios from "../../../shared/config/clientAxios";

import { createUser } from "../../../services/users.service";
import AdminFormPage, { type AdminFormData } from "./AdminFormPage";


type Company = {
  name: string;
  publicCode: string;
};

const CompanyAdminCreatePage = () => {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState<
    Company[]
  >([]);

  const [loading, setLoading] = useState(false);

  const [fetchingCompanies, setFetchingCompanies] =
    useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data } =
          await clientAxios.get<Company[]>(
            "/company"
          );

        setCompanies(data);
      } catch (error) {
        console.error(error);

        toast.error(
          "Error cargando empresas"
        );
      } finally {
        setFetchingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleSubmit = async (
    data: AdminFormData
  ) => {
    try {
      setLoading(true);

      await createUser({
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        password: data.password ?? "",
        companyPublicCode:
          data.companyPublicCode,
      });

      toast.success(
        "Administrador creado correctamente"
      );

      navigate("/dashboard/admins");
    } catch (error) {
      console.error(error);

      toast.error(
        "Error al crear administrador"
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCompanies) {
    return (
      <section className="mx-auto max-w-4xl space-y-6">
        <div className="h-10 w-32 animate-pulse rounded-2xl bg-slate-200" />

        <div className="h-20 animate-pulse rounded-3xl bg-slate-200" />

        <div className="h-[420px] animate-pulse rounded-3xl bg-slate-200" />
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
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0797d5]/10 text-[#0797d5]">
          <UserPlus size={24} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Crear administrador
          </h1>

          <p className="text-sm text-slate-500">
            Registra un nuevo administrador
            para una empresa.
          </p>
        </div>
      </div>

      <AdminFormPage
        mode="create"
        companies={companies}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
      />
    </section>
  );
};

export default CompanyAdminCreatePage;