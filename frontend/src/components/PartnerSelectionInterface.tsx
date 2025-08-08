import React from 'react';
import { 
  CheckCircle, 
  Circle, 
  Users, 
  Brain, 
  DollarSign, 
  Shield, 
  TrendingUp, 
  Lightbulb,
  Star
} from 'lucide-react';
import { Partner, PartnerScore } from '../../../shared/types/partnerSelection';

interface PartnerSelectionInterfaceProps {
  partners: Partner[];
  scores: PartnerScore[];
  selectedPartnerId: string | null;
  onPartnerSelect: (partnerId: string) => void;
  isSubmitted: boolean;
}

const PartnerSelectionInterface: React.FC<PartnerSelectionInterfaceProps> = ({
  partners,
  scores,
  selectedPartnerId,
  onPartnerSelect,
  isSubmitted
}) => {
  const criteriaConfig = [
    { key: 'reach', label: 'Reach', icon: Users, color: 'text-blue-600' },
    { key: 'expertise', label: 'Expertise', icon: Brain, color: 'text-purple-600' },
    { key: 'cost', label: 'Cost', icon: DollarSign, color: 'text-green-600' },
    { key: 'reliability', label: 'Reliability', icon: Shield, color: 'text-orange-600' },
    { key: 'scalability', label: 'Scalability', icon: TrendingUp, color: 'text-indigo-600' },
    { key: 'innovation', label: 'Innovation', icon: Lightbulb, color: 'text-yellow-600' },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 8) return 'bg-green-50';
    if (score >= 6) return 'bg-yellow-50';
    if (score >= 4) return 'bg-orange-50';
    return 'bg-red-50';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Select Your Strategic Partner</h3>
        <p className="text-sm text-gray-600">
          Choose the partner that best aligns with your strategic priorities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {partners.map((partner) => {
          const scoreData = scores.find(s => s.partner.id === partner.id);
          const isSelected = selectedPartnerId === partner.id;
          const isDisabled = isSubmitted;

          return (
            <div
              key={partner.id}
              className={`relative p-6 rounded-lg border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              } ${isDisabled ? 'opacity-75 cursor-not-allowed' : ''}`}
              onClick={() => !isDisabled && onPartnerSelect(partner.id)}
            >
              {/* Selection Indicator */}
              <div className="absolute top-4 right-4">
                {isSelected ? (
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400" />
                )}
              </div>

              {/* Partner Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-800">{partner.name}</h4>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {scoreData?.score.toFixed(1)}/10
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{partner.description}</p>
              </div>

              {/* Criteria Scores */}
              <div className="space-y-2">
                {criteriaConfig.map((criteria) => {
                  const Icon = criteria.icon;
                  const score = partner.criteria[criteria.key as keyof typeof partner.criteria];
                  
                  return (
                    <div key={criteria.key} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-4 h-4 ${criteria.color}`} />
                        <span className="text-sm text-gray-700">{criteria.label}</span>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getScoreBackground(score)} ${getScoreColor(score)}`}>
                        {score}/10
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Score Breakdown */}
              {scoreData && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Weighted Score:</span>
                    <span className="font-semibold text-gray-800">
                      {scoreData.score.toFixed(2)}/10
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(scoreData.score / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Selection Status */}
              {isSelected && (
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Selected</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedPartnerId && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h4 className="font-medium text-green-800">Partner Selected</h4>
              <p className="text-sm text-green-700">
                You have selected {partners.find(p => p.id === selectedPartnerId)?.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Submission Notice */}
      {isSubmitted && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-800">Selection Submitted</h4>
              <p className="text-sm text-yellow-700">
                Your partner selection has been submitted and cannot be changed.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerSelectionInterface; 