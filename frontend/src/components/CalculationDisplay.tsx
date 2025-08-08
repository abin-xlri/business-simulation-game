import React from 'react';
import { 
  Clock, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Calculator,
  IndianRupee
} from 'lucide-react';
import { RouteCalculationResult } from '../../../shared/types/round1';

interface CalculationDisplayProps {
  calculation: RouteCalculationResult | null;
  isLoading?: boolean;
}

const CalculationDisplay: React.FC<CalculationDisplayProps> = ({
  calculation,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <Calculator className="w-5 h-5 animate-spin" />
          <span>Calculating route...</span>
        </div>
      </div>
    );
  }

  if (!calculation) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <Calculator className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-lg font-semibold mb-2">No Calculation Available</h3>
          <p>Select a route to see calculation results</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Route Calculation</h3>
      
      {/* Net Profit - Main Display */}
      <div className="mb-6">
        <div className={`text-center p-4 rounded-lg border-2 ${
          calculation.netProfit >= 0 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <IndianRupee className={`w-6 h-6 ${
              calculation.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
            }`} />
            <span className="text-sm font-medium text-gray-600">Net Profit</span>
          </div>
          <div className={`text-3xl font-bold ${
            calculation.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(calculation.netProfit)}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Distance & Time */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Total Distance</span>
            </div>
            <span className="font-semibold text-gray-800">
              {calculation.totalDistance.toFixed(1)} km
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Total Time</span>
            </div>
            <span className="font-semibold text-gray-800">
              {formatTime(calculation.totalTime)}
            </span>
          </div>
        </div>

        {/* Revenue & Costs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Base Revenue</span>
            </div>
            <span className="font-semibold text-green-600">
              {formatCurrency(calculation.baseRevenue)}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-gray-700">Operating Costs</span>
            </div>
            <span className="font-semibold text-red-600">
              {formatCurrency(calculation.operatingCosts)}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800">Detailed Breakdown</h4>
        
        {/* Regional Modifier */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Regional Modifier</span>
          <span className={`font-semibold ${
            calculation.regionalModifier >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {calculation.regionalModifier >= 0 ? '+' : ''}{formatCurrency(calculation.regionalModifier)}
          </span>
        </div>

        {/* Cold Chain Breaches */}
        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">
              Cold Chain Breaches ({calculation.coldChainBreaches})
            </span>
          </div>
          <span className="font-semibold text-orange-600">
            -{formatCurrency(calculation.penalties)}
          </span>
        </div>
      </div>

      {/* Performance Indicators */}
      {calculation.coldChainBreaches > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <div className="font-medium text-red-800">Cold Chain Breaches Detected</div>
              <div className="text-sm text-red-600">
                {calculation.coldChainBreaches} segment(s) exceed the 2-hour limit
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Efficiency Score */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Route Efficiency</span>
          <div className="flex items-center space-x-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  calculation.netProfit >= 0 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ 
                  width: `${Math.min(100, Math.max(0, (calculation.netProfit / 500000) * 100))}%` 
                }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-800">
              {Math.round(Math.min(100, Math.max(0, (calculation.netProfit / 500000) * 100)))}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculationDisplay; 
