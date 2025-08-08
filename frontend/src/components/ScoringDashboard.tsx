import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Download, 
  FileText, 
  Award,
  Target,
  Activity,
  Eye,
  RefreshCw
} from 'lucide-react';
import { scoringService } from '../services/scoringService';
import { 
  ScoringResults, 
  UserTotalScore, 
  FinalReport
} from '../../../shared/types/scoring';


interface ScoringDashboardProps {
  sessionId: string;
}

const ScoringDashboard: React.FC<ScoringDashboardProps> = ({ sessionId }) => {
  const [scoringResults, setScoringResults] = useState<ScoringResults | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserTotalScore | null>(null);
  const [finalReport, setFinalReport] = useState<FinalReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'competencies' | 'tasks' | 'reports'>('overview');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  useEffect(() => {
    loadScoringResults();
  }, [sessionId]);

  const loadScoringResults = async () => {
    setLoading(true);
    try {
      const results = await scoringService.calculateScores(sessionId);
      setScoringResults(results);
    } catch (error) {
      console.error('Error loading scoring results:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFinalReport = async (userId: string) => {
    try {
      const report = await scoringService.generateFinalReport(sessionId, userId, true);
      setFinalReport(report);
    } catch (error) {
      console.error('Error loading final report:', error);
    }
  };

  const handleUserSelect = (user: UserTotalScore) => {
    setSelectedUser(user);
    loadFinalReport(user.userId);
  };

  const handleExport = async () => {
    try {
      await scoringService.downloadResults(sessionId, exportFormat, true);
    } catch (error) {
      console.error('Error exporting results:', error);
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 75) return 'text-blue-600 bg-blue-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    if (percentage >= 45) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Good';
    if (percentage >= 60) return 'Satisfactory';
    if (percentage >= 45) return 'Needs Improvement';
    return 'Poor';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2">Loading scoring results...</span>
      </div>
    );
  }

  if (!scoringResults) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No scoring results available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Comprehensive Scoring Dashboard</h2>
            <p className="text-gray-600">Session: {sessionId}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={loadScoringResults}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <div className="flex items-center space-x-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'competencies', label: 'Competencies', icon: Target },
              { id: 'tasks', label: 'Tasks', icon: Activity },
              { id: 'reports', label: 'Reports', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Total Participants</p>
                      <p className="text-2xl font-bold text-blue-900">{scoringResults.totalParticipants}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <Award className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Average Score</p>
                      <p className="text-2xl font-bold text-green-900">
                        {scoringResults.userScores.length > 0 
                          ? Math.round(scoringResults.userScores.reduce((sum, user) => sum + user.overallPercentage, 0) / scoringResults.userScores.length)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">Top Performer</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {scoringResults.userScores.length > 0 ? scoringResults.userScores[0].userName : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <Target className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-orange-600">Completion Rate</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {Object.values(scoringResults.taskBreakdown).reduce((sum, task) => sum + task.completionRate, 0) / Object.keys(scoringResults.taskBreakdown).length}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Performers Table */}
              <div className="bg-white rounded-lg border">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Top Performers</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {scoringResults.userScores.slice(0, 10).map((user) => (
                        <tr key={user.userId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              #{user.rank}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.userName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.totalScore.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(user.overallPercentage)}`}>
                              {user.overallPercentage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleUserSelect(user)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Report
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Competencies Tab */}
          {activeTab === 'competencies' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(scoringResults.competencyBreakdown).map(([category, data]) => (
                  <div key={category} className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{category.replace(/_/g, ' ')}</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Average Score:</span>
                        <span className="text-lg font-semibold">{data.averageScore.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${data.averageScore}%` }}
                        ></div>
                      </div>
                      {data.topPerformers.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Top Performers:</p>
                          <div className="flex flex-wrap gap-1">
                            {data.topPerformers.slice(0, 3).map((performer, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {performer}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(scoringResults.taskBreakdown).map(([taskType, data]) => (
                  <div key={taskType} className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{taskType.replace(/_/g, ' ')}</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Average Score:</span>
                        <span className="text-lg font-semibold">{data.averageScore.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${data.averageScore}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Completion Rate:</span>
                        <span className="text-sm font-medium">{data.completionRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              {selectedUser && finalReport ? (
                <div className="bg-white rounded-lg border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                      Final Report: {selectedUser.userName}
                    </h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(selectedUser.overallPercentage)}`}>
                      {getScoreLabel(selectedUser.overallPercentage)} ({selectedUser.overallPercentage.toFixed(1)}%)
                    </span>
                  </div>

                  {/* Competency Scores */}
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Competency Scores</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {finalReport.competencyScores.map((competency) => (
                        <div key={competency.competencyId} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-900">{competency.competencyName}</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(competency.percentage)}`}>
                              {competency.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${competency.percentage}%` }}
                            ></div>
                          </div>
                          
                          {/* Feedback */}
                          {finalReport.feedback.find(f => f.competencyId === competency.competencyId) && (
                            <div className="text-sm text-gray-600">
                              <div className="mb-2">
                                <strong>Strengths:</strong>
                                <ul className="list-disc list-inside ml-2">
                                  {finalReport.feedback.find(f => f.competencyId === competency.competencyId)?.strengths.map((strength, index) => (
                                    <li key={index}>{strength}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <strong>Areas for Improvement:</strong>
                                <ul className="list-disc list-inside ml-2">
                                  {finalReport.feedback.find(f => f.competencyId === competency.competencyId)?.areasForImprovement.map((area, index) => (
                                    <li key={index}>{area}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Task Scores */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Task Performance</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedUser.taskScores.map((task) => (
                            <tr key={task.taskType}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {task.taskName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {task.score.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {task.percentage.toFixed(1)}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(task.percentage)}`}>
                                  {getScoreLabel(task.percentage)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a user from the overview tab to view their detailed report</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoringDashboard; 

