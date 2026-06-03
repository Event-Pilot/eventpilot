import { Route, Routes } from 'react-router-dom'
import { DashboardPage } from '@/pages/DashboardPage'
import { DashboardNewPage } from '@/pages/DashboardNewPage'
import { HomePage } from '@/pages/HomePage'
import { NewTaskPage } from '@/pages/NewTaskPage'
import { ResultPage } from '@/pages/ResultPage'
import { TaskResultPage } from '@/pages/TaskResultPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/new" element={<NewTaskPage />} />
      <Route path="/tasks/:id" element={<TaskResultPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard/new" element={<DashboardNewPage />} />
      <Route path="/result/:id" element={<ResultPage />} />
    </Routes>
  )
}
