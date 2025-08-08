import React from 'react';
import { MapPin, X, Plus } from 'lucide-react';
import { Station } from '../../../shared/types/round1';

interface StationSelectorProps {
  stations: Station[];
  selectedRoute: string[];
  onRouteChange: (route: string[]) => void;
  onStationClick?: (stationCode: string) => void;
}

const StationSelector: React.FC<StationSelectorProps> = ({
  stations,
  selectedRoute,
  onRouteChange,
  onStationClick
}) => {
  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRegionColor = (region: string) => {
    switch (region) {
      case 'URBAN': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RURAL': return 'bg-green-100 text-green-800 border-green-200';
      case 'SUBURBAN': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStationClick = (stationCode: string) => {
    if (onStationClick) {
      onStationClick(stationCode);
    } else {
      // Default behavior: add to route
      onRouteChange([...selectedRoute, stationCode]);
    }
  };

  const removeFromRoute = (index: number) => {
    const newRoute = selectedRoute.filter((_, i) => i !== index);
    onRouteChange(newRoute);
  };

  const clearRoute = () => {
    onRouteChange([]);
  };

  const getStationName = (code: string) => {
    return stations.find(s => s.code === code)?.name || code;
  };

  return (
    <div className="space-y-6">
      {/* Selected Route Display */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Selected Route</h3>
          {selectedRoute.length > 0 && (
            <button
              onClick={clearRoute}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear Route
            </button>
          )}
        </div>
        
        {selectedRoute.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No stations selected. Click on stations below to build your route.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedRoute.map((stationCode, index) => (
              <div
                key={`${stationCode}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {stationCode} - {getStationName(stationCode)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Step {index + 1} of {selectedRoute.length}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFromRoute(index)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Stations */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Stations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {stations.map((station) => (
            <div
              key={station.code}
              className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => handleStationClick(station.code)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-lg text-gray-800">
                  {station.code}
                </div>
                <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                {station.name}
              </div>
              
              <div className="flex flex-wrap gap-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskLevelColor(station.riskLevel)}`}>
                  {station.riskLevel}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRegionColor(station.region)}`}>
                  {station.region}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StationSelector; 