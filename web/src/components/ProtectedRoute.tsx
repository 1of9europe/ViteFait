import React, { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'

interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
  roles?: string[]
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  roles = [] 
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const location = useLocation()

  // Si l'authentification n'est pas requise, afficher directement
  if (!requireAuth) {
    return <>{children}</>
  }

  // Si non authentifié, rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Si des rôles sont spécifiés, vérifier les permissions
  if (roles.length > 0 && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
} 