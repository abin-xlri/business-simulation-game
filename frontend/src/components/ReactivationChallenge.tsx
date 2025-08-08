import React, { useState, useEffect } from 'react';
import { 
  Network, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  GanttChart
} from 'lucide-react';
import { 
  ReactivationNode, 
  ReactivationValidation 
} from '../../../shared/types/crisisManagement';

interface ReactivationChallengeProps {
  sessionId: string;
  onComplete: () => void;
}

export const ReactivationChallenge: React.FC<ReactivationChallengeProps> = ({ 
  sessionId, 
  onComplete 
}) => {
  const [nodes, setNodes] = useState<ReactivationNode[]>([]);
  const [constraints, setConstraints] = useState({
    maxParallelTasks: 3,
    criticalPathTime: 24,
    resourceLimits: {} as Record<string, number>
  });
  const [sequence, setSequence] = useState<string[]>([]);
  const [validation, setValidation] = useState<ReactivationValidation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    loadReactivationData();
  }, []);

  useEffect(() => {
    if (sequence.length > 0) {
      validateSequence();
    }
  }, [sequence]);

  const apiBase = import.meta.env.VITE_API_URL || '';

  const loadReactivationData = async () => {
    try {
      const response = await fetch(`${apiBase}/crisis/reactivation-data`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });
      const data = await response.json();
      setNodes(data.nodes);
      setConstraints(data.constraints);
    } catch (error) {
      console.error('Error loading reactivation data:', error);
    }
  };

  const validateSequence = async () => {
    try {
      const response = await fetch(`${apiBase}/crisis/validate-reactivation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify({ sequence })
      });
      const data = await response.json();
      setValidation(data);
    } catch (error) {
      console.error('Error validating sequence:', error);
    }
  };

  const handleNodeAdd = (nodeId: string) => {
    if (!sequence.includes(nodeId)) {
      setSequence(prev => [...prev, nodeId]);
    }
  };

  const handleNodeRemove = (index: number) => {
    setSequence(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;

    setSequence(prev => {
      const newSequence = [...prev];
      const [draggedItem] = newSequence.splice(dragIndex, 1);
      newSequence.splice(targetIndex, 0, draggedItem);
      return newSequence;
    });
    setDragIndex(null);
  };

  const handleSubmit = async () => {
    if (!validation?.isValid) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBase}/crisis/sessions/${sessionId}/submit-reactivation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify({ sequence })
      });

      if (response.ok) {
        onComplete();
      }
    } catch (error) {
      console.error('Error submitting reactivation sequence:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNodeById = (id: string) => nodes.find(n => n.id === id);
  const getNodeDependencies = (nodeId: string) => {
    const node = getNodeById(nodeId);
    return node?.dependencies || [];
  };

  const isDependencySatisfied = (nodeId: string, currentIndex: number) => {
    const dependencies = getNodeDependencies(nodeId);
    return dependencies.every(depId => {
      const depIndex = sequence.indexOf(depId);
      return depIndex !== -1 && depIndex < currentIndex;
    });
  };



  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reactivation Challenge</h1>
        <p className="text-gray-600">Plan the optimal sequence to restore critical infrastructure</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Nodes */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Network className="w-5 h-5 mr-2 text-blue-500" />
              Available Systems
            </h2>
            <div className="space-y-3">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    sequence.includes(node.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleNodeAdd(node.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{node.name}</h3>
                      <p className="text-xs text-gray-600 mb-1">{node.description}</p>
                      <div className="flex gap-2 text-xs">
                        <span className="text-blue-600">Priority: {node.priority}</span>
                        <span className="text-green-600">{node.duration}h</span>
                      </div>
                      {node.dependencies.length > 0 && (
                        <p className="text-xs text-orange-600 mt-1">
                          Depends on: {node.dependencies.join(', ')}
                        </p>
                      )}
                    </div>
                    {sequence.includes(node.id) && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sequence Builder */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <GanttChart className="w-5 h-5 mr-2 text-green-500" />
              Restoration Sequence
            </h2>
            
            {/* Sequence Display */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 min-h-16 p-3 border-2 border-dashed border-gray-300 rounded-lg">
                {sequence.map((nodeId, index) => {
                  const node = getNodeById(nodeId);
                  const isDependencyValid = isDependencySatisfied(nodeId, index);
                  
                  return node ? (
                    <div
                      key={`${nodeId}-${index}`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)}
                      className={`p-2 rounded border cursor-move transition-colors ${
                        isDependencyValid
                          ? 'bg-green-100 border-green-300'
                          : 'bg-red-100 border-red-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{node.name}</span>
                        <button
                          onClick={() => handleNodeRemove(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-600">
                        {node.duration}h • Priority {node.priority}
                      </div>
                      {!isDependencyValid && (
                        <div className="text-xs text-red-600 mt-1">
                          Dependencies not met
                        </div>
                      )}
                    </div>
                  ) : null;
                })}
                {sequence.length === 0 && (
                  <div className="text-gray-500 text-sm">
                    Drag nodes here to build your sequence
                  </div>
                )}
              </div>
            </div>

            {/* Validation and Metrics */}
            {validation && (
              <div className="space-y-4">
                {/* Validation Status */}
                <div className="flex items-center">
                  {validation.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  <span className={`font-medium ${
                    validation.isValid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {validation.isValid ? 'Valid Sequence' : 'Invalid Sequence'}
                  </span>
                </div>

                {/* Violations */}
                {validation.violations.length > 0 && (
                  <div className="bg-red-50 p-3 rounded">
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

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-600">Total Duration</div>
                    <div className="text-lg font-semibold">{validation.totalDuration}h</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-600">Critical Path</div>
                    <div className="text-lg font-semibold">{validation.criticalPathTime}h</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-600">Max Parallel</div>
                    <div className="text-lg font-semibold">{constraints.maxParallelTasks}</div>
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

                {/* Resource Utilization */}
                <div className="bg-blue-50 p-3 rounded">
                  <h3 className="font-semibold text-blue-600 mb-2">Resource Utilization:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(validation.resourceConflicts).map(([resource, count]) => (
                      <div key={resource} className="flex justify-between text-sm">
                        <span>{resource}:</span>
                        <span className={`font-medium ${
                          count > (constraints.resourceLimits[resource] || 0)
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}>
                          {count}/{constraints.resourceLimits[resource] || '∞'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dependency Visualization */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Network className="w-5 h-5 mr-2 text-purple-500" />
          System Dependencies
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {nodes.map((node) => (
            <div key={node.id} className="p-3 border rounded-lg">
              <h3 className="font-semibold text-sm mb-2">{node.name}</h3>
              {node.dependencies.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">Depends on:</p>
                  {node.dependencies.map((depId) => {
                    const depNode = getNodeById(depId);
                    return (
                      <div key={depId} className="flex items-center text-xs">
                        <ArrowRight className="w-3 h-3 mr-1" />
                        <span className="text-blue-600">{depNode?.name || depId}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-green-600">No dependencies</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={!validation?.isValid || isSubmitting}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
            !validation?.isValid || isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Reactivation Sequence'}
        </button>
      </div>
    </div>
  );
}; 
