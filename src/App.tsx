import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import LandingLayout from './layouts/LandingLayout'
import ChangePasswordPage from './pages/auth/ChangePasswordPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import { GlobalNoCreditsWatcher } from "./components/dashboard/modals/ImportBoardsAndNfpaModal";
import AdminCreatePage from './pages/dashboard/admin/AdminCreatePage'
import AdminDashboardPage from './pages/dashboard/admin/AdminDashboardPage'
import AdminDetailPage from './pages/dashboard/admin/AdminDetailPage'
import BoardsCreatePage from './pages/dashboard/board/BoardCreatePage'
import BoardDashboardPage from './pages/dashboard/board/BoardDashboardPage'
import BoardsEditPage from './pages/dashboard/board/BoardEditPage'
import CompanyCreatePage from './pages/dashboard/company/CompanyAdminCreatePage'
import CompanyDashboardPage from './pages/dashboard/company/CompanyDashboardPage'
import CompanyEditPage from './pages/dashboard/company/CompanyEditPage'
import ConfigurationDashboardPage from './pages/dashboard/ConfigurationDashboardPage'
import EditProfilePage from './pages/dashboard/profile/EditProfilePage'
import ProfileDashboardPage from './pages/dashboard/profile/ProfileDashboardPage'
import HomePage from './pages/landing/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import CompaniesCreatePage from './pages/dashboard/companies/CompaniesCreatePage'
import CompaniesDashboardPages from './pages/dashboard/companies/CompaniesDashboardPages'
import CompaniesEditPage from './pages/dashboard/companies/CompaniesEditPage'
import DashboardRouter from './routes/DashboardRouter'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRouter'
import BoardDetailPage from './pages/dashboard/board/BoardDetailPage'
import DocumentDashboardPage from './pages/dashboard/document/DocumentDashboardPage'
import SuccessStoriesPage from './pages/landing/SuccessStoriesPage'
import PlansPage from './pages/landing/PlansPage'
import ScrollToTop from './shared/components/ScrollToTop'
import OnboardingPage from './pages/landing/OnboardingPage'
import ContactSalesPage from './pages/contact-sales/ContactSalesPage'
import ContactSalesLayout from './layouts/ContactSalesLayout'
import GroundingDashboardPage from './pages/dashboard/spat/GroundingDashboardPage'
import { SidebarProvider } from './contexts/SidebarContext'
import DocumentViewerPage from './pages/dashboard/document/DocumentViewerPage'
import { SolarPanelDashboardPage } from './pages/dashboard/solar-panel/SolarPanelDashboardPage'
import BillingDashboardPage from './pages/dashboard/billing/BillingDashboardPage'
import { PermissionsView } from './pages/dashboard/perissions/PermissionsView'
import { AdminLicensesView } from './pages/dashboard/licenses/AdminLicensesView'
import { CompanySubscriptionView } from './pages/dashboard/CompanySubscriptionView'

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-6">
    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
      <h2 className="text-base font-bold text-slate-800">{title}</h2>
      <p className="mt-1 text-xs text-slate-500">Módulo en construcción.</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      {/* VIGILANTE GLOBAL DE CRÉDITOS DE IA (Actúa en toda la plataforma) */}
      <GlobalNoCreditsWatcher />
      <AuthProvider>
        <SidebarProvider>
          <Routes>
            <Route path='/' element={<LandingLayout />}>
              <Route index element={<HomePage />} />
              <Route path="success-stories" element={<SuccessStoriesPage />} />
              <Route path="plans" element={<PlansPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/contact-sales" element={<ContactSalesPage />} />
            </Route>

            <Route path='/contact-sales' element={<ContactSalesLayout />}>
              <Route index element={<ContactSalesPage />} />
            </Route>

            {/* RUTAS PÚBLICAS DE AUTENTICACIÓN */}
            <Route element={<PublicRoute />}>
              <Route path='/auth' element={<AuthLayout />}>
                <Route index element={<LoginPage />} />
                <Route path='register' element={<RegisterPage />} />
                <Route path='verify-email/:token' element={<VerifyEmailPage />} />
                <Route path='forgot-password' element={<ForgotPasswordPage />} />
                <Route path='reset-password' element={<ChangePasswordPage />} />
              </Route>
            </Route>

            {/* RUTAS PROTEGIDAS */}
            <Route element={<ProtectedRoute allowedRoles={["SUPERADMIN", "ADMIN", "USER"]} />}>
              <Route path='/dashboard' element={<DashboardLayout />}>
                <Route index element={<DashboardRouter />} />
                <Route path="settings" element={<ConfigurationDashboardPage />} />

                <Route path="profile">
                  <Route index element={<ProfileDashboardPage />} />
                  <Route path="edit" element={<EditProfilePage />} />
                </Route>

                {/* RUTAS DE TABLEROS VISIBLES PARA USER/ADMIN/SUPERADMIN */}
                {/* 1. TABLEROS ELÉCTRICOS */}
                <Route path="boards" element={<BoardDashboardPage />} />
                <Route path="boards/:publicCode" element={<BoardDashboardPage />} />
                <Route path="boards/:publicCode/:code" element={<BoardDetailPage />} />

                {/* 2. PUESTA A TIERRA (SPAT) */}
                <Route path="grounding" element={<GroundingDashboardPage />} />
                <Route path="companies/:publicCode/grounding" element={<GroundingDashboardPage />} />
                <Route path="companies/:publicCode/grounding/:pozoCode" element={<GroundingDashboardPage />} />

                {/* 3. DOCUMENTOS ITSE */}
                <Route path="documents/view/:id" element={<DocumentViewerPage />} />

                <Route path="billing" element={<BillingDashboardPage />} />
                <Route path="companies/:publicCode/billing" element={<BillingDashboardPage />} />

                {/* 4. REPORTE MÉDICO */}
                <Route path="companies/:publicCode/medical-reports" element={<PlaceholderPage title="Reportes Médicos" />} />
                <Route path="companies/:publicCode/medical-reports/new" element={<PlaceholderPage title="Nuevo Reporte Médico" />} />

                {/* 5. PANELES SOLARES */}
                <Route path="companies/:publicCode/solar" element={<SolarPanelDashboardPage />} />
                <Route path="companies/:publicCode/solar/new" element={<SolarPanelDashboardPage />} />

                {/* 6. SUBESTACIÓN */}
                <Route path="companies/:publicCode/substations" element={<PlaceholderPage title="Subestaciones" />} />
                <Route path="companies/:publicCode/substations/new" element={<PlaceholderPage title="Nueva Subestación" />} />

                {/* 7. CELDAS */}
                <Route path="companies/:publicCode/cells" element={<PlaceholderPage title="Celdas de Media Tensión" />} />
                <Route path="companies/:publicCode/cells/new" element={<PlaceholderPage title="Nueva Celda" />} />

                {/* 8. BANCO DE CONDENSADORES */}
                <Route path="companies/:publicCode/capacitors" element={<PlaceholderPage title="Bancos de Condensadores" />} />
                <Route path="companies/:publicCode/capacitors/new" element={<PlaceholderPage title="Nuevo Banco de Condensadores" />} />

                {/* 9. UPS */}
                <Route path="companies/:publicCode/ups" element={<PlaceholderPage title="Sistemas UPS" />} />
                <Route path="companies/:publicCode/ups/new" element={<PlaceholderPage title="Nuevo Sistema UPS" />} />

                {/* RUTAS EXCLUSIVAS DE SUPERADMIN */}
                <Route element={<ProtectedRoute allowedRoles={["SUPERADMIN"]} />}>
                  <Route path="users" element={<AdminDashboardPage />} />
                  <Route path="users/create" element={<AdminCreatePage />} />
                  <Route path="users/:id" element={<AdminDetailPage />} />

                  <Route path="admins" element={<CompanyDashboardPage />} />
                  <Route path="admins/create" element={<CompanyCreatePage />} />
                  <Route path="admins/:id/edit" element={<CompanyEditPage />} />

                  <Route path="/dashboard/permissions" element={<PermissionsView />} />

                  <Route path="licenses" element={<AdminLicensesView />} />

                  <Route path="companies" element={<CompaniesDashboardPages />} />
                  <Route path="companies/create" element={<CompaniesCreatePage />} />
                  <Route path="companies/:publicCode/edit" element={<CompaniesEditPage />} />

                  <Route path="documents" element={<DocumentDashboardPage />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={["SUPERADMIN"]} />}>
                  <Route path="boards/create" element={<BoardsCreatePage />} />
                  <Route path="boards/:publicCode/:code/edit" element={<BoardsEditPage />} />
                </Route>
                
                <Route element={<ProtectedRoute allowedRoles={["ADMIN", "USER"]} />}>
                  <Route path="subscription" element={<CompanySubscriptionView />} />
                </Route>
              </Route>
            </Route>

            <Route path='*' element={<NotFoundPage />} />
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;