import { BarChart3, Users, DollarSign, TrendingUp } from "lucide-react";

const stats = [
  {
    title: "Ingresos",
    value: "$12,450",
    icon: DollarSign,
  },
  {
    title: "Usuarios",
    value: "1,284",
    icon: Users,
  },
  {
    title: "Crecimiento",
    value: "+18%",
    icon: TrendingUp,
  },
  {
    title: "Reportes",
    value: "32",
    icon: BarChart3,
  },
];

const HomeDashboardPage = () => {
  return (
    <section className="flex flex-col gap-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Bienvenido de nuevo 👋
        </h1>
        <p className="text-sm text-gray-500">
          Aquí tienes un resumen de tu actividad
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-2xl font-semibold text-gray-800">
                {stat.value}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600">
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Actividad reciente
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Nuevo usuario registrado</span>
              <span>Hace 2 horas</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Reporte generado</span>
              <span>Ayer</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Pago recibido</span>
              <span>Hace 3 días</span>
            </div>
          </div>
        </div>

        {/* Side */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Estado del sistema
          </h2>

          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex justify-between">
              <span>Servidor</span>
              <span className="text-green-600 font-medium">Activo</span>
            </li>
            <li className="flex justify-between">
              <span>API</span>
              <span className="text-green-600 font-medium">Operativa</span>
            </li>
            <li className="flex justify-between">
              <span>Base de datos</span>
              <span className="text-yellow-600 font-medium">Revisión</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default HomeDashboardPage;
