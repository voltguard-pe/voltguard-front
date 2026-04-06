import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../../../shared/components/Input";
import { getCompanies } from "../../../services/company.service";
import { getAdminById, updateAdmin } from "../../../services/users.service";
import type { CompanyOptionDTO } from "../../../shared/types/CompanyProps";

const CompanyEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyPublicCode, setCompanyPublicCode] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [companies, setCompanies] = useState<CompanyOptionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    const fetchData = async () => {
      try {
        const [adminData, companiesData] = await Promise.all([
          getAdminById(id),
          getCompanies(),
        ]);

        if (adminData.role !== "ADMIN") {
          setNotFound(true);
          return;
        }

        setFirstname(adminData.firstname ?? "");
        setLastname(adminData.lastname ?? "");
        setEmail(adminData.email ?? "");
        setIsActive(adminData.isActive ?? true);

        if (typeof adminData.company === "string") {
          setCompanyPublicCode(adminData.company);
        } else if (adminData.company?.publicCode) {
          setCompanyPublicCode(adminData.company.publicCode);
        }

        setCompanies(
          companiesData.map((company) => ({
            name: company.name,
            publicCode: company.publicCode,
          }))
        );
      } catch (error) {
        console.error("Error al cargar administrador", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!id) return;

    try {
      setSaving(true);

      const payload: {
        firstname: string;
        lastname: string;
        email: string;
        isActive: boolean;
        companyPublicCode: string;
        password?: string;
      } = {
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email: email.trim(),
        isActive,
        companyPublicCode,
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      await updateAdmin(id, payload);

      alert("Administrador actualizado correctamente 🚀");
      navigate("/dashboard/admins");
    } catch (error) {
      console.error("Error al actualizar administrador", error);
      alert("Error al actualizar administrador");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando administrador...</p>;
  }

  if (notFound) {
    return <p className="text-sm text-red-500">Administrador no encontrado.</p>;
  }

  return (
    <section className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm">
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        Editar Administrador
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <Input
          label="Nombre"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          required
        />

        <Input
          label="Apellido"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          required
        />

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="col-span-2"
        />

        <Input
          label="Nueva contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="col-span-2"
          placeholder="Déjalo vacío si no deseas cambiarla"
        />

        <div className="col-span-2 flex flex-col gap-y-2">
          <label className="text-sm text-gray-600 font-medium">
            Empresa
          </label>

          <select
            value={companyPublicCode}
            onChange={(e) => setCompanyPublicCode(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500"
          >
            <option value="">Seleccionar empresa</option>
            {companies.map((company) => (
              <option key={company.publicCode} value={company.publicCode}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <label className="col-span-2 flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4"
          />
          Usuario activo
        </label>

        <div className="col-span-2 flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard/admins")}
            className="px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CompanyEditPage;