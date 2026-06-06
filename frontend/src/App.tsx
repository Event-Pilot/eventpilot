import { Route, Routes } from 'react-router-dom'
import { RequireAuth } from '@/components/auth/route-guard'
import { DashboardPage } from '@/pages/DashboardPage'
import { DashboardNewPage } from '@/pages/DashboardNewPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { NewTaskPage } from '@/pages/NewTaskPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ResultPage } from '@/pages/ResultPage'
import { TaskResultPage } from '@/pages/TaskResultPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/new"
        element={
          <RequireAuth>
            <NewTaskPage />
          </RequireAuth>
        }
      />
      <Route path="/tasks/:id" element={<TaskResultPage />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/new"
        element={
          <RequireAuth>
            <DashboardNewPage />
          </RequireAuth>
        }
      />
      <Route
        path="/result/:id"
        element={
          <RequireAuth>
            <ResultPage />
          </RequireAuth>
        }
      />
    </Routes>
  )
}
