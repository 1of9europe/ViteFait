import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store/store'
import { fetchMissionsStart, fetchMissionsSuccess, fetchMissionsFailure } from '../store/slices/missionsSlice'
import { missionsService } from '../services/api'
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  Users
} from 'lucide-react'

export default function Dashboard() {
  const dispatch = useDispatch()
  const { missions, isLoading } = useSelector((state: RootState) => state.missions)
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    const loadMissions = async () => {
      try {
        dispatch(fetchMissionsStart())
        const data = await missionsService.getMissions()
        dispatch(fetchMissionsSuccess(data))
      } catch (error) {
        dispatch(fetchMissionsFailure(error instanceof Error ? error.message : 'Erreur lors du chargement'))
      }
    }

    loadMissions()
  }, [dispatch])

  const stats = {
    total: missions.length,
    pending: missions.filter(m => m.status === 'pending').length,
    inProgress: missions.filter(m => m.status === 'in_progress').length,
    completed: missions.filter(m => m.status === 'completed').length,
  }

  const recentMissions = missions.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">
          Bonjour, {user?.firstName} !
        </h1>
        <p className="text-primary-100">
          Voici un aperçu de vos activités aujourd'hui
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Missions</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En cours</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Terminées</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Missions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Missions récentes</h2>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : recentMissions.length > 0 ? (
          <div className="space-y-4">
            {recentMissions.map((mission) => (
              <div key={mission.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{mission.title}</h3>
                  <p className="text-sm text-gray-600">{mission.location.address}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    mission.status === 'completed' ? 'bg-green-100 text-green-800' :
                    mission.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                    mission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {mission.status === 'completed' ? 'Terminée' :
                     mission.status === 'in_progress' ? 'En cours' :
                     mission.status === 'pending' ? 'En attente' : 'Annulée'}
                  </span>
                  <span className="text-sm text-gray-500">{mission.budget}€</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune mission pour le moment</p>
          </div>
        )}
      </div>
    </div>
  )
} 