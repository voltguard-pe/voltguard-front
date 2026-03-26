import { Bell, Moon, Globe, ShieldCheck } from "lucide-react";

const ConfigurationDashboardPage = () => {
  return (
    <section className="flex flex-col gap-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Configuración
        </h1>
        <p className="text-sm text-gray-500">
          Personaliza tu experiencia y preferencias
        </p>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Preferencias
        </h2>

        {/* Theme */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-gray-700">
            <Moon size={18} />
            <div>
              <p className="text-sm font-medium">Modo oscuro</p>
              <p className="text-xs text-gray-500">
                Cambia la apariencia de la aplicación
              </p>
            </div>
          </div>

          <input type="checkbox" className="accent-indigo-600" />
        </div>

        {/* Language */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-gray-700">
            <Globe size={18} />
            <div>
              <p className="text-sm font-medium">Idioma</p>
              <p className="text-xs text-gray-500">
                Selecciona el idioma de la interfaz
              </p>
            </div>
          </div>

          <select className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm">
            <option>Español</option>
            <option>English</option>
          </select>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Notificaciones
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-gray-700">
            <Bell size={18} />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-xs text-gray-500">
                Recibir notificaciones por correo
              </p>
            </div>
          </div>

          <input type="checkbox" className="accent-indigo-600" />
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Seguridad
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-gray-700">
            <ShieldCheck size={18} />
            <div>
              <p className="text-sm font-medium">
                Autenticación en dos pasos
              </p>
              <p className="text-xs text-gray-500">
                Aumenta la seguridad de tu cuenta
              </p>
            </div>
          </div>

          <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700">
            Configurar
          </button>
        </div>
      </div>
    </section>
  );
};

export default ConfigurationDashboardPage;
