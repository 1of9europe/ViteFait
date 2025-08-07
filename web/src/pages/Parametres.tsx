import { Settings, User, Bell, Shield } from 'lucide-react'

export default function Parametres() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Paramètres</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Profil</h2>
          </div>
          <p className="text-gray-600">Gérez vos informations personnelles</p>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
          <p className="text-gray-600">Configurez vos préférences de notifications</p>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
          </div>
          <p className="text-gray-600">Gérez votre mot de passe et la sécurité</p>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <Settings className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Préférences</h2>
          </div>
          <p className="text-gray-600">Personnalisez votre expérience</p>
        </div>
      </div>
    </div>
  )
} 