import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { Round1ApiService } from '../services/round1Api';
import { Station, RouteCalculationResult } from '../../../shared/types/round1';
import Timer from '../components/Timer';
import { useSessionManager } from '../hooks/useSessionManager';
import StationSelector from '../components/StationSelector';
import RouteVisualizer from '../components/RouteVisualizer';
import CalculationDisplay from '../components/CalculationDisplay';

const Round1Task1Page: React.FC = () => {
  // Ensure we listen and redirect on orchestrator task changes for this route too
  useSessionManager();
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string[]>([]);
  const [calculation, setCalculation] = useState<RouteCalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load stations on component mount
  useEffect(() => {
    const loadStations = async () => {
      try {
        const response = await Round1ApiService.getStations();
        setStations(response.stations);
      } catch (err) {
        setError('Failed to load stations');
        console.error('Error loading stations:', err);
      }
    };

    loadStations();
  }, []);

  // Calculate route when selectedRoute changes
  const calculateRoute = useCallback(async (route: string[]) => {
    if (route.length < 2) {
      setCalculation(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await Round1ApiService.calculateRoute(route);
      setCalculation(response.calculation);
    } catch (err) {
      setError('Failed to calculate route');
      console.error('Error calculating route:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    calculateRoute(selectedRoute);
  }, [selectedRoute, calculateRoute]);

  const handleStationClick = (stationCode: string) => {
    if (isSubmitted) return; // Prevent changes after submission
    
    setSelectedRoute(prev => {
      // If route is empty or last station is different, add new station
      if (prev.length === 0 || prev[prev.length - 1] !== stationCode) {
        return [...prev, stationCode];
      }
      return prev;
    });
  };

  const handleRouteChange = (route: string[]) => {
    if (isSubmitted) return; // Prevent changes after submission
    setSelectedRoute(route);
  };

  const handleTimerToggle = (running: boolean) => {
    setIsTimerRunning(running);
  };

  const handleTimeUp = () => {
    setIsTimerRunning(false);
    if (!isSubmitted) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (selectedRoute.length < 2) {
      setError('Please select at least 2 stations for your route');
      return;
    }

    if (isSubmitted) return;

    setIsSubmitted(true);
    setIsTimerRunning(false);

    try {
      // Final calculation and submission
      await Round1ApiService.calculateRoute(selectedRoute);
      
      // Show success message
      setTimeout(() => {
        alert('Route submitted successfully!');
        // Admin orchestrator will advance task; ensure user is routed if needed
        if (sessionId) {
          navigate(`/round1/task2/${sessionId}`);
        } else {
          navigate('/dashboard');
        }
      }, 1000);
    } catch (err) {
      setError('Failed to submit route');
      setIsSubmitted(false);
      console.error('Error submitting route:', err);
    }
  };

  const handleReset = () => {
    setSelectedRoute([]);
    setCalculation(null);
    setError(null);
    setIsSubmitted(false);
    setIsTimerRunning(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Round 1 - Task 1</h1>
                <p className="text-sm text-gray-600">Cold Chain Delivery Route Optimization</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Timer
                duration={20}
                onTimeUp={handleTimeUp}
                isRunning={isTimerRunning}
                onToggle={handleTimerToggle}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Task Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Task Instructions</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Optimize your cold chain delivery route to maximize profit while avoiding time breaches</p>
                <p>• Each segment must be completed within 2 hours to maintain cold chain integrity</p>
                <p>• Revenue is based on station risk levels, with regional modifiers applied</p>
                <p>• Operating costs include fuel and van time expenses</p>
                <p>• You have 20 minutes to complete this task</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Route Building */}
          <div className="space-y-6">
            <StationSelector
              stations={stations}
              selectedRoute={selectedRoute}
              onRouteChange={handleRouteChange}
              onStationClick={handleStationClick}
            />
            
            <RouteVisualizer
              stations={stations}
              selectedRoute={selectedRoute}
              segments={calculation?.segments}
              showBreaches={true}
            />
          </div>

          {/* Right Column - Calculations & Controls */}
          <div className="space-y-6">
            <CalculationDisplay
              calculation={calculation}
              isLoading={isLoading}
            />

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
              
              <div className="space-y-3">
                {!isSubmitted ? (
                  <>
                    <button
                      onClick={handleSubmit}
                      disabled={selectedRoute.length < 2 || isLoading}
                      className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Submit Route</span>
                    </button>
                    
                    <button
                      onClick={handleReset}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>Reset Route</span>
                    </button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-medium">Route Submitted Successfully!</p>
                    <p className="text-sm text-gray-600 mt-1">Redirecting to dashboard...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            {calculation && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Stations Visited</div>
                    <div className="font-semibold">{new Set(selectedRoute).size}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Route Length</div>
                    <div className="font-semibold">{selectedRoute.length} stops</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Cold Chain Breaches</div>
                    <div className="font-semibold text-red-600">{calculation.coldChainBreaches}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Efficiency</div>
                    <div className="font-semibold">
                      {Math.round((calculation.netProfit / 500000) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Round1Task1Page; 
