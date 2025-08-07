import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useSearchParams } from 'react-router-dom'
import { RootState } from '../store/store'
import { fetchMissionsStart, fetchMissionsSuccess, fetchMissionsFailure } from '../store/slices/missionsSlice'
import { missionsService } from '../services/api'
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Calendar,
  MapPin
} from 'lucide-react'

interface FilterState {
  status: string
  category: string
  search: string
  dateFrom: string
  dateTo: string
}

export default function Missions() {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { missions, isLoading } = useSelector((state: RootState) => state.missions)
  const { user } = useSelector((state: RootState) => state.auth)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [filters, setFilters] = useState<FilterState>({
    status: searchParams.get('status') || '',
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
  })

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

  // Filtrer les missions
  const filteredMissions = missions.filter(mission => {
    if (filters.status && mission.status !== filters.status) return false
    if (filters.category && mission.category !== filters.category) return false
    if (filters.search && !mission.title.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.dateFrom && new Date(mission.createdAt) < new Date(filters.dateFrom)) return false
    if (filters.dateTo && new Date(mission.createdAt) > new Date(filters.dateTo)) return false
    return true
  })

  // Pagination
  const totalPages = Math.ceil(filteredMissions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentMissions = filteredMissions.slice(startIndex, endIndex)

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    setCurrentPage(1)
    
    // Mettre à jour les paramètres d'URL
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    setSearchParams(params)
  }

  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
      search: '',
      dateFrom: '',
      dateTo: '',
    })
    setCurrentPage(1)
    setSearchParams({})
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', class: 'bg-yellow-100 text-yellow-800' },
      in_progress: { label: 'En cours', class: 'bg-orange-100 text-orange-800' },
      completed: { label: 'Terminée', class: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Annulée', class: 'bg-red-100 text-red-800' },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Missions</h1>
        <Link
          to="/missions/new"
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Mission
        </Link>
      </div>

      {/* Filtres */}
      <div className="card">
        <div className="space-y-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une mission..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Filtres avancés */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input-field"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input-field"
              >
                <option value="">Toutes les catégories</option>
                <option value="courses">Courses</option>
                <option value="menage">Ménage</option>
                <option value="livraison">Livraison</option>
                <option value="garde">Garde d'enfants</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="input-field"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="btn-secondary w-full"
              >
                Effacer les filtres
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredMissions.length} mission{filteredMissions.length !== 1 ? 's' : ''} trouvée{filteredMissions.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement des missions...</p>
          </div>
        ) : currentMissions.length > 0 ? (
          <>
            <div className="space-y-4">
              {currentMissions.map((mission) => (
                <div key={mission.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">{mission.title}</h3>
                        {getStatusBadge(mission.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{mission.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {mission.location?.address}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(mission.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                        <span className="font-medium text-gray-900">{mission.budget}€</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/missions/${mission.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir détails
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Affichage de {startIndex + 1} à {Math.min(endIndex, filteredMissions.length)} sur {filteredMissions.length} missions
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </button>
                  <span className="flex items-center px-3 py-2 text-sm text-gray-700">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Aucune mission trouvée</p>
          </div>
        )}
      </div>
    </div>
  )
} 