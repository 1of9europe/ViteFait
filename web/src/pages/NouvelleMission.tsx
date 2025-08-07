import React, { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Clock, 
  CreditCard, 
  CheckCircle 
} from 'lucide-react'

// Schémas de validation pour chaque étape
const step1Schema = Yup.object().shape({
  title: Yup.string().required('Titre requis'),
  description: Yup.string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .required('Description requise'),
  category: Yup.string().required('Catégorie requise'),
})

const step2Schema = Yup.object().shape({
  pickupAddress: Yup.string().required('Adresse de départ requise'),
  dropAddress: Yup.string(),
})

const step3Schema = Yup.object().shape({
  date: Yup.date()
    .min(new Date(), 'La date doit être dans le futur')
    .required('Date requise'),
  time: Yup.string().required('Heure requise'),
  durationMin: Yup.number()
    .min(15, 'Durée minimum 15 minutes')
    .required('Durée minimum requise'),
  durationMax: Yup.number()
    .min(Yup.ref('durationMin'), 'Durée max doit être >= durée min')
    .required('Durée maximum requise'),
})

const step4Schema = Yup.object().shape({
  priority: Yup.string().required('Priorité requise'),
  meetingRequired: Yup.boolean(),
  meetingLocation: Yup.string().when('meetingRequired', {
    is: true,
    then: (schema) => schema.required('Lieu de rencontre requis'),
  }),
  meetingDatetime: Yup.string().when('meetingRequired', {
    is: true,
    then: (schema) => schema.required('Date/heure de rencontre requise'),
  }),
  cguAccepted: Yup.boolean()
    .oneOf([true], 'Vous devez accepter les CGU'),
})

interface MissionFormData {
  // Étape 1: Infos générales
  title: string
  description: string
  category: string

  // Étape 2: Adresses
  pickupAddress: string
  dropAddress: string

  // Étape 3: Créneau horaire
  date: string
  time: string
  durationMin: number
  durationMax: number

  // Étape 4: Paiement & confirmation
  priority: string
  meetingRequired: boolean
  meetingLocation: string
  meetingDatetime: string
  cguAccepted: boolean
}

const initialValues: MissionFormData = {
  title: '',
  description: '',
  category: '',
  pickupAddress: '',
  dropAddress: '',
  date: '',
  time: '',
  durationMin: 30,
  durationMax: 60,
  priority: 'normal',
  meetingRequired: false,
  meetingLocation: '',
  meetingDatetime: '',
  cguAccepted: false,
}

const steps = [
  { id: 1, title: 'Infos générales', icon: CheckCircle },
  { id: 2, title: 'Adresses', icon: MapPin },
  { id: 3, title: 'Créneau horaire', icon: Clock },
  { id: 4, title: 'Paiement & confirmation', icon: CreditCard },
]

