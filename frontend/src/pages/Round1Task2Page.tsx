import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Users,
  Brain,
  DollarSign,
  Shield,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import { PartnerSelectionApiService } from '../services/partnerSelectionApi';
import { Partner, PartnerScore, PartnerSelection } from '../../../shared/types/partnerSelection';
import Timer from '../components/Timer';
import PartnerComparisonTable from '../components/PartnerComparisonTable';
import PartnerSelectionInterface from '../components/PartnerSelectionInterface';

const Round1Task2Page: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [scores, setScores] = useState<PartnerScore[]>([]);
  const [priorities, setPriorities] = useState<any>({});
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedSelection, setSubmittedSelection] = useState<PartnerSelection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load partners and scores in parallel
      const [partnersResponse, scoresResponse, selectionResponse] = await Promise.all([
        PartnerSelectionApiService.getPartners(),
        PartnerSelectionApiService.getPartnerScores(),
        PartnerSelectionApiService.getPartnerSelection()
      ]);

      setPartners(partnersResponse.partners);
      setScores(scoresResponse.scores);
      setPriorities(scoresResponse.priorities);

      // Check if user already submitted
      if (selectionResponse.selection) {
        setSubmittedSelection(selectionResponse.selection);
        setSelectedPartnerId(selectionResponse.selection.partnerId);
        setIsSubmitted(true);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load partner data');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePartnerSelect = useCallback((partnerId: string) => {
    if (!isSubmitted) {
      setSelectedPartnerId(partnerId);
    }
  }, [isSubmitted]);

  const handleSubmit = async () => {
    if (!selectedPartnerId || isSubmitted) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await PartnerSelectionApiService.submitPartnerSelection(selectedPartnerId);
      
      setSubmittedSelection(response.selection);
      setIsSubmitted(true);

      // Show success message
      setTimeout(() => {
        if (sessionId) {
          navigate(`/round2/market-selection/${sessionId}`);
        } else {
          navigate('/dashboard');
        }
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit selection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    if (selectedPartnerId && !isSubmitted) {
      handleSubmit();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading partner data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
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
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <h1 className="text-xl font-semibold text-gray-800">Round 1 - Task 2</h1>
                <p className="text-sm text-gray-600">Strategic Partner Selection</p>
              </div>
              
              <Timer
                duration={10 * 60} // 10 minutes
                onTimeUp={handleTimeUp}
                isRunning={!isSubmitted}
                onToggle={() => {}}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Task Description */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Task Overview</h2>
                <p className="text-gray-600 mb-4">
                  You need to select a strategic partner for your cold chain delivery expansion. 
                  Each partner has different strengths across key criteria. Consider the strategic 
                  priorities carefully when making your decision.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">Reach (25%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-700">Expertise (20%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">Cost (15%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-gray-700">Reliability (20%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm text-gray-700">Scalability (10%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-gray-700">Innovation (10%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Table Toggle */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {showComparison ? 'Hide' : 'Show'} Detailed Comparison Table
            </button>
          </div>

          {/* Comparison Table */}
          {showComparison && (
            <PartnerComparisonTable
              partners={partners}
              scores={scores}
              priorities={priorities}
            />
          )}

          {/* Partner Selection Interface */}
          <PartnerSelectionInterface
            partners={partners}
            scores={scores}
            selectedPartnerId={selectedPartnerId}
            onPartnerSelect={handlePartnerSelect}
            isSubmitted={isSubmitted}
          />

          {/* Submit Button */}
          {!isSubmitted && selectedPartnerId && (
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Submit Selection</span>
                  </div>
                )}
              </button>
            </div>
          )}

          {/* Success Message */}
          {isSubmitted && submittedSelection && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Selection Submitted Successfully!</h3>
                  <p className="text-green-700">
                    You selected <strong>{submittedSelection.partnerName}</strong> with a score of{' '}
                    <strong>{submittedSelection.score.toFixed(2)}/10</strong>
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    Redirecting to dashboard...
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Round1Task2Page; 