import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { missionsService } from '../services/api'

export default function MissionDetails() {
  const { id } = useParams<{ id: string }>()
  const [mission, setMission] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      const loadMission = async () => {
        try {
          const data = await missionsService.getMission(id)
          setMission(data)
        } catch (error) {
          console.error('Erreur lors du chargement de la mission:', error)
        } finally {
          setLoading(false)
        }
      }
      loadMission()
    }
  }, [id])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Chargement...</p>
      </div>
    )
  }

  if (!mission) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Mission non trouvée</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">{mission.title}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Détails principaux */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700">{mission.description}</p>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Localisation</h2>
            <p className="text-gray-700">{mission.location?.address}</p>
          </div>
        </div>

        {/* Informations secondaires */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Statut:</span>
                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                  mission.status === 'completed' ? 'bg-green-100 text-green-800' :
                  mission.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                  mission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {mission.status === 'completed' ? 'Terminée' :
                   mission.status === 'in_progress' ? 'En cours' :
                   mission.status === 'pending' ? 'En attente' : 'Annulée'}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Budget:</span>
                <span className="ml-2 text-gray-900">{mission.budget}€</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Catégorie:</span>
                <span className="ml-2 text-gray-900">{mission.category}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Créée le:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(mission.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              <button className="btn-primary w-full">
                Modifier la mission
              </button>
              <button className="btn-secondary w-full">
                Annuler la mission
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 