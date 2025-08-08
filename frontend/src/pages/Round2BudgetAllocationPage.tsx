import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { GroupApiService } from '../services/groupApi';

import Timer from '../components/Timer';
import GroupChat from '../components/GroupChat';

interface BudgetFunction {
  id: string;
  name: string;
  description: string;
  roi: string;
  criticality: string;
  suitability: string;
  priority: number;
}

const INITIAL_FUNCTIONS: BudgetFunction[] = [];

export default function Round2BudgetAllocationPage() {
  const { sessionId } = useParams();

  const [functions, setFunctions] = useState<BudgetFunction[]>(INITIAL_FUNCTIONS);
  const [guidance, setGuidance] = useState<Record<string, Record<string, string>>>({});
  const [regionId, setRegionId] = useState<'A'|'B'|'C'|'D'|'E'|'F'>('E');
  const navigate = useNavigate();
  
  const [timeLeft] = useState(600); // 10 minutes
  const [isConsensusRequested, setIsConsensusRequested] = useState(false);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [consensusResponses, setConsensusResponses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    GroupApiService.getBudgetData().then(res => {
      const funcs = res.functions.map((f: any) => ({ id: f.id, name: f.name, description: f.description, roi: '', criticality: '', suitability: '', priority: 0 }));
      setFunctions(funcs);
      setGuidance(res.regionGuidance || {});
    });
  }, []);

  const handlePriorityChange = (functionId: string, newPriority: number) => {
    setFunctions(prev => prev.map(func => 
      func.id === functionId 
        ? { ...func, priority: newPriority }
        : func
    ));
  };

  const handleFunctionUpdate = async () => {
    // no-op persist; optional live updates can be added via sockets
  };

  const handleRequestConsensus = () => {
    setIsConsensusRequested(true);
  };

  const handleConsensusResponse = (agreed: boolean) => {
    // UI only for now
  };

  const handleFinalizeDecision = async () => {
    const sorted = [...functions].sort((a, b) => a.priority - b.priority);
    const order = sorted.map(f => f.id);
    await apiClient.post('/groups/budget/ordering', { order, regionId, sessionId });
    navigate(`/round3/${sessionId}`);
  };

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return 'bg-red-100 text-red-800';
    if (priority === 2) return 'bg-orange-100 text-orange-800';
    if (priority === 3) return 'bg-yellow-100 text-yellow-800';
    if (priority === 4) return 'bg-blue-100 text-blue-800';
    if (priority === 5) return 'bg-green-100 text-green-800';
    if (priority === 6) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Round 2: Budget Allocation</h1>
              <p className="text-gray-600 mt-2">
                Prioritize budget functions for the selected market
              </p>
            </div>
            <Timer 
              timeLeft={timeLeft} 
              onTimeUp={() => navigate(`/round3/${sessionId}`)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Budget Functions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Budget Functions</h2>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Region:</label>
                  <select value={regionId} onChange={(e)=> setRegionId(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
                    {['A','B','C','D','E','F'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                {functions.map((func) => (
                  <div key={func.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {func.name}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">{func.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={func.priority}
                          onChange={(e) => handlePriorityChange(func.id, parseInt(e.target.value))}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value={0}>Not Set</option>
                          <option value={1}>1st Priority</option>
                          <option value={2}>2nd Priority</option>
                          <option value={3}>3rd Priority</option>
                          <option value={4}>4th Priority</option>
                          <option value={5}>5th Priority</option>
                          <option value={6}>6th Priority</option>
                        </select>
                        {func.priority > 0 && (
                          <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(func.priority)}`}>
                            {func.priority}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">ROI:</span>
                        <p className="text-gray-600">{func.roi}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Criticality:</span>
                        <p className="text-gray-600">{func.criticality}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Suitability:</span>
                        <p className="text-gray-600">{func.suitability}</p>
                      </div>
                    </div>
                    {guidance[regionId] && (
                      <div className="mt-2 text-xs text-gray-600">
                        <span className="font-medium">Guidance:</span> {guidance[regionId][func.id]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <button
                  onClick={handleFunctionUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update Priorities
                </button>
                <button
                  onClick={handleRequestConsensus}
                  disabled={isConsensusRequested}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  {isConsensusRequested ? 'Consensus Requested' : 'Request Consensus'}
                </button>
              </div>
            </div>
          </div>

          {/* Group Collaboration */}
          <div className="space-y-6">
            {/* Group Members */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Members</h3>
              <div className="space-y-2">
                {groupMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <span className="text-gray-700">{member.name}</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      consensusResponses[member.id] !== undefined 
                        ? consensusResponses[member.id] 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {consensusResponses[member.id] !== undefined 
                        ? consensusResponses[member.id] ? 'Agreed' : 'Disagreed'
                        : 'Pending'
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Consensus Response */}
            {isConsensusRequested && consensusResponses['user-id'] === undefined && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Consensus Request</h3>
                <p className="text-gray-600 mb-4">
                  Do you agree with the current budget allocation priorities?
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleConsensusResponse(true)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Agree
                  </button>
                  <button
                    onClick={() => handleConsensusResponse(false)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Disagree
                  </button>
                </div>
              </div>
            )}

            {/* Group Chat */}
            <GroupChat sessionId={sessionId!} taskType="BUDGET_ALLOCATION" />

            {/* Final Decision */}
            {Object.keys(consensusResponses).length === groupMembers.length && groupMembers.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Final Decision</h3>
                <button
                  onClick={handleFinalizeDecision}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Finalize Budget Allocation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
