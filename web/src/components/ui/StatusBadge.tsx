import React from 'react'
import { cn } from '@/utils/cn'
import { cva, type VariantProps } from 'class-variance-authority'

const statusBadgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  {
    variants: {
      status: {
        pending: 'bg-yellow-100 text-yellow-800',
        in_progress: 'bg-orange-100 text-orange-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        // Statuts de paiement
        failed: 'bg-red-100 text-red-800',
        refunded: 'bg-gray-100 text-gray-800',
        // Statuts de notification
        info: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      status: 'pending',
      size: 'md',
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, size, children, ...props }, ref) => {
    return (
      <span
        className={cn(statusBadgeVariants({ status, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </span>
    )
  }
)

StatusBadge.displayName = 'StatusBadge'

// Composant spécialisé pour les missions
export const MissionStatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    const config = {
      pending: { label: 'En attente', status: 'pending' as const },
      in_progress: { label: 'En cours', status: 'in_progress' as const },
      completed: { label: 'Terminée', status: 'completed' as const },
      cancelled: { label: 'Annulée', status: 'cancelled' as const },
    }
    return config[status as keyof typeof config] || config.pending
  }

  const config = getStatusConfig(status)
  return <StatusBadge status={config.status}>{config.label}</StatusBadge>
}

// Composant spécialisé pour les paiements
export const PaymentStatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    const config = {
      pending: { label: 'En attente', status: 'pending' as const },
      completed: { label: 'Terminé', status: 'completed' as const },
      failed: { label: 'Échoué', status: 'failed' as const },
      refunded: { label: 'Remboursé', status: 'refunded' as const },
    }
    return config[status as keyof typeof config] || config.pending
  }

  const config = getStatusConfig(status)
  return <StatusBadge status={config.status}>{config.label}</StatusBadge>
}

export default StatusBadge 