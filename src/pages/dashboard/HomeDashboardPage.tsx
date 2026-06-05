import { useEffect, useState } from "react";
import {
  Building2,
  FileText,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import StatCardComponent from "../../components/dashboard/StatCardComponent";

const HomeDashboardPage = () => {
  const [startBarAnimation, setStartBarAnimation] = useState(false);

  // Efecto rápido para disparar el llenado de las barras tras el montaje del DOM
  useEffect(() => {
    const t = setTimeout(() => setStartBarAnimation(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6">
      
      {/* ── SECCIÓN BIENVENIDA ── */}
      <section style={{ animation: "fadeUp 0.5s ease both" }}>
        <h1 className="text-3xl font-black text-slate-950 tracking-tight">
          Bienvenido a Voltguard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Controla empresas, usuarios, tableros y documentos desde un solo lugar.
        </p>
      </section>

      {/* ── TARJETAS ESTADÍSTICAS (EFECTO CASCADA) ── */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCardComponent
          title="Usuarios"
          value={128}
          icon={Users}
          helper="Usuarios registrados"
          delay="40ms"
        />
        <StatCardComponent
          title="Admins"
          value={12}
          icon={ShieldCheck}
          helper="Administradores activos"
          delay="80ms"
        />
        <StatCardComponent
          title="Empresas"
          value={8}
          icon={Building2}
          helper="Empresas vinculadas"
          delay="120ms"
        />
        <StatCardComponent
          title="Tableros"
          value={46}
          icon={Zap}
          helper="Tableros eléctricos"
          delay="160ms"
        />
        <StatCardComponent
          title="Documentos"
          value={214}
          icon={FileText}
          helper="Archivos almacenados"
          delay="200ms"
        />
      </section>

      {/* ── BLOQUES INFERIORES ── */}
      <section className="grid gap-4 lg:grid-cols-3">
        
        {/* Gráfico de Barras de Estado */}
        <div 
          style={{ animation: "fadeUp 0.5s ease 240ms both" }}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"
        >
          <h2 className="text-base font-bold text-slate-950 tracking-tight">
            Estado de tableros
          </h2>

          <div className="mt-6 space-y-5">
            {[
              { label: "Operativos", value: 76, color: "from-[#0797d5] to-[#05c4f7]" },
              { label: "En revisión", value: 18, color: "from-[#8ccf2f] to-[#b6eb67]" },
              { label: "Con alerta", value: 6, color: "from-amber-500 to-amber-400" },
            ].map((item) => (
              <div key={item.label} className="group">
                <div className="mb-2 flex justify-between text-xs font-bold">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="text-slate-900">{item.value}%</span>
                </div>

                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                    style={{
                      width: startBarAnimation ? `${item.value}%` : "0%",
                      transition: "width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Listado de Actividad Reciente */}
        <div 
          style={{ animation: "fadeUp 0.5s ease 280ms both" }}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col"
        >
          <h2 className="text-base font-bold text-slate-950 tracking-tight">
            Actividad reciente
          </h2>

          <div className="mt-5 space-y-2.5 flex-1">
            {[
              "Documento agregado a Volvo.",
              "Administrador creado.",
              "Empresa actualizada.",
              "Tablero TG-01 en revisión.",
            ].map((item, index) => (
              <div
                key={item}
                style={{
                  animation: "fadeUp 0.4s ease both",
                  animationDelay: `${320 + index * 40}ms`
                }}
                className="rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-transparent hover:border-slate-100 px-4 py-3.5 text-xs font-medium text-slate-600 transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-[#0797d5]" />
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>
    </div>
  );
};

export default HomeDashboardPage;