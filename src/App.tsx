import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import LandingLayout from './layouts/LandingLayout'
import ChangePasswordPage from './pages/auth/ChangePasswordPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
// 1. IMPORTA LA NUEVA PÁGINA DE VERIFICACIÓN AQUÍ:
import VerifyEmailPage from './pages/auth/VerifyEmailPage' 

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

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
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
              
              {/* 2. AÑADE ESTA RUTA DINÁMICA CON EL PARÁMETRO :token */}
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
              <Route path="boards" element={<BoardDashboardPage />} />
              <Route path="boards/:publicCode" element={<BoardDashboardPage />} />
              <Route path="boards/:publicCode/:code" element={<BoardDetailPage />} />

              <Route element={<ProtectedRoute allowedRoles={["SUPERADMIN"]} />}>
                <Route path="users" element={<AdminDashboardPage />} />
                <Route path="users/create" element={<AdminCreatePage />} />
                <Route path="users/:id" element={<AdminDetailPage />} />

                <Route path="admins" element={<CompanyDashboardPage />} />
                <Route path="admins/create" element={<CompanyCreatePage />} />
                <Route path="admins/:id/edit" element={<CompanyEditPage />} />

                <Route path="companies" element={<CompaniesDashboardPages />} />
                <Route path="companies/create" element={<CompaniesCreatePage />} />
                <Route path="companies/:publicCode/edit" element={<CompaniesEditPage />} />

                <Route path="documents" element={<DocumentDashboardPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["SUPERADMIN"]} />}>
                <Route path="boards/create" element={<BoardsCreatePage />} />
                <Route path="boards/:publicCode/:code/edit" element={<BoardsEditPage />} />
              </Route>
            </Route>
          </Route>

          <Route path='*' element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;