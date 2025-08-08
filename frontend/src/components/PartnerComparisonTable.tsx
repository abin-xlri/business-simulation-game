import React from 'react';
import { 
  Users, 
  Brain, 
  DollarSign, 
  Shield, 
  TrendingUp, 
  Lightbulb,
  Star
} from 'lucide-react';
import { Partner, PartnerScore } from '../../../shared/types/partnerSelection';

interface PartnerComparisonTableProps {
  partners: Partner[];
  scores: PartnerScore[];
  priorities: {
    reach: number;
    expertise: number;
    cost: number;
    reliability: number;
    scalability: number;
    innovation: number;
  };
}

const PartnerComparisonTable: React.FC<PartnerComparisonTableProps> = ({
  partners,
  scores,
  priorities
}) => {
  const criteriaConfig = [
    { key: 'reach', label: 'Reach', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { key: 'expertise', label: 'Expertise', icon: Brain, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { key: 'cost', label: 'Cost Efficiency', icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-50' },
    { key: 'reliability', label: 'Reliability', icon: Shield, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { key: 'scalability', label: 'Scalability', icon: TrendingUp, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { key: 'innovation', label: 'Innovation', icon: Lightbulb, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    if (score >= 4) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getWeightedScoreColor = (score: number) => {
    if (score >= 2) return 'text-green-600 bg-green-50';
    if (score >= 1.5) return 'text-yellow-600 bg-yellow-50';
    if (score >= 1) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Partner Comparison</h3>
        <p className="text-sm text-gray-600 mt-1">Compare partners across all strategic criteria</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Criteria
              </th>
              {partners.map((partner) => (
                <th key={partner.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex flex-col items-center">
                    <span className="font-semibold text-gray-700">{partner.name}</span>
                    <span className="text-xs text-gray-500 mt-1">Partner {partner.id}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {criteriaConfig.map((criteria) => {
              const Icon = criteria.icon;
              const priority = priorities[criteria.key as keyof typeof priorities];
              
              return (
                <tr key={criteria.key}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${criteria.bgColor}`}>
                        <Icon className={`w-4 h-4 ${criteria.color}`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{criteria.label}</div>
                        <div className="text-xs text-gray-500">Weight: {(priority * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  </td>
                  {partners.map((partner) => {
                    const score = partner.criteria[criteria.key as keyof typeof partner.criteria];
                    const weightedScore = score * priority;
                    
                    return (
                      <td key={`${partner.id}-${criteria.key}`} className="px-6 py-4 text-center">
                        <div className="space-y-1">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(score)}`}>
                            {score}/10
                          </div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getWeightedScoreColor(weightedScore)}`}>
                            {weightedScore.toFixed(2)}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            
            {/* Total Score Row */}
            <tr className="bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <Star className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Total Score</div>
                    <div className="text-xs text-gray-500">Weighted Average</div>
                  </div>
                </div>
              </td>
              {scores.map((scoreData) => (
                <td key={`total-${scoreData.partner.id}`} className="px-6 py-4 text-center">
                  <div className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-bold ${getWeightedScoreColor(scoreData.score)}`}>
                    {scoreData.score.toFixed(2)}/10
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Strategic Priorities Summary */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Strategic Priorities</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {criteriaConfig.map((criteria) => {
            const Icon = criteria.icon;
            const priority = priorities[criteria.key as keyof typeof priorities];
            
            return (
              <div key={criteria.key} className="flex items-center space-x-2 text-xs">
                <Icon className={`w-3 h-3 ${criteria.color}`} />
                <span className="text-gray-600">{criteria.label}:</span>
                <span className="font-medium text-gray-800">{(priority * 100).toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PartnerComparisonTable; 