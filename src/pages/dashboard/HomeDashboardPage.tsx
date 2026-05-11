import {
  Building2,
  FileText,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import StatCardComponent from "../../components/dashboard/StatCardComponent";


const HomeDashboardPage = () => {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold text-slate-950">
          Bienvenido a Voltguard
        </h1>

        <p className="mt-2 text-slate-500">
          Controla empresas, usuarios, tableros y
          documentos desde un solo lugar.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCardComponent
          title="Usuarios"
          value={128}
          icon={Users}
          helper="Usuarios registrados"
        />

        <StatCardComponent
          title="Admins"
          value={12}
          icon={ShieldCheck}
          helper="Administradores activos"
        />

        <StatCardComponent
          title="Empresas"
          value={8}
          icon={Building2}
          helper="Empresas vinculadas"
        />

        <StatCardComponent
          title="Tableros"
          value={46}
          icon={Zap}
          helper="Tableros eléctricos"
        />

        <StatCardComponent
          title="Documentos"
          value={214}
          icon={FileText}
          helper="Archivos almacenados"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-950">
            Estado de tableros
          </h2>

          <div className="mt-6 space-y-5">
            {[
              {
                label: "Operativos",
                value: 76,
              },
              {
                label: "En revisión",
                value: 18,
              },
              {
                label: "Con alerta",
                value: 6,
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    {item.label}
                  </span>

                  <span className="text-slate-500">
                    {item.value}%
                  </span>
                </div>

                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-[#0797d5] to-[#8ccf2f]"
                    style={{
                      width: `${item.value}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            Actividad reciente
          </h2>

          <div className="mt-5 space-y-4">
            {[
              "Documento agregado a Volvo.",
              "Administrador creado.",
              "Empresa actualizada.",
              "Tablero TG-01 en revisión.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeDashboardPage;
