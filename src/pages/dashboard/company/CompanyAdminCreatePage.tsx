import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../shared/components/Input";
import { createUser } from "../../../services/users.service";
import clientAxios from "../../../shared/config/clientAxios";

type Company = {
  name: string;
  publicCode: string;
};

const CompanyAdminCreatePage = () => {
  const navigate = useNavigate();

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyPublicCode, setCompanyPublicCode] = useState("");

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 traer empresas públicas
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data } = await clientAxios.get<Company[]>(
          "/company"
        );
        setCompanies(data);
      } catch (error) {
        console.error("Error cargando empresas", error);
      }
    };

    fetchCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyPublicCode) {
      alert("Selecciona una empresa");
      return;
    }

    try {
      setLoading(true);

      await createUser({
        firstname,
        lastname,
        email,
        password,
        companyPublicCode,
      });

      alert("Administrador creado correctamente 🚀");

      navigate("/dashboard/admins");
    } catch (error) {
      console.error(error);
      alert("Error al crear administrador");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm">
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        Crear Administrador
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
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="col-span-2"
        />

        {/* 🔹 Selector de empresa */}
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

        {/* 🔹 botones */}
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
            disabled={loading}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {loading ? "Creando..." : "Crear administrador"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CompanyAdminCreatePage;