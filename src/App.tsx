import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DroneModule from './pages/DroneModule'
import FrequencyModule from './pages/FrequencyModule'
import Calculator from './pages/Calculator'
import './App.css'

function useAuthState() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'))
  const isAuthenticated = useMemo(() => Boolean(token), [token])
  const login = (username: string, password: string, category: string) => {
    if (username && password) {
      const fake = 'demo-token'
      localStorage.setItem('auth_token', fake)
      localStorage.setItem('user_category', category)
      setToken(fake)
      return true
    }
    return false
  }
  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_category')
    setToken(null)
  }
  return { isAuthenticated, login, logout }
}

import type { ReactNode } from 'react';
function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthed = Boolean(localStorage.getItem('auth_token'))
  if (!isAuthed) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const auth = useAuthState()
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={auth.login} />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard onLogout={auth.logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Dashboard"
          element={
            <ProtectedRoute>
              <Dashboard onLogout={auth.logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/drone"
          element={
            <ProtectedRoute>
              <DroneModule onLogout={auth.logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/frequency"
          element={
            <ProtectedRoute>
              <FrequencyModule onLogout={auth.logout} />
            </ProtectedRoute>
          }
        />
         <Route
          path="/calculator"
          element={
            <ProtectedRoute>
              <Calculator />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
