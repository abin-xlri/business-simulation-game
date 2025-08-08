import { useSocket } from '../hooks/useSocket'
import { TrendingUp, BarChart3, DollarSign, Activity } from 'lucide-react'

export default function MarketPage() {
  const { gameState } = useSocket()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <TrendingUp className="h-8 w-8 text-primary-600" />
        <h1 className="text-3xl font-bold text-gray-900">Market Analysis</h1>
      </div>

      {gameState?.marketData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-success-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">GDP</p>
                  <p className="text-xl font-semibold text-gray-900">
                    ${gameState.marketData.globalEconomy.gdp.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-warning-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Inflation</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {(gameState.marketData.globalEconomy.inflation * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Interest Rate</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {(gameState.marketData.globalEconomy.interestRate * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-error-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-error-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Unemployment</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {(gameState.marketData.globalEconomy.unemployment * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(gameState.marketData.industries).map(([industry, data]) => (
                <div key={industry} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 capitalize">{industry}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Demand:</span>
                      <span className="font-medium">{(data as any).demand.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Supply:</span>
                      <span className="font-medium">{(data as any).supply.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Price:</span>
                      <span className="font-medium">${(data as any).averagePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Growth:</span>
                      <span className="font-medium">{((data as any).growthRate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="card text-center py-12">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Market Data</h3>
          <p className="text-gray-600">Market data will be available when a game is active.</p>
        </div>
      )}
    </div>
  )
} 

