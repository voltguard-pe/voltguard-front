import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'
import ChangePasswordPage from './pages/auth/ChangePasswordPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import BoardDashboardPage from './pages/dashboard/board/BoardDashboardPage'
import ConfigurationDashboardPage from './pages/dashboard/ConfigurationDashboardPage'
import HomeDashboardPage from './pages/dashboard/HomeDashboardPage'
import ProfileDashboardPage from './pages/dashboard/profile/ProfileDashboardPage'
import UserCreatePage from './pages/dashboard/user/UserCreatePage'
import UserDashboardPage from './pages/dashboard/user/UserDashboardPage'
import UserDetailPage from './pages/dashboard/user/UserDetailPage'
import UserEditPage from './pages/dashboard/user/UserEditPage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './routes/ProtectedRoute'
import LandingLayout from './layouts/LandingLayout'
import HomePage from './pages/landing/HomePage'
import PublicRoute from './routes/PublicRouter'
import BoardsCreatePage from './pages/dashboard/board/BoardCreatePage'
import BoardsEditPage from './pages/dashboard/board/BoardEditPage'
import EditProfilePage from './pages/dashboard/profile/EditProfilePage'
import TechnicalSheetPage from './pages/landing/TechnicalSheetPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<LandingLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/qr/:id" element={<TechnicalSheetPage />} />
          </Route>

          <Route element={<PublicRoute />}>
            <Route path='/auth' element={<AuthLayout />}>
              <Route index element={<LoginPage />} />
              <Route path='register' element={<RegisterPage />} />
              <Route path='forgot-password' element={<ForgotPasswordPage />} />
              <Route path='reset-password' element={<ChangePasswordPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN", "USER"]} />}>
            <Route path='/dashboard' element={<DashboardLayout />}>
              <Route index element={<HomeDashboardPage />} />
              <Route path="settings" element={<ConfigurationDashboardPage />} />
              <Route path="profile">
                <Route index element={<ProfileDashboardPage />} />
                <Route path="edit" element={<EditProfilePage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                <Route path="users" element={<UserDashboardPage />} />
                <Route path="users/create" element={<UserCreatePage />} />
                <Route path="users/:id" element={<UserDetailPage />} />
                <Route path="users/:id/edit" element={<UserEditPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={["ADMIN", "USER"]} />}>
                <Route path="boards" element={<BoardDashboardPage />} />
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
