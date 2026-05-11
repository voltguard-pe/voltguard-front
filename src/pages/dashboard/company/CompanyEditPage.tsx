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

import clientAxios from "../../../shared/config/clientAxios";

import {
  getUserById,
  updateUser,
} from "../../../services/users.service";

import type {
  UpdateUserDTO,
  UserProps,
} from "../../../shared/types/UserProps";
import type { AdminFormData } from "./AdminFormPage";
import AdminFormPage from "./AdminFormPage";


type Company = {
  name: string;
  publicCode: string;
};

const CompanyEditPage = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [user, setUser] =
    useState<UserProps | null>(null);

  const [companies, setCompanies] = useState<
    Company[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const [userData, companiesData] =
          await Promise.all([
            getUserById(id),
            clientAxios.get<Company[]>(
              "/company"
            ),
          ]);

        setUser(userData);

        setCompanies(companiesData.data);
      } catch (error) {
        console.error(error);

        toast.error(
          "Error cargando administrador"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (
    data: AdminFormData
  ) => {
    if (!user) return;

    try {
      setSaving(true);

      const payload: Partial<UpdateUserDTO> = {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        companyPublicCode:
          data.companyPublicCode,
      };

      await updateUser(
        String(user._id),
        payload
      );

      toast.success(
        "Administrador actualizado correctamente"
      );

      navigate("/dashboard/admins");
    } catch (error) {
      console.error(error);

      toast.error(
        "Error actualizando administrador"
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

        <div className="h-[420px] animate-pulse rounded-3xl bg-slate-200" />
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">
          Administrador no encontrado
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
            Editar administrador
          </h1>

          <p className="text-sm text-slate-500">
            Modifica los datos del
            administrador.
          </p>
        </div>
      </div>

      <AdminFormPage
        mode="edit"
        companies={companies}
        loading={saving}
        initialValues={{
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          companyPublicCode:
            typeof user.companyPublicCode ===
            "string"
              ? user.companyPublicCode
              : user.companyPublicCode
                  ?.publicCode ?? "",
        }}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
      />
    </section>
  );
};

export default CompanyEditPage;