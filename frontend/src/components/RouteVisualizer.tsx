import React from 'react';
import { MapPin, ArrowRight, AlertTriangle } from 'lucide-react';
import { Station, RouteSegmentDetail } from '../../../shared/types/round1';

interface RouteVisualizerProps {
  stations: Station[];
  selectedRoute: string[];
  segments?: RouteSegmentDetail[];
  showBreaches?: boolean;
}

const RouteVisualizer: React.FC<RouteVisualizerProps> = ({
  stations,
  selectedRoute,
  segments = [],
  showBreaches = false
}) => {
  const getStationInfo = (code: string) => {
    return stations.find(s => s.code === code);
  };

  const getSegmentInfo = (fromCode: string, toCode: string) => {
    return segments.find(s => s.from === fromCode && s.to === toCode);
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return 'bg-green-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'HIGH': return 'bg-orange-500';
      case 'CRITICAL': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (selectedRoute.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold mb-2">No Route Selected</h3>
          <p>Select stations to visualize your delivery route</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Route Visualization</h3>
      
      <div className="space-y-4">
        {selectedRoute.map((stationCode, index) => {
          const station = getStationInfo(stationCode);
          const isLast = index === selectedRoute.length - 1;
          const nextStationCode = selectedRoute[index + 1];
          const segment = nextStationCode ? getSegmentInfo(stationCode, nextStationCode) : null;

          return (
            <div key={`${stationCode}-${index}`}>
              {/* Station Node */}
              <div className="flex items-center space-x-4">
                {/* Station Circle */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      station ? getRiskLevelColor(station.riskLevel) : 'bg-gray-500'
                    }`}>
                      {stationCode}
                    </div>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                    {isLast && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Station Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-800">
                      {stationCode} - {station?.name || 'Unknown Station'}
                    </h4>
                    {station && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        station.riskLevel === 'LOW' ? 'bg-green-100 text-green-800' :
                        station.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        station.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {station.riskLevel}
                      </span>
                    )}
                  </div>
                  {station && (
                    <p className="text-sm text-gray-600">
                      {station.region} • Step {index + 1} of {selectedRoute.length}
                    </p>
                  )}
                </div>
              </div>

              {/* Connection Line */}
              {!isLast && (
                <div className="ml-6 mt-2 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 h-px bg-gray-300 relative">
                      {segment && showBreaches && segment.isBreach && (
                        <div className="absolute inset-0 bg-red-500 h-1 rounded-full"></div>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    {segment && (
                      <div className="text-xs text-gray-500">
                        {segment.distance.toFixed(1)}km • {segment.time.toFixed(1)}h
                        {segment.isBreach && showBreaches && (
                          <div className="flex items-center space-x-1 text-red-600">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Breach</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Route Summary */}
      {segments.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Total Distance</div>
              <div className="font-semibold">
                {segments.reduce((sum, s) => sum + s.distance, 0).toFixed(1)} km
              </div>
            </div>
            <div>
              <div className="text-gray-500">Total Time</div>
              <div className="font-semibold">
                {segments.reduce((sum, s) => sum + s.time, 0).toFixed(1)} h
              </div>
            </div>
            <div>
              <div className="text-gray-500">Segments</div>
              <div className="font-semibold">{segments.length}</div>
            </div>
            <div>
              <div className="text-gray-500">Breaches</div>
              <div className="font-semibold text-red-600">
                {segments.filter(s => s.isBreach).length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteVisualizer; 