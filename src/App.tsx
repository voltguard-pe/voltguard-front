import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import LandingLayout from './layouts/LandingLayout'
import ChangePasswordPage from './pages/auth/ChangePasswordPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import AdminCreatePage from './pages/dashboard/admin/AdminCreatePage'
import AdminDashboardPage from './pages/dashboard/admin/AdminDashboardPage'
import AdminDetailPage from './pages/dashboard/admin/AdminDetailPage'
import AdminEditPage from './pages/dashboard/admin/AdminEditPage'
import BoardsCreatePage from './pages/dashboard/board/BoardCreatePage'
import BoardDashboardPage from './pages/dashboard/board/BoardDashboardPage'
import BoardsEditPage from './pages/dashboard/board/BoardEditPage'
import CompanyCreatePage from './pages/dashboard/company/CompanyCreatePage'
import CompanyDashboardPage from './pages/dashboard/company/CompanyDashboardPage'
import CompanyEditPage from './pages/dashboard/company/CompanyEditPage'
import ConfigurationDashboardPage from './pages/dashboard/ConfigurationDashboardPage'
import EditProfilePage from './pages/dashboard/profile/EditProfilePage'
import ProfileDashboardPage from './pages/dashboard/profile/ProfileDashboardPage'
import HomePage from './pages/landing/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import PublicBoardsPage from './pages/public/PublicBoardsPage'
import DashboardRouter from './routes/DashboardRouter'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRouter'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<LandingLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/public/boards" element={<PublicBoardsPage />} />
            <Route path="/public/boards/:publicCode" element={<PublicBoardsPage />} />
          </Route>

          <Route element={<PublicRoute />}>
            <Route path='/auth' element={<AuthLayout />}>
              <Route index element={<LoginPage />} />
              <Route path='register' element={<RegisterPage />} />
              <Route path='forgot-password' element={<ForgotPasswordPage />} />
              <Route path='reset-password' element={<ChangePasswordPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["SUPERADMIN", "ADMIN", "USER"]} />}>
            <Route path='/dashboard' element={<DashboardLayout />}>
              <Route index element={<DashboardRouter />} />
              <Route path="settings" element={<ConfigurationDashboardPage />} />
              <Route path="profile">
                <Route index element={<ProfileDashboardPage />} />
                <Route path="edit" element={<EditProfilePage />} />
              </Route>

              <Route path="boards" element={<BoardDashboardPage />} />

              <Route element={<ProtectedRoute allowedRoles={["SUPERADMIN"]} />}>
                <Route path="users" element={<AdminDashboardPage />} />
                <Route path="users/create" element={<AdminCreatePage />} />
                <Route path="users/:id" element={<AdminDetailPage />} />
                <Route path="users/:id/edit" element={<AdminEditPage />} />

                <Route path="company" element={<CompanyDashboardPage />} />
                <Route path="company/create" element={<CompanyCreatePage />} />
                {/* <Route path="company/:id" element={<CompanyDetailPage />} /> */}
                <Route path="company/:id/edit" element={<CompanyEditPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                <Route path="boards/create" element={<BoardsCreatePage />} />
                <Route path="boards/:id/edit" element={<BoardsEditPage />} />
                {/* <Route path="/dashboard/upload" element={<BoardFileUploaderPage />} /> */}
              </Route>
            </Route>
          </Route>

          <Route path='*' element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App