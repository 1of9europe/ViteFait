import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from './store/store'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Missions from './pages/Missions'
import MissionDetails from './pages/MissionDetails'
import NouvelleMission from './pages/NouvelleMission'
import Paiements from './pages/Paiements'
import Messages from './pages/Messages'
import Parametres from './pages/Parametres'

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <ProtectedRoute requireAuth={false}>
              <Login />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/missions" element={<ProtectedRoute><MainLayout><Missions /></MainLayout></ProtectedRoute>} />
        <Route path="/missions/:id" element={<ProtectedRoute><MainLayout><MissionDetails /></MainLayout></ProtectedRoute>} />
        <Route path="/missions/new" element={<ProtectedRoute><MainLayout><NouvelleMission /></MainLayout></ProtectedRoute>} />
        <Route path="/paiements" element={<ProtectedRoute><MainLayout><Paiements /></MainLayout></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MainLayout><Messages /></MainLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><MainLayout><Parametres /></MainLayout></ProtectedRoute>} />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App 