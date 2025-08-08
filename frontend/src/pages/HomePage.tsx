import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  Play, 
  Users, 
  TrendingUp, 
  Building2, 
  Target, 
  Award,
  ArrowRight,
  AlertTriangle
} from 'lucide-react'

export default function HomePage() {
  const { isConnected, joinGame } = useSocket()
  const [playerName, setPlayerName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [envError, setEnvError] = useState<string | null>(null)

  useEffect(() => {
    // Check environment variables
    const apiUrl = "https://business-simulation-game.xlri.online/api"
    const socketUrl = "https://business-simulation-game.xlri.online"
    
    if (!apiUrl || !socketUrl) {
      setEnvError('Environment variables are not configured. Please check VITE_API_URL and VITE_SOCKET_URL.')
    }
    
    // Simulate loading time
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleStartGame = () => {
    if (playerName.trim() && companyName.trim()) {
      const playerId = `player-${Date.now()}`
      joinGame(playerId)
      // In a real app, you'd create the player first via API
    }
  }

  const features = [
    {
      icon: Building2,
      title: 'Build Your Empire',
      description: 'Start with a small company and grow it into a business empire through strategic decisions.'
    },
    {
      icon: Users,
      title: 'Manage Your Team',
      description: 'Hire talented employees, manage their skills, and create a productive workforce.'
    },
    {
      icon: TrendingUp,
      title: 'Market Analysis',
      description: 'Analyze market trends, competitor data, and make informed business decisions.'
    },
    {
      icon: Target,
      title: 'Strategic Planning',
      description: 'Develop marketing campaigns, research new technologies, and expand your operations.'
    },
    {
      icon: Award,
      title: 'Compete & Win',
      description: 'Compete against other players and climb the leaderboard to become the top business tycoon.'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Initializing application..." />
      </div>
    )
  }

  if (envError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Configuration Error
            </h1>
            <p className="text-gray-600 mb-6">
              {envError}
            </p>
            <div className="bg-gray-100 p-4 rounded-lg text-left text-sm">
              <p className="font-semibold mb-2">Required Environment Variables:</p>
              <ul className="space-y-1 text-gray-700">
                <li>• VITE_API_URL: Backend API URL</li>
                <li>• VITE_SOCKET_URL: WebSocket server URL</li>
              </ul>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
          Business Simulation
          <span className="block text-primary-600">Game</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience the thrill of building and managing your own business empire. 
          Make strategic decisions, compete with other players, and become the ultimate business tycoon.
        </p>
        
        {/* Connection Status */}
        <div className="flex items-center justify-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success-500' : 'bg-error-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected to server' : 'Connecting to server...'}
          </span>
        </div>
      </div>

      {/* Start Game Form */}
      <div className="max-w-md mx-auto">
        <div className="card space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Start Your Journey</h2>
          
          <div>
            <label htmlFor="playerName" className="label">
              Your Name
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="input"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label htmlFor="companyName" className="label">
              Company Name
            </label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="input"
              placeholder="Enter your company name"
            />
          </div>

          <button
            onClick={handleStartGame}
            disabled={!isConnected || !playerName.trim() || !companyName.trim()}
            className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-5 w-5" />
            <span>Start Game</span>
          </button>

          <div className="text-center">
            <Link to="/game" className="text-primary-600 hover:text-primary-700 text-sm">
              Or continue existing game
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center">
          Game Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="card text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <feature.icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/dashboard"
          className="card hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Dashboard</h3>
              <p className="text-gray-600">View your game overview</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
          </div>
        </Link>

        <Link
          to="/market"
          className="card hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Market</h3>
              <p className="text-gray-600">Analyze market trends</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
          </div>
        </Link>

        <Link
          to="/leaderboard"
          className="card hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
              <p className="text-gray-600">See top players</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
          </div>
        </Link>
      </div>
    </div>
  )
} 