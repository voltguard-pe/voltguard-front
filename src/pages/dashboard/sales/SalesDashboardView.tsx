import {
    AlertTriangle,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    Clock3,
    DollarSign,
    ExternalLink,
    Filter,
    MessageCircle,
    Phone,
    Search,
    ShieldCheck,
    X
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface ContractedScope {
  tableros: number;
  spatPozos: number;
  subestaciones: number;
  instalacionesSolares: number;
}

export interface PaymentHistoryItem {
  id: string;
  fechaPago: string;
  nroOperacion: string;
  banco: string;
  monto: number;
  duracionMeses: number;
  plan: 'basico' | 'empresarial';
  scope: ContractedScope;
  periodo: string;
  validadoPor: string;
  notas?: string;
}

export interface SaleLead {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  ruc: string;
  razonSocial: string;
  comoLlego: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'USER';
  plan: 'basico' | 'empresarial';
  fechaRegistro: string;
  fechaVencimiento?: string;
  montoAcordadoMensual?: number;
  scope: ContractedScope;
  nroOperacion?: string;
  historialPagos: PaymentHistoryItem[];
}

export const MOCK_SALES_DATA: SaleLead[] = [
  {
    id: '1',
    nombre: 'Carlos',
    apellido: 'Mendoza',
    email: 'cmendoza@energiaperu.com',
    telefono: '987654321',
    ruc: '20601234567',
    razonSocial: 'Soluciones Energéticas del Sur S.A.C.',
    comoLlego: 'Recomendación',
    role: 'USER',
    plan: 'basico',
    fechaRegistro: '2026-10-30T10:30:00',
    scope: { tableros: 1, spatPozos: 0, subestaciones: 0, instalacionesSolares: 0 },
    historialPagos: []
  },
  {
    id: '2',
    nombre: 'Mariana',
    apellido: 'Rivas',
    email: 'mrivas@electrocontrol.pe',
    telefono: '912345678',
    ruc: '20559874123',
    razonSocial: 'Electrocontrol Industrial E.I.R.L.',
    comoLlego: 'Google',
    role: 'ADMIN',
    plan: 'empresarial',
    fechaRegistro: '2026-08-05T14:20:00',
    fechaVencimiento: '2026-11-06T14:20:00',
    montoAcordadoMensual: 650,
    scope: { tableros: 6, spatPozos: 2, subestaciones: 0, instalacionesSolares: 0 },
    nroOperacion: 'BCP-8812903',
    historialPagos: [
      {
        id: 'PAY-2002',
        fechaPago: '2026-10-06T14:20:00',
        nroOperacion: 'BCP-8812903',
        banco: 'BCP',
        monto: 650,
        duracionMeses: 1,
        plan: 'empresarial',
        scope: { tableros: 6, spatPozos: 2, subestaciones: 0, instalacionesSolares: 0 },
        periodo: '06/10/2026 14:20 al 06/11/2026 14:20',
        validadoPor: 'Ana Ventas',
        notas: 'Servicio mensual para 6 tableros y 2 pozos SPAT'
      }
    ]
  },
  {
    id: '3',
    nombre: 'Jorge',
    apellido: 'Alarcón',
    email: 'jorge.alarcon@inversionesrj.com',
    telefono: '945612389',
    ruc: '20100456789',
    razonSocial: 'Inversiones RJ Tableros S.A.',
    comoLlego: 'LinkedIn',
    role: 'ADMIN',
    plan: 'empresarial',
    fechaRegistro: '2026-09-15T09:15:00',
    fechaVencimiento: '2027-09-15T09:15:00',
    montoAcordadoMensual: 1800,
    scope: { tableros: 15, spatPozos: 5, subestaciones: 1, instalacionesSolares: 2 },
    nroOperacion: 'BBVA-4458921',
    historialPagos: [
      {
        id: 'PAY-3001',
        fechaPago: '2026-09-15T09:15:00',
        nroOperacion: 'BBVA-4458921',
        banco: 'BBVA',
        monto: 21600,
        duracionMeses: 12,
        plan: 'empresarial',
        scope: { tableros: 15, spatPozos: 5, subestaciones: 1, instalacionesSolares: 2 },
        periodo: '15/09/2026 09:15 al 15/09/2027 09:15',
        validadoPor: 'Ana Ventas',
        notas: 'Contrato corporativo anual: 15 tableros, 5 pozos, 1 subestación y 2 solares'
      }
    ]
  },
  {
    id: '4',
    nombre: 'Lucía',
    apellido: 'Fernández',
    email: 'lfernandez@tecnocel.com',
    telefono: '998877665',
    ruc: '20498761234',
    razonSocial: 'Tecnología y Celdas del Perú S.A.C.',
    comoLlego: 'Redes Sociales',
    role: 'ADMIN',
    plan: 'empresarial',
    fechaRegistro: '2026-08-10T16:00:00',
    fechaVencimiento: '2026-09-10T16:00:00',
    montoAcordadoMensual: 450,
    scope: { tableros: 4, spatPozos: 1, subestaciones: 0, instalacionesSolares: 0 },
    nroOperacion: 'BCP-0019283',
    historialPagos: [
      {
        id: 'PAY-4001',
        fechaPago: '2026-08-10T16:00:00',
        nroOperacion: 'BCP-0019283',
        banco: 'BCP',
        monto: 450,
        duracionMeses: 1,
        plan: 'empresarial',
        scope: { tableros: 4, spatPozos: 1, subestaciones: 0, instalacionesSolares: 0 },
        periodo: '10/08/2026 16:00 al 10/09/2026 16:00',
        validadoPor: 'Ana Ventas',
        notas: 'Servicio básico de tableros y 1 pozo a tierra'
      }
    ]
  }
];

export const SalesDashboardView: React.FC = () => {
  const navigate = useNavigate();
  const [salesList, setSalesList] = useState<SaleLead[]>(MOCK_SALES_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [planFilter, setPlanFilter] = useState('ALL');

  // Modal para cotizar/renovar cuota
  const [selectedLead, setSelectedLead] = useState<SaleLead | null>(null);
  const [modalForm, setModalForm] = useState({
    tableros: 5,
    spatPozos: 1,
    subestaciones: 0,
    instalacionesSolares: 0,
    duracionMeses: 1,
    montoCobrado: 550,
    banco: 'BCP',
    nroOperacion: '',
    observaciones: '',
  });

  const getExpirationStatus = (fechaVencimientoStr?: string, plan?: string) => {
    if (plan === 'basico') {
      return { status: 'FREE', texto: 'Gratis (1 tablero)', badgeClass: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
    if (!fechaVencimientoStr) {
      return { status: 'PENDING', texto: 'Por cotizar / activar', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' };
    }

    const ahora = new Date().getTime();
    const vencimiento = new Date(fechaVencimientoStr).getTime();
    const diferenciaMs = vencimiento - ahora;
    const diasRestantes = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

    if (diasRestantes < 0) {
      return {
        status: 'EXPIRED',
        texto: `Venció hace ${Math.abs(diasRestantes)}d`,
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200'
      };
    }
    if (diasRestantes <= 5) {
      return {
        status: 'EXPIRING_SOON',
        texto: `Vence en ${diasRestantes === 0 ? 'horas' : `${diasRestantes}d`}`,
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-bold animate-pulse'
      };
    }
    return {
      status: 'ACTIVE',
      texto: `${diasRestantes} días restantes`,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
  };

  const handleOpenModal = (lead: SaleLead) => {
    setSelectedLead(lead);
    setModalForm({
      tableros: lead.scope?.tableros || 5,
      spatPozos: lead.scope?.spatPozos || 1,
      subestaciones: lead.scope?.subestaciones || 0,
      instalacionesSolares: lead.scope?.instalacionesSolares || 0,
      duracionMeses: 1,
      montoCobrado: lead.montoAcordadoMensual || 550,
      banco: 'BCP',
      nroOperacion: '',
      observaciones: '',
    });
  };

  const handleConfirmActivation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    const ahora = new Date();
    let baseDate = new Date();

    if (selectedLead.fechaVencimiento && new Date(selectedLead.fechaVencimiento) > ahora) {
      baseDate = new Date(selectedLead.fechaVencimiento);
    }

    const nuevaFechaFin = new Date(baseDate);
    nuevaFechaFin.setMonth(nuevaFechaFin.getMonth() + Number(modalForm.duracionMeses));

    const inicioStr = ahora.toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
    const finStr = nuevaFechaFin.toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });

    const updatedScope: ContractedScope = {
      tableros: Number(modalForm.tableros),
      spatPozos: Number(modalForm.spatPozos),
      subestaciones: Number(modalForm.subestaciones),
      instalacionesSolares: Number(modalForm.instalacionesSolares)
    };

    const nuevoComprobante: PaymentHistoryItem = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      fechaPago: ahora.toISOString(),
      nroOperacion: modalForm.nroOperacion,
      banco: modalForm.banco,
      monto: Number(modalForm.montoCobrado),
      duracionMeses: Number(modalForm.duracionMeses),
      plan: 'empresarial',
      scope: updatedScope,
      periodo: `${inicioStr} al ${finStr}`,
      validadoPor: 'Ana Ventas',
      notas: modalForm.observaciones || 'Renovación de Plan Empresarial'
    };

    const target = MOCK_SALES_DATA.find((item) => item.id === selectedLead.id);
    if (target) {
      target.plan = 'empresarial';
      target.role = 'ADMIN';
      target.montoAcordadoMensual = Math.round(Number(modalForm.montoCobrado) / Number(modalForm.duracionMeses));
      target.scope = updatedScope;
      target.fechaVencimiento = nuevaFechaFin.toISOString();
      target.nroOperacion = modalForm.nroOperacion;
      target.historialPagos = [nuevoComprobante, ...(target.historialPagos || [])];
    }

    setSalesList((prev) =>
      prev.map((item) =>
        item.id === selectedLead.id
          ? {
              ...item,
              plan: 'empresarial',
              role: 'ADMIN',
              montoAcordadoMensual: Math.round(Number(modalForm.montoCobrado) / Number(modalForm.duracionMeses)),
              scope: updatedScope,
              fechaVencimiento: nuevaFechaFin.toISOString(),
              nroOperacion: modalForm.nroOperacion,
              historialPagos: [nuevoComprobante, ...(item.historialPagos || [])],
            }
          : item
      )
    );

    setSelectedLead(null);
  };

  const handleOpenWhatsApp = (lead: SaleLead) => {
    const vencimientoFormatted = lead.fechaVencimiento
      ? new Date(lead.fechaVencimiento).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })
      : 'próximamente';

    const mensaje = `Hola ${lead.nombre}, te saluda el área comercial de VoltGuard.%0A%0A` +
      `Nos comunicamos respecto a la suscripción de *${lead.razonSocial}*.%0A` +
      `Tu servicio actual vence el: *${vencimientoFormatted}*.%0A%0A` +
      `Monto de renovación acordado: *S/ ${lead.montoAcordadoMensual}.00*.%0A` +
      `¿Deseas que te enviemos las cuentas para procesar la continuidad del servicio?`;

    const cleanPhone = lead.telefono.replace(/\D/g, '');
    window.open(`https://wa.me/51${cleanPhone}?text=${mensaje}`, '_blank');
  };

  const filteredSales = salesList.filter((item) => {
    const textMatch =
      item.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ruc.includes(searchTerm) ||
      `${item.nombre} ${item.apellido}`.toLowerCase().includes(searchTerm.toLowerCase());

    const exp = getExpirationStatus(item.fechaVencimiento, item.plan);
    let statusMatch = true;
    if (statusFilter === 'EXPIRING_SOON') statusMatch = exp.status === 'EXPIRING_SOON';
    if (statusFilter === 'EXPIRED') statusMatch = exp.status === 'EXPIRED';
    if (statusFilter === 'ACTIVE') statusMatch = exp.status === 'ACTIVE';

    const planMatch = planFilter === 'ALL' || item.plan === planFilter;
    return textMatch && statusMatch && planMatch;
  });

  const totalPorVencer = salesList.filter((s) => getExpirationStatus(s.fechaVencimiento, s.plan).status === 'EXPIRING_SOON').length;
  const totalVencidos = salesList.filter((s) => getExpirationStatus(s.fechaVencimiento, s.plan).status === 'EXPIRED').length;
  const totalActivos = salesList.filter((s) => getExpirationStatus(s.fechaVencimiento, s.plan).status === 'ACTIVE').length;
  const totalRecaudado = salesList.reduce((acc, curr) => acc + curr.historialPagos.reduce((hAcc, p) => hAcc + p.monto, 0), 0);

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen text-slate-800">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestión de Ventas</h1>
        <p className="text-slate-500 text-sm mt-1">
          Seguimiento de suscripciones, control de vencimiento exacto y cobranzas recurrentes.
        </p>
      </div>

      {/* Métricas Interactivas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div
          onClick={() => setStatusFilter(statusFilter === 'EXPIRING_SOON' ? 'ALL' : 'EXPIRING_SOON')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'EXPIRING_SOON' ? 'bg-amber-500 text-white border-amber-600' : 'bg-white border-slate-200/80 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase ${statusFilter === 'EXPIRING_SOON' ? 'text-amber-100' : 'text-slate-400'}`}>
              Por Vencer (≤ 5 días)
            </span>
            <div className={`p-2 rounded-xl ${statusFilter === 'EXPIRING_SOON' ? 'bg-amber-600' : 'bg-amber-50 text-amber-600'}`}>
              <Clock3 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold mt-2">{totalPorVencer}</p>
          <span className={`text-xs ${statusFilter === 'EXPIRING_SOON' ? 'text-amber-100' : 'text-slate-400'}`}>
            Click para filtrar clientes a cobrar
          </span>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'EXPIRED' ? 'ALL' : 'EXPIRED')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'EXPIRED' ? 'bg-rose-600 text-white border-rose-700' : 'bg-white border-slate-200/80 hover:border-rose-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase ${statusFilter === 'EXPIRED' ? 'text-rose-100' : 'text-slate-400'}`}>
              Cuentas Vencidas
            </span>
            <div className={`p-2 rounded-xl ${statusFilter === 'EXPIRED' ? 'bg-rose-700' : 'bg-rose-50 text-rose-600'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold mt-2">{totalVencidos}</p>
          <span className={`text-xs ${statusFilter === 'EXPIRED' ? 'text-rose-100' : 'text-slate-400'}`}>
            Acceso restringido
          </span>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            statusFilter === 'ACTIVE' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white border-slate-200/80 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase ${statusFilter === 'ACTIVE' ? 'text-emerald-100' : 'text-slate-400'}`}>
              Planes Activos
            </span>
            <div className={`p-2 rounded-xl ${statusFilter === 'ACTIVE' ? 'bg-emerald-700' : 'bg-emerald-50 text-emerald-600'}`}>
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold mt-2">{totalActivos}</p>
          <span className={`text-xs ${statusFilter === 'ACTIVE' ? 'text-emerald-100' : 'text-slate-400'}`}>
            Servicio al día
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400">Total Recaudado</span>
            <p className="text-3xl font-bold text-blue-600 mt-2">S/ {totalRecaudado.toLocaleString()}</p>
            <span className="text-xs text-slate-400">Vouchers validados</span>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por RUC, Razón Social o Contacto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="EXPIRING_SOON">⚠️ Por Vencer (≤ 5 días)</option>
              <option value="EXPIRED">🔴 Vencidos</option>
              <option value="ACTIVE">🟢 Activos</option>
            </select>
          </div>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="ALL">Todos los Planes</option>
            <option value="basico">Básico (Gratis)</option>
            <option value="empresarial">Empresarial (Cotizado)</option>
          </select>
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-medium">
                <th className="py-4 px-6">Empresa / RUC</th>
                <th className="py-4 px-6">Contacto (ADMIN)</th>
                <th className="py-4 px-6">Plan Actual</th>
                <th className="py-4 px-6">Monto Mensual</th>
                <th className="py-4 px-6">Vigencia (Fecha y Hora)</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map((lead) => {
                const exp = getExpirationStatus(lead.fechaVencimiento, lead.plan);

                return (
                  <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Clic en Empresa -> Lleva a DetailSubscription */}
                    <td className="py-4 px-6">
                      <button
                        onClick={() => navigate(`/dashboard/sales/${lead.id}/subscription`)}
                        className="group/company text-left cursor-pointer focus:outline-none"
                        title="Ver detalle de suscripción y pagos"
                      >
                        <div className="font-semibold text-slate-900 group-hover/company:text-[#0797d5] flex items-center gap-1.5 transition-colors">
                          <Building2 className="w-4 h-4 text-slate-400 group-hover/company:text-[#0797d5] shrink-0" />
                          <span className="underline-offset-2 group-hover/company:underline">
                            {lead.razonSocial}
                          </span>
                          <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover/company:opacity-100 transition-opacity ml-0.5" />
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 font-mono">RUC: {lead.ruc}</div>
                      </button>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-800">{lead.nombre} {lead.apellido}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {lead.telefono}
                      </div>
                    </td>

                    {/* Plan Actual */}
                    <td className="py-4 px-6">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg inline-block ${
                          lead.plan === 'empresarial'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200/60'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {lead.plan === 'empresarial' ? 'Empresarial' : 'Básico'}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {lead.plan === 'empresarial'
                        ? `S/ ${(lead.montoAcordadoMensual || 0).toLocaleString()}/mes`
                        : 'Gratis'}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600">
                      {lead.fechaVencimiento ? (
                        <div>
                          <div className="flex items-center gap-1 font-semibold text-slate-800">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(lead.fechaVencimiento).toLocaleDateString('es-PE')}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {new Date(lead.fechaVencimiento).toLocaleTimeString('es-PE', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Ilimitado</span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${exp.badgeClass}`}>
                        {exp.texto}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {lead.plan === 'empresarial' && (
                          <button
                            title="Cobro rápido por WhatsApp"
                            onClick={() => handleOpenWhatsApp(lead)}
                            className="p-1.5 rounded-lg border border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenModal(lead)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all cursor-pointer whitespace-nowrap"
                        >
                          {lead.fechaVencimiento ? 'Renovar / Cuota' : 'Cotizar y Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cotización / Renovación */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Habilitación de Plan Empresarial</h3>
                  <p className="text-xs text-slate-400">{selectedLead.razonSocial}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmActivation} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="font-semibold text-slate-700">RUC:</span> {selectedLead.ruc}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Contacto:</span> {selectedLead.nombre} {selectedLead.apellido}
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-slate-700">Vencimiento anterior:</span>{' '}
                  {selectedLead.fechaVencimiento
                    ? new Date(selectedLead.fechaVencimiento).toLocaleString('es-PE')
                    : 'Sin suscripción previa'}
                </div>
              </div>

              {/* Inventario de los 4 Módulos Cuantificados */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2.5">
                  Activos Eléctricos a Supervisar
                </span>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1 truncate">
                      ⚡ Tableros
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={modalForm.tableros}
                      onChange={(e) => setModalForm({ ...modalForm, tableros: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1 truncate">
                      📈 Pozos SPAT
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={modalForm.spatPozos}
                      onChange={(e) => setModalForm({ ...modalForm, spatPozos: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1 truncate">
                      ⚙️ Subestación
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={modalForm.subestaciones}
                      onChange={(e) => setModalForm({ ...modalForm, subestaciones: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1 truncate">
                      ☀️ Solar
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={modalForm.instalacionesSolares}
                      onChange={(e) => setModalForm({ ...modalForm, instalacionesSolares: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Duración y Cobranza */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Duración Contratada</label>
                  <select
                    value={modalForm.duracionMeses}
                    onChange={(e) => setModalForm({ ...modalForm, duracionMeses: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 Mes</option>
                    <option value={3}>3 Meses (Trimestral)</option>
                    <option value={6}>6 Meses (Semestral)</option>
                    <option value={12}>12 Meses (Anual)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Monto Cobrado (S/)</label>
                  <input
                    type="number"
                    value={modalForm.montoCobrado}
                    onChange={(e) => setModalForm({ ...modalForm, montoCobrado: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Banco Destino</label>
                  <select
                    value={modalForm.banco}
                    onChange={(e) => setModalForm({ ...modalForm, banco: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BCP">BCP</option>
                    <option value="BBVA">BBVA</option>
                    <option value="Interbank">Interbank</option>
                    <option value="Scotiabank">Scotiabank</option>
                    <option value="Transferencia">Otra cuenta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">N° Operación</label>
                  <input
                    type="text"
                    placeholder="Ej: BCP-928341"
                    value={modalForm.nroOperacion}
                    onChange={(e) => setModalForm({ ...modalForm, nroOperacion: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Desglose / Notas Técnicas</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre sedes, informe ITSE acordado o condiciones especiales..."
                  value={modalForm.observaciones}
                  onChange={(e) => setModalForm({ ...modalForm, observaciones: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
                >
                  Confirmar y Activar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};