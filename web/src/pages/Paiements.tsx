import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store/store'
import { fetchPaymentsStart, fetchPaymentsSuccess, fetchPaymentsFailure } from '../store/slices/paymentsSlice'
import { paymentsService } from '../services/api'
import { CreditCard, DollarSign, Calendar } from 'lucide-react'

export default function Paiements() {
  const dispatch = useDispatch()
  const { payments, isLoading } = useSelector((state: RootState) => state.payments)

  useEffect(() => {
    const loadPayments = async () => {
      try {
        dispatch(fetchPaymentsStart())
        const data = await paymentsService.getPayments()
        dispatch(fetchPaymentsSuccess(data))
      } catch (error) {
        dispatch(fetchPaymentsFailure(error instanceof Error ? error.message : 'Erreur lors du chargement'))
      }
    }

    loadPayments()
  }, [dispatch])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Paiements</h1>
      
      <div className="card">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement des paiements...</p>
          </div>
        ) : payments.length > 0 ? (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">Paiement #{payment.id}</h3>
                    <p className="text-sm text-gray-600">Mission: {payment.missionId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{payment.amount}€</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {payment.status === 'completed' ? 'Terminé' :
                       payment.status === 'pending' ? 'En attente' :
                       payment.status === 'failed' ? 'Échoué' : 'Remboursé'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun paiement trouvé</p>
          </div>
        )}
      </div>
    </div>
  )
} 