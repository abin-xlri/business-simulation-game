import { useSocket } from '../hooks/useSocket'
import { 
  DollarSign, 
  Users, 
  Building2, 
  TrendingUp,
  Play,
  Pause,
  Square
} from 'lucide-react'

export default function GamePage() {
  const { gameState, player, isConnected } = useSocket()

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Connecting to game server...</p>
      </div>
    )
  }

  if (!player) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Not in Game</h2>
        <p className="text-gray-600">Please start a game from the home page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Game Session</h1>
          <p className="text-gray-600">Welcome back, {player.name}!</p>
        </div>
        
        <div className="flex space-x-2">
          <button className="btn-success flex items-center space-x-2">
            <Play className="h-4 w-4" />
            <span>Start</span>
          </button>
          <button className="btn-warning flex items-center space-x-2">
            <Pause className="h-4 w-4" />
            <span>Pause</span>
          </button>
          <button className="btn-error flex items-center space-x-2">
            <Square className="h-4 w-4" />
            <span>End</span>
          </button>
        </div>
      </div>

      {/* Player Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Balance</p>
              <p className="text-xl font-semibold text-gray-900">
                ${player.balance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Employees</p>
              <p className="text-xl font-semibold text-gray-900">
                {player.company.employees.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-warning-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Facilities</p>
              <p className="text-xl font-semibold text-gray-900">
                {player.company.facilities.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-secondary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Products</p>
              <p className="text-xl font-semibold text-gray-900">
                {player.company.products.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Game State Info */}
      {gameState && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Players */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Players</h3>
            <div className="space-y-2">
              {gameState.players.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-sm text-gray-600">
                    ${p.balance.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Events */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h3>
            <div className="space-y-2">
              {gameState.events.slice(-5).map((event: any) => (
                <div key={event.id} className="p-2 bg-gray-50 rounded">
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-gray-600">{event.description}</p>
                </div>
              ))}
              {gameState.events.length === 0 && (
                <p className="text-gray-500 text-sm">No events yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Company Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Company Details</h4>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-600">Name:</span> {player.company.name}</p>
              <p><span className="text-gray-600">Industry:</span> {player.company.industry}</p>
              <p><span className="text-gray-600">Founded:</span> {new Date(player.company.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Marketing</h4>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-600">Budget:</span> ${player.company.marketing.budget.toLocaleString()}</p>
              <p><span className="text-gray-600">Brand Awareness:</span> {player.company.marketing.brandAwareness}%</p>
              <p><span className="text-gray-600">Customer Satisfaction:</span> {player.company.marketing.customerSatisfaction}%</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Research</h4>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-600">Budget:</span> ${player.company.research.budget.toLocaleString()}</p>
              <p><span className="text-gray-600">Tech Level:</span> {player.company.research.technologyLevel}</p>
              <p><span className="text-gray-600">Innovation Score:</span> {player.company.research.innovationScore}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
