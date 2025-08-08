import React, { useState, useEffect } from 'react';
import { AlertTriangle, Users, Zap, CheckCircle, XCircle } from 'lucide-react';
import { 
  CrisisScenario, 
  CrisisAdvisor, 
  CrisisAction,
  CrisisWebValidation 
} from '../../../shared/types/crisisManagement';

interface CrisisWebProps {
  sessionId: string;
  onComplete: () => void;
}

export const CrisisWeb: React.FC<CrisisWebProps> = ({ sessionId, onComplete }) => {
  const [scenarios, setScenarios] = useState<CrisisScenario[]>([]);
  const [advisors, setAdvisors] = useState<CrisisAdvisor[]>([]);
  const [actions, setActions] = useState<CrisisAction[]>([]);
  const [constraints, setConstraints] = useState({
    maxAdvisors: 2,
    maxActions: 3,
    totalPoints: 6
  });

  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [validation, setValidation] = useState<CrisisWebValidation | null>(null);
  const [assignment, setAssignment] = useState<{[k:string]: { advisor?: string, actions: string[] }}>({
    malaysia: { advisor: undefined, actions: [] },
    vietnam: { advisor: undefined, actions: [] },
    indonesia: { advisor: undefined, actions: [] }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCrisisData();
  }, []);

  useEffect(() => {
    if (selectedAdvisors.length > 0 || selectedActions.length > 0) {
      validateSelection();
    }
  }, [selectedAdvisors, selectedActions]);

  const apiBase = import.meta.env.VITE_API_URL || '';

  const loadCrisisData = async () => {
    try {
      const response = await fetch(`${apiBase}/crisis/crisis-data`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });
      const data = await response.json();
      setScenarios(data.scenarios);
      setAdvisors(data.advisors);
      setActions(data.actions);
      setConstraints(data.constraints);
    } catch (error) {
      console.error('Error loading crisis data:', error);
    }
  };

  const validateSelection = async () => {
    try {
      const response = await fetch(`${apiBase}/crisis/validate-crisis-web`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify({ selectedAdvisors, selectedActions })
      });
      const data = await response.json();
      setValidation(data);
    } catch (error) {
      console.error('Error validating selection:', error);
    }
  };

  const handleAdvisorToggle = (advisorId: string) => {
    setSelectedAdvisors(prev => {
      if (prev.includes(advisorId)) {
        return prev.filter(id => id !== advisorId);
      } else if (prev.length < constraints.maxAdvisors) {
        return [...prev, advisorId];
      }
      return prev;
    });
  };

  const handleActionToggle = (actionId: string) => {
    setSelectedActions(prev => {
      if (prev.includes(actionId)) {
        return prev.filter(id => id !== actionId);
      } else if (prev.length < constraints.maxActions) {
        return [...prev, actionId];
      }
      return prev;
    });
  };

  const handleSubmit = async () => {
    if (!selectedScenario || !validation?.isValid) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBase}/crisis/sessions/${sessionId}/submit-crisis-web`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify({
          scenarioId: selectedScenario,
          selectedAdvisors,
          selectedActions,
          assignment
        })
      });

      if (response.ok) {
        onComplete();
      }
    } catch (error) {
      console.error('Error submitting crisis web solution:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedAdvisor = (id: string) => advisors.find(a => a.id === id);
  const getSelectedAction = (id: string) => actions.find(a => a.id === id);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crisis Web Challenge</h1>
        <p className="text-gray-600">Select a crisis scenario and allocate your resources strategically</p>
      </div>

      {/* Crisis Scenarios */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
          Crisis Scenarios
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedScenario === scenario.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedScenario(scenario.id)}
            >
              <h3 className="font-semibold text-lg mb-2">{scenario.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{scenario.description}</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Severity:</span>
                  <span className={`font-medium ${
                    scenario.severity === 'CRITICAL' ? 'text-red-600' :
                    scenario.severity === 'HIGH' ? 'text-orange-600' :
                    scenario.severity === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {scenario.severity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time Pressure:</span>
                  <span className="font-medium">{scenario.timePressure}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Advisors Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-500" />
            Select Advisors ({selectedAdvisors.length}/{constraints.maxAdvisors})
          </h2>
          <div className="space-y-3">
            {advisors.map((advisor) => (
              <div
                key={advisor.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedAdvisors.includes(advisor.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleAdvisorToggle(advisor.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{advisor.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{advisor.expertise}</p>
                    <p className="text-xs text-green-600">Strength: {advisor.strength}</p>
                    <p className="text-xs text-red-600">Weakness: {advisor.weakness}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {advisor.cost} points
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-green-500" />
            Select Actions ({selectedActions.length}/{constraints.maxActions})
          </h2>
          <div className="space-y-3">
            {actions.map((action) => (
              <div
                key={action.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedActions.includes(action.id)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleActionToggle(action.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{action.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{action.description}</p>
                    <div className="flex gap-2 text-xs">
                      <span className="text-blue-600">Effectiveness: {action.effectiveness}/10</span>
                      <span className="text-gray-600">Time: {action.timeRequired}</span>
                      <span className={`${
                        action.risk === 'High' ? 'text-red-600' :
                        action.risk === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        Risk: {action.risk}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      {action.cost} points
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Country Assignment */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Country Assignment</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['malaysia','vietnam','indonesia'] as const).map(country => (
            <div key={country} className="border rounded p-3">
              <div className="font-medium capitalize mb-2">{country}</div>
              <div className="mb-2">
                <label className="block text-xs text-gray-600 mb-1">Advisor</label>
                <select
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={assignment[country].advisor || ''}
                  onChange={(e)=> setAssignment(prev=> ({...prev, [country]: { ...prev[country], advisor: e.target.value || undefined }}))}
                >
                  <option value="">None</option>
                  {advisors.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Actions</label>
                <div className="space-y-1">
                  {actions.map(act => (
                    <label key={act.id} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={assignment[country].actions.includes(act.id)}
                        onChange={(e)=> setAssignment(prev=> {
                          const curr = new Set(prev[country].actions);
                          if (e.target.checked) curr.add(act.id); else curr.delete(act.id);
                          return { ...prev, [country]: { ...prev[country], actions: Array.from(curr) } };
                        })}
                      />
                      <span>{act.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">Note: One country must be advisor-free; Vietnam cannot be advisor-free; Malaysia spend &gt; 30 triggers audit warning.</p>
      </div>

      {/* Validation and Summary */}
      {validation && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Validation & Summary</h2>
          
          {/* Validation Status */}
          <div className="flex items-center mb-4">
            {validation.isValid ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
            )}
            <span className={`font-medium ${
              validation.isValid ? 'text-green-600' : 'text-red-600'
            }`}>
              {validation.isValid ? 'Valid Configuration' : 'Invalid Configuration'}
            </span>
          </div>

          {/* Violations */}
          {validation.violations.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-red-600 mb-2">Issues Found:</h3>
              <ul className="space-y-1">
                {validation.violations.map((violation, index) => (
                  <li key={index} className="text-sm text-red-600 flex items-center">
                    <XCircle className="w-4 h-4 mr-1" />
                    {violation.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Resource Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-600">Total Cost</div>
              <div className="text-lg font-semibold">{validation.totalCost}/{constraints.totalPoints}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-600">Remaining Points</div>
              <div className="text-lg font-semibold text-green-600">{validation.remainingPoints}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-600">Status</div>
              <div className={`text-lg font-semibold ${
                validation.isValid ? 'text-green-600' : 'text-red-600'
              }`}>
                {validation.isValid ? 'Ready' : 'Invalid'}
              </div>
            </div>
          </div>

          {/* Selected Items Summary */}
          {(selectedAdvisors.length > 0 || selectedActions.length > 0) && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Selected Resources:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedAdvisors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-600 mb-1">Advisors:</h4>
                    <ul className="text-sm space-y-1">
                      {selectedAdvisors.map(id => {
                        const advisor = getSelectedAdvisor(id);
                        return advisor ? (
                          <li key={id} className="flex justify-between">
                            <span>{advisor.name}</span>
                            <span className="text-blue-600">{advisor.cost} pts</span>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                )}
                {selectedActions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-600 mb-1">Actions:</h4>
                    <ul className="text-sm space-y-1">
                      {selectedActions.map(id => {
                        const action = getSelectedAction(id);
                        return action ? (
                          <li key={id} className="flex justify-between">
                            <span>{action.name}</span>
                            <span className="text-green-600">{action.cost} pts</span>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={!selectedScenario || !validation?.isValid || isSubmitting}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
            !selectedScenario || !validation?.isValid || isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Crisis Web Solution'}
        </button>
      </div>
    </div>
  );
}; 