export default function NouvelleMission() {
  const [currentStep, setCurrentStep] = useState(1)
  const navigate = useNavigate()

  const getCurrentSchema = () => {
    switch (currentStep) {
      case 1: return step1Schema
      case 2: return step2Schema
      case 3: return step3Schema
      case 4: return step4Schema
      default: return step1Schema
    }
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (values: MissionFormData) => {
    try {
      console.log('Mission créée:', values)
      // TODO: Appel API pour créer la mission
      navigate('/missions')
    } catch (error) {
      console.error('Erreur lors de la création:', error)
    }
  }

  const renderStepContent = (values: MissionFormData) => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Titre de la mission *
              </label>
              <Field
                id="title"
                name="title"
                type="text"
                className="input-field mt-1"
                placeholder="Ex: Courses alimentaires"
              />
              <ErrorMessage name="title" component="div" className="text-red-600 text-sm mt-1" />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <Field
                id="description"
                name="description"
                as="textarea"
                rows={4}
                className="input-field mt-1"
                placeholder="Décrivez votre mission en détail..."
              />
              <ErrorMessage name="description" component="div" className="text-red-600 text-sm mt-1" />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Catégorie *
              </label>
              <Field
                id="category"
                name="category"
                as="select"
                className="input-field mt-1"
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="courses">Courses</option>
                <option value="menage">Ménage</option>
                <option value="livraison">Livraison</option>
                <option value="garde">Garde d'enfants</option>
                <option value="autre">Autre</option>
              </Field>
              <ErrorMessage name="category" component="div" className="text-red-600 text-sm mt-1" />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="pickupAddress" className="block text-sm font-medium text-gray-700">
                Adresse de départ *
              </label>
              <Field
                id="pickupAddress"
                name="pickupAddress"
                type="text"
                className="input-field mt-1"
                placeholder="123 Rue de la Paix, 75001 Paris"
              />
              <ErrorMessage name="pickupAddress" component="div" className="text-red-600 text-sm mt-1" />
            </div>

            <div>
              <label htmlFor="dropAddress" className="block text-sm font-medium text-gray-700">
                Adresse de destination
              </label>
              <Field
                id="dropAddress"
                name="dropAddress"
                type="text"
                className="input-field mt-1"
                placeholder="456 Avenue des Champs, 75008 Paris"
              />
              <ErrorMessage name="dropAddress" component="div" className="text-red-600 text-sm mt-1" />
            </div>

            <button
              type="button"
              className="btn-secondary flex items-center"
              onClick={() => {
                // TODO: Utiliser l'API Geolocation
                console.log('Utiliser ma position')
              }}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Utiliser ma position
            </button>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date *
                </label>
                <Field
                  id="date"
                  name="date"
                  type="date"
                  className="input-field mt-1"
                />
                <ErrorMessage name="date" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                  Heure *
                </label>
                <Field
                  id="time"
                  name="time"
                  type="time"
                  className="input-field mt-1"
                />
                <ErrorMessage name="time" component="div" className="text-red-600 text-sm mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="durationMin" className="block text-sm font-medium text-gray-700">
                  Durée minimum (min) *
                </label>
                <Field
                  id="durationMin"
                  name="durationMin"
                  type="number"
                  min="15"
                  className="input-field mt-1"
                />
                <ErrorMessage name="durationMin" component="div" className="text-red-600 text-sm mt-1" />
              </div>

              <div>
                <label htmlFor="durationMax" className="block text-sm font-medium text-gray-700">
                  Durée maximum (min) *
                </label>
                <Field
                  id="durationMax"
                  name="durationMax"
                  type="number"
                  min={values.durationMin}
                  className="input-field mt-1"
                />
                <ErrorMessage name="durationMax" component="div" className="text-red-600 text-sm mt-1" />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Durée estimée :</strong> {values.durationMin}–{values.durationMax} minutes
              </p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            {/* Récapitulatif */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Récapitulatif</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Titre :</strong> {values.title}</p>
                <p><strong>Description :</strong> {values.description}</p>
                <p><strong>Adresse de départ :</strong> {values.pickupAddress}</p>
                {values.dropAddress && (
                  <p><strong>Adresse de destination :</strong> {values.dropAddress}</p>
                )}
                <p><strong>Date :</strong> {values.date} à {values.time}</p>
                <p><strong>Durée :</strong> {values.durationMin}–{values.durationMax} minutes</p>
              </div>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priorité *
              </label>
              <Field
                id="priority"
                name="priority"
                as="select"
                className="input-field mt-1"
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent (+20% de frais)</option>
              </Field>
              <ErrorMessage name="priority" component="div" className="text-red-600 text-sm mt-1" />
            </div>

            <div>
              <label className="flex items-center">
                <Field
                  type="checkbox"
                  name="meetingRequired"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Rencontre initiale requise
                </span>
              </label>
            </div>

            {values.meetingRequired && (
              <div className="space-y-4 border-l-4 border-primary-200 pl-4">
                <div>
                  <label htmlFor="meetingLocation" className="block text-sm font-medium text-gray-700">
                    Lieu de rencontre *
                  </label>
                  <Field
                    id="meetingLocation"
                    name="meetingLocation"
                    type="text"
                    className="input-field mt-1"
                    placeholder="Café, bureau, etc."
                  />
                  <ErrorMessage name="meetingLocation" component="div" className="text-red-600 text-sm mt-1" />
                </div>

                <div>
                  <label htmlFor="meetingDatetime" className="block text-sm font-medium text-gray-700">
                    Date/heure de rencontre *
                  </label>
                  <Field
                    id="meetingDatetime"
                    name="meetingDatetime"
                    type="datetime-local"
                    className="input-field mt-1"
                  />
                  <ErrorMessage name="meetingDatetime" component="div" className="text-red-600 text-sm mt-1" />
                </div>
              </div>
            )}

            <div>
              <label className="flex items-start">
                <Field
                  type="checkbox"
                  name="cguAccepted"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                />
                <span className="ml-2 text-sm text-gray-700">
                  J'accepte les <a href="#" className="text-primary-600 hover:underline">conditions générales d'utilisation</a> *
                </span>
              </label>
              <ErrorMessage name="cguAccepted" component="div" className="text-red-600 text-sm mt-1" />
            </div>

            {/* TODO: Intégration Stripe */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Paiement :</strong> L'intégration Stripe sera ajoutée ici
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Nouvelle Mission</h1>
      
      {/* Indicateur de progression */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step.id <= currentStep 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                <step.icon className="h-4 w-4" />
              </div>
              <span className={`ml-2 text-sm font-medium ${
                step.id <= currentStep ? 'text-primary-600' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  step.id < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <Formik
          initialValues={initialValues}
          validationSchema={getCurrentSchema()}
          onSubmit={handleSubmit}
        >
          {({ values, isValid, dirty }) => (
            <Form className="space-y-6">
              {renderStepContent(values)}

              <div className="flex justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Précédent
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!isValid || !dirty}
                    className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!isValid || !dirty}
                    className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Créer la mission
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </button>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
} 