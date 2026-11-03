import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Building2,
  Cpu,
  CreditCard,
  Mail,
  Phone,
  Receipt,
  Sun,
  UserCheck,
  Zap
} from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_SALES_DATA } from './SalesDashboardView';

export const SubscriptionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const lead = MOCK_SALES_DATA.find((item) => item.id === id);

  if (!lead) {
    return (
      <div className="p-8 text-center bg-[#f8fafc] min-h-screen flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Empresa no encontrada</h2>
        <button
          onClick={() => navigate('/dashboard/sales')}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Volver a Gestión de Ventas
        </button>
      </div>
    );
  }

  const totalFacturado = lead.historialPagos.reduce((acc, curr) => acc + curr.monto, 0);

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen text-slate-800">
      {/* Botón de regreso */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/sales')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Volver a Gestión de Ventas
        </button>
      </div>

      {/* Cabecera Principal de la Empresa */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-[#0797d5] rounded-xl">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{lead.razonSocial}</h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">RUC: {lead.ruc}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-600">
              <span className="font-medium text-slate-700 flex items-center gap-1.5">
                <UserCheck size={14} className="text-slate-400" /> {lead.nombre} {lead.apellido}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400" /> {lead.telefono}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /> {lead.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-extrabold uppercase px-3 py-1.5 rounded-xl border ${
                lead.plan === 'empresarial'
                  ? 'bg-purple-100 text-purple-700 border-purple-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              Plan {lead.plan === 'empresarial' ? 'Empresarial' : 'Básico'}
            </span>
          </div>
        </div>
      </div>

      {/* Tarjetas de Alcance de Activos y Estado Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        {/* Tableros */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Tableros Eléctricos</span>
            <div className="p-2 bg-blue-50 text-[#0797d5] rounded-lg">
              <Zap size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{lead.scope.tableros}</p>
          <span className="text-xs text-slate-400">Supervisados con termografía</span>
        </div>

        {/* Pozos a Tierra */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Pozos SPAT</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Activity size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{lead.scope.spatPozos}</p>
          <span className="text-xs text-slate-400">Con protocolo y firma CIP</span>
        </div>

        {/* Subestaciones */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Subestaciones</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Cpu size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{lead.scope.subestaciones}</p>
          <span className="text-xs text-slate-400">Celdas y transformadores</span>
        </div>

        {/* Sistemas Solares */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-slate-400">Inst. Solares</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Sun size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{lead.scope.instalacionesSolares}</p>
          <span className="text-xs text-slate-400">Arreglos fotovoltaicos</span>
        </div>
      </div>

      {/* Métricas Financieras y Vencimiento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Cuota Mensual Acordada</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {lead.plan === 'empresarial' ? `S/ ${(lead.montoAcordadoMensual || 0).toLocaleString()}` : 'S/ 0 (Gratuito)'}
          </p>
          <span className="text-xs text-slate-400">Monto pactado en cotización</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Fecha y Hora de Corte</span>
          <p className="text-2xl font-bold text-[#0797d5] mt-1">
            {lead.fechaVencimiento ? new Date(lead.fechaVencimiento).toLocaleDateString('es-PE') : 'Ilimitado'}
          </p>
          <span className="text-xs text-slate-400">
            {lead.fechaVencimiento ? new Date(lead.fechaVencimiento).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : 'Plan Básico de prueba'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Histórico Cobrado</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">S/ {totalFacturado.toLocaleString()}</p>
          <span className="text-xs text-slate-400">{lead.historialPagos.length} comprobantes validados</span>
        </div>
      </div>

      {/* Historial de Comprobantes Bancarios */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-slate-400" />
            <h2 className="text-base font-bold text-slate-800">Comprobantes y Pagos Registrados</h2>
          </div>
        </div>

        {lead.historialPagos.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p>No hay pagos registrados para esta empresa.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-medium">
                  <th className="py-4 px-6">ID / Fecha</th>
                  <th className="py-4 px-6">N° Operación</th>
                  <th className="py-4 px-6">Alcance Cubierto</th>
                  <th className="py-4 px-6">Periodo Vigente</th>
                  <th className="py-4 px-6">Monto Cobrado</th>
                  <th className="py-4 px-6">Validado Por</th>
                  <th className="py-4 px-6">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lead.historialPagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">{pago.id}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {new Date(pago.fechaPago).toLocaleDateString('es-PE')}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-mono font-bold text-slate-800">{pago.nroOperacion}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <CreditCard size={12} /> {pago.banco}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="text-xs font-semibold text-blue-700">
                        {pago.scope.tableros} Tableros
                        {pago.scope.spatPozos > 0 && ` • ${pago.scope.spatPozos} SPAT`}
                        {pago.scope.subestaciones > 0 && ` • ${pago.scope.subestaciones} Subestación`}
                        {pago.scope.instalacionesSolares > 0 && ` • ${pago.scope.instalacionesSolares} Solar`}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{pago.duracionMeses} mes(es) contratado(s)</div>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600">{pago.periodo}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">S/ {pago.monto.toLocaleString()}</td>
                    <td className="py-4 px-6 text-xs text-slate-600">{pago.validadoPor}</td>
                    <td className="py-4 px-6 text-xs text-slate-500 max-w-xs truncate" title={pago.notas}>
                      {pago.notas || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};