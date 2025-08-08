import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GroupApiService } from '../services/groupApi';
import apiClient from '../services/apiClient';

import Timer from '../components/Timer';
import GroupChat from '../components/GroupChat';

interface MarketCountry { id: string; name: string; targetGroup: string; regulatoryClimate: string; infraWorkforce: string; govtLeverage: string; commercialRisk: string; projectedRevenue: string; strategicNotes: string[]; }

export default function Round2MarketSelectionPage() {
  const { sessionId } = useParams();
  const [countries, setCountries] = useState<MarketCountry[]>([]);
  const navigate = useNavigate();
  
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [timeLeft] = useState(1200); // 20 minutes
  const [isVoting, setIsVoting] = useState(false);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [votes, setVotes] = useState<Record<string, string[]>>({});

  useEffect(() => {
    GroupApiService.getMarketData().then(res => setCountries(res.countries as any));
  }, []);

  const handleCountryToggle = (countryId: string) => {
    setSelectedCountries(prev => 
      prev.includes(countryId) 
        ? prev.filter(id => id !== countryId)
        : [...prev, countryId]
    );
  };

  const handleVote = async () => {
    if (selectedCountries.length === 0) return;
    setIsVoting(true);
    // Persist via API for reliability
    try {
      await apiClient.post('/groups/market/decision', {
        rankings: selectedCountries,
        sessionId
      });
    } finally {
      // no-op
    }
  };

  const handleFinalizeDecision = async () => {
    if (selectedCountries.length === 0) return;
    await apiClient.post('/groups/market/decision', {
      rankings: selectedCountries,
      sessionId
    });
    navigate(`/round2/budget-allocation/${sessionId}`);
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Round 2: Market Selection</h1>
              <p className="text-gray-600 mt-2">
                Select the best market for TerraCare's ASEAN expansion
              </p>
            </div>
            <Timer 
              timeLeft={timeLeft}
              onTimeUp={() => navigate(`/round2/budget-allocation/${sessionId}`)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Market Countries */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Markets</h2>
              
              <div className="space-y-4">
                {countries.map((country) => (
                  <div 
                    key={country.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedCountries.includes(country.id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleCountryToggle(country.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {country.name}
                      </h3>
                      <div className="text-sm text-gray-500">
                        Revenue: {country.projectedRevenue}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Target Group:</span>
                        <p className="text-gray-600">{country.targetGroup}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Regulatory:</span>
                        <p className="text-gray-600">{country.regulatoryClimate}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Infrastructure:</span>
                        <p className="text-gray-600">{country.infraWorkforce}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Risk:</span>
                        <p className="text-gray-600">{country.commercialRisk}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <span className="font-medium text-gray-700">Strategic Notes:</span>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        {country.strategicNotes.map((note, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Selected: {selectedCountries.length} countries
                </div>
                <button
                  onClick={handleVote}
                  disabled={selectedCountries.length === 0 || isVoting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isVoting ? 'Vote Submitted' : 'Submit Vote'}
                </button>
              </div>
            </div>
          </div>

          {/* Group Chat and Voting */}
          <div className="space-y-6">
            {/* Group Members */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Members</h3>
              <div className="space-y-2">
                {groupMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <span className="text-gray-700">{member.name}</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      votes[member.id] ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {votes[member.id] ? 'Voted' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Group Chat */}
            <GroupChat sessionId={sessionId!} taskType="MARKET_SELECTION" />

            {/* Final Decision */}
            {Object.keys(votes).length === groupMembers.length && groupMembers.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Final Decision</h3>
                <button
                  onClick={handleFinalizeDecision}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Finalize Market Selection
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
