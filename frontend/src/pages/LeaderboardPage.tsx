import { useParams } from 'react-router-dom'
import { Trophy, Medal, Award, Crown } from 'lucide-react'
import { adminService } from '../services/adminService'
import { useEffect, useState } from 'react'

export default function LeaderboardPage() {
  const { sessionId } = useParams()
  const [scores, setScores] = useState<any[]>([])

  useEffect(() => {
    if (!sessionId) return
    adminService.calculateScores(sessionId).then((res: any) => {
      setScores(res.scores || [])
    }).catch(() => setScores([]))
  }, [sessionId])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-medium text-gray-500">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-yellow-200'
      case 2:
        return 'bg-gray-50 border-gray-200'
      case 3:
        return 'bg-amber-50 border-amber-200'
      default:
        return 'bg-white border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Trophy className="h-8 w-8 text-primary-600" />
        <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
      </div>

      {scores.length > 0 ? (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Players</h3>
          <div className="space-y-3">
            {scores
              .map((player: any, index: number) => (
                <div
                  key={player.userId}
                  className={`flex items-center justify-between p-4 rounded-lg border ${getRankColor(index + 1)}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8">
                      {getRankIcon(index + 1)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{player.userName}</p>
                      <p className="text-sm text-gray-600">Total Score</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-success-600">{player.totalScore}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Players Yet</h3>
          <p className="text-gray-600">Leaderboard will display after scoring is calculated.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <h4 className="font-semibold text-gray-900 mb-2">Total Participants</h4>
          <p className="text-3xl font-bold text-primary-600">{scores.length}</p>
        </div>
        <div className="card text-center">
          <h4 className="font-semibold text-gray-900 mb-2">Average Score</h4>
          <p className="text-3xl font-bold text-success-600">{scores.length ? Math.round(scores.reduce((s, p) => s + p.totalScore, 0) / scores.length) : 0}</p>
        </div>
        <div className="card text-center">
          <h4 className="font-semibold text-gray-900 mb-2">Game Status</h4>
          <p className="text-3xl font-bold text-warning-600">
            Completed
          </p>
        </div>
      </div>
    </div>
  )
} 
