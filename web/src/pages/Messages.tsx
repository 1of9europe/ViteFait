import { MessageSquare, Send } from 'lucide-react'

export default function Messages() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
      
      <div className="card">
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Fonctionnalité de messagerie à venir</p>
        </div>
      </div>
    </div>
  )
} 